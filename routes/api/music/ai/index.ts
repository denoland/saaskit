// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
/**
 * AI-Enhanced Music API
 * Centralized route handling for all AI-powered music endpoints
 */

import {
  errorResponse,
  successResponse,
  toJson,
} from "@/utils/api_response.ts";
import type { Handlers, RouteContext } from "$fresh/server.ts";

// Import all AI endpoint handlers
import { handler as recommendationsHandler } from "./recommendations.ts";
import { handler as playlistsHandler } from "./playlists.ts";
import { handler as analysisHandler } from "./analysis.ts";
// import { handler as searchHandler } from "./search.ts"; // Temporarily disabled
import { handler as contextHandler } from "./context.ts";

// Re-export all handlers for direct imports
export {
  analysisHandler as analysis,
  contextHandler as context,
  playlistsHandler as playlists,
  recommendationsHandler as recommendations,
  // searchHandler as search // Temporarily disabled
};

/**
 * GET /api/music/ai
 * Overview of available AI endpoints with status
 */

/**
 * POST /api/music/ai
 * Route POST requests to the appropriate handler
 */

/**
 * DELETE /api/music/ai
 * Route DELETE requests to the appropriate handler
 */
export async function DELETE(req: Request, ctx: RouteContext) {
  const url = new URL(req.url);
  const path = url.pathname.split("/ai/")[1];

  if (!path) {
    const response = errorResponse(
      "INVALID_REQUEST",
      "Specify an AI endpoint for DELETE requests",
    );
    return toJson(response, 400);
  }

  if (path.startsWith("playlists")) {
    return await playlistsHandler.DELETE(req, ctx);
  }

  const response = errorResponse(
    "METHOD_NOT_ALLOWED",
    "DELETE not supported for this AI endpoint",
  );
  return toJson(response, 405);
}
export const handler: Handlers = {
  async GET(req: Request, ctx: RouteContext) {
    const url = new URL(req.url);

    // If accessing a specific AI endpoint, route to the appropriate handler
    const path = url.pathname.split("/ai/")[1];

    if (path) {
      if (path.startsWith("recommendations")) {
        return await recommendationsHandler.GET(req, ctx);
      }

      if (path.startsWith("playlists")) {
        return await playlistsHandler.GET(req, ctx);
      }

      if (path.startsWith("analysis")) {
        return await analysisHandler.GET(req, ctx);
      }

      // if (path.startsWith("search")) {
      //   return await searchHandler.GET(req, ctx);
      // }

      if (path.startsWith("context")) {
        return await contextHandler.GET(req, ctx);
      }

      // If path doesn't match any known endpoint
      const response = errorResponse(
        "NOT_FOUND",
        "AI endpoint not found",
      );
      return toJson(response, 404);
    }

    // If accessing the root AI endpoint, return overview of available endpoints
    const aiEndpoints = [
      {
        path: "/api/music/ai/recommendations",
        description: "AI-powered music recommendations",
        methods: ["GET", "POST"],
        requiresAuth: true,
        queryParams: ["type", "seed", "limit"],
      },
      {
        path: "/api/music/ai/playlists",
        description: "AI-generated playlist management",
        methods: ["GET", "POST", "DELETE"],
        requiresAuth: true,
        queryParams: ["action"],
      },
      {
        path: "/api/music/ai/analysis",
        description: "Advanced music analysis and insights",
        methods: ["GET"],
        requiresAuth: false,
        queryParams: ["type", "videoId", "refresh"],
      },
      {
        path: "/api/music/ai/search",
        description: "Smart search with semantic understanding",
        methods: ["GET"],
        requiresAuth: false,
        queryParams: ["q", "limit", "semantic"],
      },
      {
        path: "/api/music/ai/context",
        description: "Contextual music recommendations",
        methods: ["GET"],
        requiresAuth: false,
        queryParams: ["mood", "activity", "timeOfDay"],
      },
    ];

    const response = successResponse({
      status: "active",
      endpoints: aiEndpoints,
      documentation: "/api/music/ai/docs",
      aiProviders: ["Groq", "Cerebras"],
    }, "AI-Enhanced Music API");

    return toJson(response);
  },
  async POST(req: Request, ctx: RouteContext) {
    const url = new URL(req.url);
    const path = url.pathname.split("/ai/")[1];

    if (!path) {
      const response = errorResponse(
        "INVALID_REQUEST",
        "Specify an AI endpoint for POST requests",
      );
      return toJson(response, 400);
    }

    if (path.startsWith("recommendations")) {
      return await recommendationsHandler.POST(req, ctx);
    }

    if (path.startsWith("playlists")) {
      return await playlistsHandler.POST(req, ctx);
    }

    const response = errorResponse(
      "METHOD_NOT_ALLOWED",
      "POST not supported for this AI endpoint",
    );
    return toJson(response, 405);
  },
};
