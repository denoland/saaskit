// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
/**
 * Monitoring Middleware
 * Logs requests, responses, and performance metrics
 */

import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { generateRequestId, logger } from "@/utils/logger.ts";
import type { State } from "@/plugins/session.ts";

export function monitoringMiddleware(): (
  req: Request,
  ctx: MiddlewareHandlerContext,
) => Response | Promise<Response> {
  return async (req: Request, ctx: MiddlewareHandlerContext) => {
    const startTime = Date.now();
    const requestId = generateRequestId();

    // Set request ID in logger
    logger.setRequestId(requestId);

    // Extract context info
    const url = new URL(req.url);
    const userId = (ctx.state as State)?.user?.login;
    const ip = req.headers.get("CF-Connecting-IP") ||
      req.headers.get("X-Forwarded-For") ||
      req.headers.get("X-Real-IP") ||
      req.headers.get("Forwarded")?.split(",")[0]?.trim() ||
      "unknown";

    // Log incoming request
    logger.logRequest(req, { userId, ip });

    try {
      // Process the request
      const response = await ctx.next();

      // Calculate duration
      const duration = Date.now() - startTime;

      // Log response
      logger.logResponse(req, response.status, duration, { userId, ip });

      // Add request ID to response headers for debugging
      if (response instanceof Response) {
        response.headers.set("X-Request-ID", requestId);
      }

      return response;
    } catch (error) {
      // Calculate duration for error case
      const duration = Date.now() - startTime;

      // Log error
      logger.error("Request failed", error as Error, {
        method: req.method,
        path: url.pathname,
        userId,
        ip,
        duration,
      });

      // Re-throw to let error handling middleware deal with it
      throw error;
    }
  };
}
