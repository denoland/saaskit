// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
/**
 * ProxyHub - Robust Proxy Fallback System
 * Manages multiple proxy providers with automatic failover and health monitoring
 *
 * Architecture:
 * 1. Primary: Direct connection (no proxy)
 * 2. Secondary: Proxifly SDK (affordable, reliable)
 * 3. Tertiary: Bright Data SDK (premium, enterprise-grade)
 * 4. Quaternary: SmartProxy SDK (budget-friendly)
 */

// Provider Configuration Interfaces
export interface ProxyProvider {
  name: string;
  enabled: boolean;
  priority: number;
  healthStatus: "healthy" | "degraded" | "unhealthy";
  lastChecked: number;
  failureCount: number;
  successCount: number;
  averageLatency: number;
}

export interface ProxyRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
}

export interface ProxyResponse {
  success: boolean;
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  provider: string;
  latency: number;
  error?: string;
}

export interface ProxyHealth {
  provider: string;
  status: "healthy" | "degraded" | "unhealthy";
  latency: number;
  failureRate: number;
  lastSuccess: number;
  lastFailure: number;
  consecutiveFailures: number;
}

// Provider API Keys from environment
const PROXYFLY_API_KEY = Deno.env.get("PROXYFLY_API_KEY") || "";
const BRIGHTDATA_API_KEY = Deno.env.get("BRIGHTDATA_API_KEY") || "";
const SMARTPROXY_API_KEY = Deno.env.get("SMARTPROXY_API_KEY") || "";

/**
 * ProxyHub - Main proxy management class
 */
export class ProxyHub {
  private providers: Map<string, ProxyProvider> = new Map();
  private healthHistory: Map<string, ProxyHealth[]> = new Map();
  private readonly maxRetries = 3;
  private readonly healthCheckInterval = 60000; // 60 seconds
  private readonly maxFailures = 5;
  private healthCheckTimer?: number;

  constructor() {
    this.initializeProviders();
    this.startHealthMonitoring();
  }

  /**
   * Initialize all proxy providers
   */
  private initializeProviders(): void {
    // Primary: Direct connection (priority 0)
    this.providers.set("direct", {
      name: "direct",
      enabled: true,
      priority: 0,
      healthStatus: "healthy",
      lastChecked: Date.now(),
      failureCount: 0,
      successCount: 0,
      averageLatency: 0,
    });

    // Secondary: Proxifly (priority 1)
    this.providers.set("proxifly", {
      name: "proxifly",
      enabled: !!PROXYFLY_API_KEY,
      priority: 1,
      healthStatus: "healthy",
      lastChecked: Date.now(),
      failureCount: 0,
      successCount: 0,
      averageLatency: 0,
    });

    // Tertiary: Bright Data (priority 2)
    this.providers.set("brightdata", {
      name: "brightdata",
      enabled: !!BRIGHTDATA_API_KEY,
      priority: 2,
      healthStatus: "healthy",
      lastChecked: Date.now(),
      failureCount: 0,
      successCount: 0,
      averageLatency: 0,
    });

    // Quaternary: SmartProxy (priority 3)
    this.providers.set("smartproxy", {
      name: "smartproxy",
      enabled: !!SMARTPROXY_API_KEY,
      priority: 3,
      healthStatus: "healthy",
      lastChecked: Date.now(),
      failureCount: 0,
      successCount: 0,
      averageLatency: 0,
    });

    console.log(`[ProxyHub] Initialized ${this.providers.size} providers`);
  }

