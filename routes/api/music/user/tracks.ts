// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.

import {
  createTrack,
  deleteTrack,
  getTracksByUser,
} from "@/utils/music_models.ts";
import {
  errorResponse,
  handleApiError,
  paginatedResponse,
  successResponse,
  toJson,
} from "@/utils/api_response.ts";
import type { Handlers } from "$fresh/server.ts";
import type { User } from "@/utils/db.ts";

/**
 * GET /api/music/user/tracks
 * Get user's saved tracks
 */
export async function handleGET(ctx: any) {
  try {
    if (!ctx.state.user) {
      const response = errorResponse("UNAUTHORIZED", "Authentication required");
      return toJson(response, 401);
    }

    const userLogin = ctx.state.user.login;
    const tracks = await getTracksByUser(userLogin);

    const response = paginatedResponse(
      tracks,
      tracks.length,
      tracks.length,
      0,
    );

    return toJson(response);
  } catch (error) {
    const [errorResp, status] = handleApiError(error);
    return toJson(errorResp, status);
  }
}

/**
 * POST /api/music/user/tracks
 * Save a track to user library
 */
export async function handlePOST(req: Request, ctx: any) {
  try {
    if (!ctx.state.user) {
      const response = errorResponse("UNAUTHORIZED", "Authentication required");
      return toJson(response, 401);
    }

    const body = await req.json();
    const { videoId, title, artist, album, duration, thumbnail } = body;

    if (!videoId || !title) {
      const response = errorResponse(
        "INVALID_REQUEST",
        "videoId and title required",
      );
      return toJson(response, 400);
    }

    const track = await createTrack({
      videoId,
      title,
      artist: artist || "",
      album,
      duration,
      thumbnail,
      userLogin: ctx.state.user.login,
    });

    const response = successResponse(track, "Track saved");
    return toJson(response, 201);
  } catch (error) {
    const [errorResp, status] = handleApiError(error);
    return toJson(errorResp, status);
  }
}

export const handler: Handlers = {
  async GET(req, ctx) {
    return await handleGET(ctx);
  },

  async POST(req, ctx) {
    return await handlePOST(req, ctx);
  },
};
