// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.

import {
  addTrackToPlaylist,
  deletePlaylist,
  getPlaylist,
  removeTrackFromPlaylist,
  reorderTracksInPlaylist,
  updatePlaylist,
} from "@/utils/music_models.ts";
import {
  errorResponse,
  handleApiError,
  successResponse,
  toJson,
} from "@/utils/api_response.ts";
import type { Handlers } from "$fresh/server.ts";
import type { User } from "@/utils/db.ts";

async function handleRequest(
  method: string,
  req: Request,
  ctx: any,
) {
  try {
    if (!ctx.state.user) {
      const response = errorResponse("UNAUTHORIZED", "Authentication required");
      return toJson(response, 401);
    }

    const playlistId = ctx.params.playlistId;
    const userLogin = ctx.state.user.login;

    if (method === "GET") {
      const playlist = await getPlaylist(playlistId);

      if (!playlist) {
        const response = errorResponse("NOT_FOUND", "Playlist not found");
        return toJson(response, 404);
      }

      // Allow viewing public playlists or user's own playlists
      if (!playlist.isPublic && playlist.userLogin !== userLogin) {
        const response = errorResponse("FORBIDDEN", "Access denied");
        return toJson(response, 403);
      }

      const response = successResponse(playlist);
      return toJson(response);
    }

    // Owner-only operations
    const playlist = await getPlaylist(playlistId);
    if (!playlist || playlist.userLogin !== userLogin) {
      const response = errorResponse(
        "FORBIDDEN",
        "Only playlist owner can modify",
      );
      return toJson(response, 403);
    }

    if (method === "PUT") {
      const body = await req.json();
      const updated = await updatePlaylist(playlistId, userLogin, body);

      if (!updated) {
        const response = errorResponse(
          "UPDATE_FAILED",
          "Failed to update playlist",
        );
        return toJson(response, 500);
      }

      const response = successResponse(updated, "Playlist updated");
      return toJson(response);
    }

    if (method === "DELETE") {
      const deleted = await deletePlaylist(playlistId, userLogin);

      if (!deleted) {
        const response = errorResponse(
          "DELETE_FAILED",
          "Failed to delete playlist",
        );
        return toJson(response, 500);
      }

      const response = successResponse(
        { playlistId },
        "Playlist deleted",
      );
      return toJson(response);
    }

    if (method === "POST") {
      const body = await req.json();
      const action = body.action;

      if (action === "add-track") {
        const trackId = body.trackId;
        if (!trackId) {
          const response = errorResponse(
            "INVALID_REQUEST",
            "Track ID required",
          );
          return toJson(response, 400);
        }

        const added = await addTrackToPlaylist(playlistId, trackId, userLogin);
        const response = successResponse(
          { playlistId, trackId, added },
          "Track added to playlist",
        );
        return toJson(response);
      }

      if (action === "remove-track") {
        const trackId = body.trackId;
        if (!trackId) {
          const response = errorResponse(
            "INVALID_REQUEST",
            "Track ID required",
          );
          return toJson(response, 400);
        }

        const removed = await removeTrackFromPlaylist(
          playlistId,
          trackId,
          userLogin,
        );
        const response = successResponse(
          { playlistId, trackId, removed },
          "Track removed from playlist",
        );
        return toJson(response);
      }

      if (action === "reorder-tracks") {
        const trackIds = body.trackIds;
        if (!Array.isArray(trackIds) || trackIds.length === 0) {
          const response = errorResponse(
            "INVALID_REQUEST",
            "Track IDs array required",
          );
          return toJson(response, 400);
        }

        const reordered = await reorderTracksInPlaylist(
          playlistId,
          trackIds,
          userLogin,
        );
        if (!reordered) {
          const response = errorResponse(
            "REORDER_FAILED",
            "Failed to reorder tracks",
          );
          return toJson(response, 500);
        }

        const response = successResponse(
          { playlistId, trackIds, reordered },
          "Tracks reordered in playlist",
        );
        return toJson(response);
      }

      if (action === "share") {
        const isPublic = body.isPublic;
        if (typeof isPublic !== "boolean") {
          const response = errorResponse(
            "INVALID_REQUEST",
            "isPublic boolean required",
          );
          return toJson(response, 400);
        }

        const updated = await updatePlaylist(playlistId, userLogin, {
          isPublic,
        });
        if (!updated) {
          const response = errorResponse(
            "SHARE_FAILED",
            "Failed to update playlist sharing",
          );
          return toJson(response, 500);
        }

        const shareUrl = isPublic
          ? `/api/music/playlists/public/${playlistId}`
          : null;
        const response = successResponse(
          { playlistId, isPublic, shareUrl },
          `Playlist ${isPublic ? "shared publicly" : "made private"}`,
        );
        return toJson(response);
      }

      const response = errorResponse("INVALID_REQUEST", "Invalid action");
      return toJson(response, 400);
    }

    const response = errorResponse(
      "METHOD_NOT_ALLOWED",
      `${method} not allowed`,
    );
    return toJson(response, 405);
  } catch (error) {
    const [errorResp, status] = handleApiError(error);
    return toJson(errorResp, status);
  }
}

export async function PUT(req: Request, ctx: any) {
  return await handleRequest("PUT", req, ctx);
}

export async function DELETE(req: Request, ctx: any) {
  return await handleRequest("DELETE", req, ctx);
}

export const handler: Handlers = {
  async GET(req, ctx) {
    return await handleRequest("GET", req, ctx);
  },
  async POST(req, ctx) {
    return await handleRequest("POST", req, ctx);
  },
};