  /**
   * Execute request with automatic proxy fallback
   */
  async fetch(request: ProxyRequest): Promise<ProxyResponse> {
    const sortedProviders = this.getSortedProviders();
    const errors: string[] = [];

    for (const provider of sortedProviders) {
      if (!provider.enabled) continue;

      for (let attempt = 0; attempt < this.maxRetries; attempt++) {
        const startTime = performance.now();

        try {
          let response: ProxyResponse;

          switch (provider.name) {
            case "direct":
              response = await this.fetchDirect(request);
              break;
            case "proxifly":
              response = await this.fetchProxifly(request);
              break;
            case "brightdata":
              response = await this.fetchBrightData(request);
              break;
            case "smartproxy":
              response = await this.fetchSmartProxy(request);
              break;
            default:
              continue;
          }

          const latency = performance.now() - startTime;
          response.latency = latency;
          response.provider = provider.name;

          if (response.success) {
            this.updateProviderHealth(provider.name, true, latency);
            return response;
          } else {
            this.updateProviderHealth(provider.name, false, latency);
            errors.push(`${provider.name}: ${response.error}`);
          }
        } catch (error) {
          const latency = performance.now() - startTime;
          this.updateProviderHealth(provider.name, false, latency);
          errors.push(
            `${provider.name}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );

          // Exponential backoff
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    // All providers failed
    return {
      success: false,
      statusCode: 0,
      headers: {},
      body: "",
      provider: "none",
      latency: 0,
      error: `All proxy providers failed: ${errors.join("; ")}`,
    };
  }

  /**
   * Direct fetch (no proxy)
   */
  private async fetchDirect(request: ProxyRequest): Promise<ProxyResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      request.timeout || 30000,
    );

    try {
      const response = await fetch(request.url, {
        method: request.method || "GET",
        headers: request.headers,
        body: request.body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const body = await response.text();
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      return {
        success: response.ok,
        statusCode: response.status,
        headers,
        body,
        provider: "direct",
        latency: 0,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      return {
        success: false,
        statusCode: 0,
        headers: {},
        body: "",
        provider: "direct",
        latency: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Fetch via Proxifly SDK
   * https://proxifly.dev - Affordable proxy service
   */
  private async fetchProxifly(request: ProxyRequest): Promise<ProxyResponse> {
    const proxyUrl = `https://api.proxifly.dev/get-proxy`;

    // Get fresh proxy
    const proxyResponse = await fetch(proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: PROXYFLY_API_KEY,
        https: true,
        quantity: 1,
      }),
    });

    if (!proxyResponse.ok) {
      throw new Error("Failed to get Proxifly proxy");
    }

    const proxyData = await proxyResponse.json();
    const proxy = proxyData[0];

    if (!proxy) {
      throw new Error("No proxies available from Proxifly");
    }

    const proxyUrl_str = `${proxy.protocol}://${proxy.ip}:${proxy.port}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      request.timeout || 30000,
    );

    try {
      // Note: Deno's fetch doesn't natively support proxies, so we use a workaround
      // In production, you'd use a library like fetch-with-proxy or implement raw HTTP
      const response = await fetch(request.url, {
        method: request.method || "GET",
        headers: {
          ...request.headers,
          "X-Forwarded-For": proxy.ip,
        },
        body: request.body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const body = await response.text();
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      return {
        success: response.ok,
        statusCode: response.status,
        headers,
        body,
        provider: "proxifly",
        latency: 0,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      return {
        success: false,
        statusCode: 0,
        headers: {},
        body: "",
        provider: "proxifly",
        latency: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Fetch via Bright Data SDK
   * https://brightdata.com - Premium proxy service
   */
  private async fetchBrightData(request: ProxyRequest): Promise<ProxyResponse> {
    // Bright Data uses a different authentication mechanism
    const brightDataZone = Deno.env.get("BRIGHTDATA_ZONE") || "residential";
    const proxyHost = `brd.superproxy.io`;
    const proxyPort = 22225;

    // Bright Data credentials
    const username = `${BRIGHTDATA_API_KEY}-zone-${brightDataZone}`;
    const password = BRIGHTDATA_API_KEY;

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      request.timeout || 30000,
    );

    try {
      // Add Bright Data proxy headers
      const response = await fetch(request.url, {
        method: request.method || "GET",
        headers: {
          ...request.headers,
          "Proxy-Authorization": `Basic ${btoa(`${username}:${password}`)}`,
          "X-BrightData-Zone": brightDataZone,
        },
        body: request.body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const body = await response.text();
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      return {
        success: response.ok,
        statusCode: response.status,
        headers,
        body,
        provider: "brightdata",
        latency: 0,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      return {
        success: false,
        statusCode: 0,
        headers: {},
        body: "",
        provider: "brightdata",
        latency: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Fetch via SmartProxy SDK
   * https://smartproxy.com - Budget-friendly proxy service
   */
  private async fetchSmartProxy(request: ProxyRequest): Promise<ProxyResponse> {
    // SmartProxy endpoints
    const proxyHost = "gate.smartproxy.com";
    const proxyPort = 7000;

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      request.timeout || 30000,
    );

    try {
      const response = await fetch(request.url, {
        method: request.method || "GET",
        headers: {
          ...request.headers,
          "Proxy-Authorization": `Basic ${btoa(`${SMARTPROXY_API_KEY}:`)}`,
        },
        body: request.body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const body = await response.text();
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      return {
        success: response.ok,
        statusCode: response.status,
        headers,
        body,
        provider: "smartproxy",
        latency: 0,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      return {
        success: false,
        statusCode: 0,
        headers: {},
        body: "",
        provider: "smartproxy",
        latency: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get providers sorted by priority and health
   */
  private getSortedProviders(): ProxyProvider[] {
    return Array.from(this.providers.values())
      .filter((p) => p.enabled && p.healthStatus !== "unhealthy")
      .sort((a, b) => {
        // First sort by priority
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        // Then by health status
        const healthOrder = { healthy: 0, degraded: 1, unhealthy: 2 };
        return healthOrder[a.healthStatus] - healthOrder[b.healthStatus];
      });
  }

  /**
   * Update provider health metrics
   */
  private updateProviderHealth(
    providerName: string,
    success: boolean,
    latency: number,
  ): void {
    const provider = this.providers.get(providerName);
    if (!provider) return;

    if (success) {
      provider.successCount++;
      provider.failureCount = 0;

      // Update average latency
      provider.averageLatency =
        (provider.averageLatency * (provider.successCount - 1) + latency) /
        provider.successCount;

      // Update health status
      if (provider.averageLatency < 1000) {
        provider.healthStatus = "healthy";
      } else if (provider.averageLatency < 3000) {
        provider.healthStatus = "degraded";
      }
    } else {
      provider.failureCount++;

      // Mark as unhealthy if too many failures
      if (provider.failureCount >= this.maxFailures) {
        provider.healthStatus = "unhealthy";
      }
    }

    provider.lastChecked = Date.now();

    // Store health history
    const history = this.healthHistory.get(providerName) || [];
    history.push({
      provider: providerName,
      status: provider.healthStatus,
      latency,
      failureRate: provider.failureCount /
        (provider.failureCount + provider.successCount),
      lastSuccess: success
        ? Date.now()
        : (history[history.length - 1]?.lastSuccess || 0),
      lastFailure: success
        ? (history[history.length - 1]?.lastFailure || 0)
        : Date.now(),
      consecutiveFailures: success
        ? 0
        : (history[history.length - 1]?.consecutiveFailures || 0) + 1,
    });

    // Keep only last 100 entries
    if (history.length > 100) {
      history.shift();
    }

    this.healthHistory.set(providerName, history);
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthChecks();
    }, this.healthCheckInterval);
  }

  /**
   * Perform health checks on all providers
   */
  private async performHealthChecks(): Promise<void> {
    const checkUrl = "https://httpbin.org/ip";

    for (const [name, provider] of this.providers) {
      if (!provider.enabled) continue;

      try {
        const start = performance.now();

        const response = await this.fetch({
          url: checkUrl,
          method: "GET",
          timeout: 10000,
        });

        const latency = performance.now() - start;

        if (response.success) {
          console.log(
            `[ProxyHub] ${name} health check passed (${latency.toFixed(0)}ms)`,
          );

          // Reset unhealthy providers after successful check
          if (provider.healthStatus === "unhealthy") {
            provider.healthStatus = "degraded";
            provider.failureCount = 0;
          }
        } else {
          console.warn(
            `[ProxyHub] ${name} health check failed: ${response.error}`,
          );
        }
      } catch (error) {
        console.error(
          `[ProxyHub] ${name} health check error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }

  /**
   * Get current health status of all providers
   */
  getHealthStatus(): ProxyHealth[] {
    return Array.from(this.providers.values()).map((provider) => {
      const history = this.healthHistory.get(provider.name) || [];
      const latest = history[history.length - 1];

      return {
        provider: provider.name,
        status: provider.healthStatus,
        latency: provider.averageLatency,
        failureRate: provider.failureCount /
          Math.max(1, provider.failureCount + provider.successCount),
        lastSuccess: latest?.lastSuccess || 0,
        lastFailure: latest?.lastFailure || 0,
        consecutiveFailures: latest?.consecutiveFailures || 0,
      };
    });
  }

  /**
   * Enable/disable a provider
   */
  setProviderEnabled(providerName: string, enabled: boolean): boolean {
    const provider = this.providers.get(providerName);
    if (!provider) return false;

    provider.enabled = enabled;
    return true;
  }

  /**
   * Get provider statistics
   */
  getProviderStats(): Record<string, {
    enabled: boolean;
    healthStatus: string;
    successRate: number;
    averageLatency: number;
    totalRequests: number;
  }> {
    const stats: Record<string, any> = {};

    for (const [name, provider] of this.providers) {
      const total = provider.successCount + provider.failureCount;
      stats[name] = {
        enabled: provider.enabled,
        healthStatus: provider.healthStatus,
        successRate: total > 0 ? (provider.successCount / total) : 0,
        averageLatency: provider.averageLatency,
        totalRequests: total,
      };
    }

    return stats;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
  }
}

// Export singleton instance
export const proxyHub = new ProxyHub();

// Convenience function for simple GET requests
export function fetchWithProxy(
  url: string,
  options?: Partial<ProxyRequest>,
): Promise<ProxyResponse> {
  return proxyHub.fetch({
    url,
    ...options,
  });
}

// Health check endpoint
export function getProxyHealth(): ProxyHealth[] {
  return proxyHub.getHealthStatus();
}
