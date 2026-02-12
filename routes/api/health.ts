// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
/// <reference lib="deno.unstable" />
/**
 * Health Check Endpoint
 * Provides system health status for monitoring and load balancers
 */

import { successResponse } from "@/utils/api_response.ts";
import type { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async GET() {
    // Basic health checks
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "2.0.0",
      uptime: Math.floor(performance.now() / 1000),
      services: {
        database: await checkDatabaseHealth(),
        ai_providers: await checkAIProvidersHealth(),
        external_apis: await checkExternalAPIsHealth(),
      },
    };

    // Determine overall status
    const hasUnhealthyService = Object.values(health.services).some(
      (service: { status: string }) => service.status !== "healthy",
    );

    if (hasUnhealthyService) {
      health.status = "degraded";
    }

    return new Response(JSON.stringify(successResponse(health)), {
      headers: { "Content-Type": "application/json" },
    });
  },
};

async function checkDatabaseHealth(): Promise<
  { status: string; latency?: number; error?: string }
> {
  try {
    const start = Date.now();
    const kv = await Deno.openKv();
    await kv.get(["health_check"]);
    const latency = Date.now() - start;

    return { status: "healthy", latency };
  } catch (error) {
    return { status: "unhealthy", error: (error as Error).message };
  }
}

async function checkAIProvidersHealth(): Promise<
  { status: string; providers?: Record<string, string>; error?: string }
> {
  const providers = {
    cerebras: "unknown",
    groq: "unknown",
    openai: "unknown",
  };

  try {
    // Check Cerebras
    const cerebrasKey = Deno.env.get("CEREBRAS_API_KEY");
    providers.cerebras = cerebrasKey ? "configured" : "missing_key";

    // Check Groq
    const groqKey = Deno.env.get("GROQ_API_KEY");
    providers.groq = groqKey ? "configured" : "missing_key";

    // Check OpenAI
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    providers.openai = openaiKey ? "configured" : "missing_key";

    const allConfigured = Object.values(providers).every((status) =>
      status === "configured"
    );
    return Promise.resolve({
      status: allConfigured ? "healthy" : "degraded",
      providers,
    });
  } catch (error) {
    return Promise.resolve({ status: "unhealthy", error: (error as Error).message });
  }
}

async function checkExternalAPIsHealth(): Promise<
  { status: string; checks?: Record<string, unknown>; error?: string }
> {
  const checks = {
    youtube_api: "unknown",
    stripe_api: "unknown",
  };

  try {
    // Check if required environment variables are set
    checks.youtube_api = Deno.env.get("YOUTUBE_API_KEY")
      ? "configured"
      : "missing_key";
    checks.stripe_api = Deno.env.get("STRIPE_SECRET_KEY")
      ? "configured"
      : "missing_key";

    const allConfigured = Object.values(checks).every((status) =>
      status === "configured"
    );
    return Promise.resolve({
      status: allConfigured ? "healthy" : "degraded",
      checks,
    });
  } catch (error) {
    return Promise.resolve({ status: "unhealthy", error: (error as Error).message });
  }
}
