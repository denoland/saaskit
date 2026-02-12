// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.

import { YouTubeSearch } from "@/utils/music_client.ts";
import {
  errorResponse,
  handleApiError,
  successResponse,
  toJson,
} from "@/utils/api_response.ts";
import { logSearch } from "@/utils/music_models.ts";
import type { Handlers } from "$fresh/server.ts";
import type { User } from "@/utils/db.ts";

const youtubeSearch = new YouTubeSearch();

/**
 * GET /api/music/yt_search
 * Search for YouTube videos (general YouTube search, not just music)
 * Query params: q, continuationToken
 */
export const handler: Handlers = {
  async GET(req, ctx) {
    try {
      const url = new URL(req.url);
      const query = url.searchParams.get("q");
      const continuationToken = url.searchParams.get("continuationToken");
      const userLogin = (ctx.state.user as User)?.login || "anonymous";

      if (!query && !continuationToken) {
        const response = errorResponse(
          "MISSING_PARAM",
          "Query parameter 'q' is required for initial search",
        );
        return toJson(response, 400);
      }

      // Perform YouTube search
      const results = await youtubeSearch.searchVideos(
        query || null,
        continuationToken || undefined,
      );

      // Log search for analytics
      if (query) {
        await logSearch(
          query,
          "youtube_videos",
          results.results?.length || 0,
          userLogin,
        ).catch(
          () => null,
        );
      }

      const response = successResponse({
        query,
        resultCount: results.results?.length || 0,
        results: results.results || [],
        continuationToken: results.continuationToken,
      });

      return toJson(response);
    } catch (error) {
      const [errorResp, status] = handleApiError(error);
      return toJson(errorResp, status);
    }
  },
};
