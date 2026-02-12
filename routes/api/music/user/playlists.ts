// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.

import {
  addTrackToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistsByUser,
  removeTrackFromPlaylist,
  updatePlaylist,
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
 * GET /api/music/user/playlists
 * Get user's playlists
 *
 * POST /api/music/user/playlists
 * Create new playlist
 */
export const handler: Handlers = {
  async GET(req, ctx) {
    try {
      if (!ctx.state.user) {
        const response = errorResponse(
          "UNAUTHORIZED",
          "Authentication required",
        );
        return toJson(response, 401);
      }

      const userLogin = (ctx.state.user as User).login;
      const playlists = await getPlaylistsByUser(userLogin);

      const response = paginatedResponse(
        playlists,
        playlists.length,
        playlists.length,
        0,
      );

      return toJson(response);
    } catch (error) {
      const [errorResp, status] = handleApiError(error);
      return toJson(errorResp, status);
    }
  },

  async POST(req, ctx) {
    try {
      if (!ctx.state.user) {
        const response = errorResponse(
          "UNAUTHORIZED",
          "Authentication required",
        );
        return toJson(response, 401);
      }

      const body = await req.json();
      const { name, description, isPublic } = body;

      if (!name) {
        const response = errorResponse(
          "INVALID_REQUEST",
          "Playlist name required",
        );
        return toJson(response, 400);
      }

      const playlist = await createPlaylist({
        name,
        description: description || "",
        userLogin: (ctx.state.user as User).login,
        trackIds: [],
        isPublic: isPublic || false,
      });

      const response = successResponse(playlist, "Playlist created");
      return toJson(response, 201);
    } catch (error) {
      const [errorResp, status] = handleApiError(error);
      return toJson(errorResp, status);
    }
  },
};
