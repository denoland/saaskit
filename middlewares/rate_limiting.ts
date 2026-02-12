// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
/// <reference lib="deno.unstable" />
/**
 * Rate Limiting Middleware
 * Implements sliding window rate limiting with Redis/Deno KV backend
 */

import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { validateAPIKey } from "@/utils/api_keys.ts";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 100, // 100 requests per hour for free tier
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

const PREMIUM_CONFIG: RateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10000, // 10,000 requests per hour for premium
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

const ENTERPRISE_CONFIG: RateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 100000, // 100,000 requests per hour for enterprise
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

/**
 * Get rate limit configuration based on user tier
 */
function getRateLimitConfig(userTier?: string): RateLimitConfig {
  switch (userTier?.toLowerCase()) {
    case "premium":
      return PREMIUM_CONFIG;
    case "enterprise":
      return ENTERPRISE_CONFIG;
    default:
      return DEFAULT_CONFIG;
  }
}

/**
 * Generate rate limit key for user/IP
 */
function getRateLimitKey(identifier: string): string {
  return `ratelimit:${identifier}`;
}

/**
 * Check if request should be rate limited
 */
async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const key = getRateLimitKey(identifier);
  const now = Date.now();

  try {
    // Get current rate limit data from KV
    const kv = await Deno.openKv();
    const entry = await kv.get<RateLimitEntry>([key]);

    let count = 0;
    let resetTime = now + config.windowMs;

    if (entry.value) {
      // Check if window has expired
      if (now > entry.value.resetTime) {
        count = 1;
        resetTime = now + config.windowMs;
      } else {
        count = entry.value.count + 1;
        resetTime = entry.value.resetTime;
      }
    } else {
      count = 1;
    }

    // Check if limit exceeded
    const allowed = count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - count);

    // Update KV store
    await kv.set([key], {
      count: allowed ? count : entry.value?.count || 0,
      resetTime,
    }, {
      expireIn: config.windowMs / 1000, // TTL in seconds
    });

    return { allowed, remaining, resetTime };
  } catch (error) {
    console.error("Rate limiting error:", error);
    // Allow request on error to avoid blocking users
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: now + config.windowMs,
    };
  }
}

/**
 * Rate limiting middleware
 */
export function rateLimitingMiddleware(): (
  req: Request,
  ctx: MiddlewareHandlerContext,
) => Response | Promise<Response> {
  return async (req: Request, ctx: MiddlewareHandlerContext) => {
    // Skip rate limiting for non-API routes
    if (!req.url.includes("/api/")) {
      return ctx.next();
    }

    // Get user identifier and tier
    let identifier = "anonymous";
    let userTier = "free";
    let apiKeyData = null;

    // Check for API key in header
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const apiKey = authHeader.replace("Bearer ", "");

      // Validate API key
      apiKeyData = await validateAPIKey(apiKey);
      if (apiKeyData) {
        identifier = `apikey:${apiKeyData.id}`;
        userTier = apiKeyData.rateLimitTier;
      } else {
        // Invalid API key
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: "INVALID_API_KEY",
              message: "Invalid API key provided",
            },
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    } else if (ctx.state.user) {
      const user = ctx.state.user as { login: string; tier?: string };
      identifier = `user:${user.login}`;
      userTier = user.tier || "free";
    } else {
      // Use IP address as fallback for anonymous users
      const ip = req.headers.get("CF-Connecting-IP") ||
        req.headers.get("X-Forwarded-For") ||
        req.headers.get("X-Real-IP") ||
        "unknown";
      identifier = `ip:${ip}`;
    }
    const config = getRateLimitConfig(userTier);

    // Check rate limit
    const { allowed, remaining, resetTime } = await checkRateLimit(
      identifier,
      config,
    );

    // Set rate limit headers
    const response = await ctx.next();

    if (response instanceof Response) {
      response.headers.set("X-RateLimit-Limit", config.maxRequests.toString());
      response.headers.set("X-RateLimit-Remaining", remaining.toString());
      response.headers.set(
        "X-RateLimit-Reset",
        Math.floor(resetTime / 1000).toString(),
      );

      if (!allowed) {
        response.headers.set(
          "Retry-After",
          Math.ceil((resetTime - Date.now()) / 1000).toString(),
        );
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: "RATE_LIMITED",
              message: "Rate limit exceeded. Please try again later.",
              details: {
                limit: config.maxRequests,
                remaining: 0,
                resetTime: new Date(resetTime).toISOString(),
              },
            },
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              ...Object.fromEntries(response.headers.entries()),
            },
          },
        );
      }
    }

    return response;
  };
}
