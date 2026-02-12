// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
/**
 * AI-Powered Playlist Generation
 * Create playlists from natural language descriptions and mood-based contexts
 */

import { groqClient } from "@/utils/groq_client.ts";
import { cerebrasClient } from "@/utils/cerebras_client.ts";
import { YTMusic } from "@/utils/music_client.ts";
import {
  createAIPlaylist,
  deleteAIPlaylist,
  getAIPlaylist,
  getAIPlaylistsByUser,
  getUserTasteProfile,
} from "@/utils/music_models.ts";
import {
  errorResponse,
  handleApiError,
  successResponse,
  toJson,
} from "@/utils/api_response.ts";
import type { Handlers, RouteContext } from "$fresh/server.ts";
import type { User } from "@/utils/db.ts";

const ytmusic = new YTMusic();

/**
 * GET /api/music/ai/playlists
 * Get user's AI-generated playlists
 */
export async function handleGET(ctx: RouteContext) {
  try {
    if (!ctx.state.user) {
      const response = errorResponse("UNAUTHORIZED", "Authentication required");
      return toJson(response, 401);
    }

    const userLogin = ctx.state.user as User.login;
    const playlists = await getAIPlaylistsByUser(userLogin);

    const response = successResponse({
      playlists,
      count: playlists.length,
    });

    return toJson(response);
  } catch (error) {
    const [errorResp, status] = handleApiError(error);
    return toJson(errorResp, status);
  }
}

/**
 * GET /api/music/ai/playlists/:id
 * Get a specific AI-generated playlist
 */
export async function handleGETById(req: Request, ctx: RouteContext) {
  try {
    const playlistId = ctx.params.id;

    if (!playlistId) {
      const response = errorResponse("MISSING_PARAM", "Playlist ID required");
      return toJson(response, 400);
    }

    const playlist = await getAIPlaylist(playlistId);

    if (!playlist) {
      const response = errorResponse("NOT_FOUND", "Playlist not found");
      return toJson(response, 404);
    }

    // Check access permissions
    if (
      !playlist.isPublic &&
      (!ctx.state.user || playlist.userLogin !== ctx.state.user as User.login)
    ) {
      const response = errorResponse("FORBIDDEN", "Access denied");
      return toJson(response, 403);
    }

    const response = successResponse({ playlist });
    return toJson(response);
  } catch (error) {
    const [errorResp, status] = handleApiError(error);
    return toJson(errorResp, status);
  }
}

/**
 * POST /api/music/ai/playlists
 * Create a new AI-generated playlist from natural language description
 */
export async function handlePOST(req: Request, ctx: RouteContext) {
  try {
    if (!ctx.state.user) {
      const response = errorResponse("UNAUTHORIZED", "Authentication required");
      return toJson(response, 401);
    }

    const body = await req.json();
    const { description, trackCount = 15, isPublic = false } = body;

    if (!description) {
      const response = errorResponse("MISSING_PARAM", "Description required");
      return toJson(response, 400);
    }

    // Generate playlist using Groq
    const playlistData = await groqClient.generatePlaylistFromDescription(
      description,
      Math.min(Math.max(trackCount, 5), 30), // Limit between 5-30 tracks
    );

    // Create playlist in database
    const playlist = await createAIPlaylist({
      name: playlistData.name,
      description: playlistData.description,
      prompt: description,
      userLogin: ctx.state.user as User.login,
      tracks: playlistData.tracks,
      themes: playlistData.themes,
      mood: playlistData.tracks[0]?.mood || "",
      energyCurve: "Balanced",
      isPublic,
    });

    // Find video IDs for the first few tracks
    try {
      const searchPromises = playlistData.tracks.slice(0, 5).map(
        async (track) => {
          const query = `${track.title} ${track.artist}`;
          const results = await ytmusic.search(
            query,
            "songs",
            undefined,
            false,
          );
          return {
            track,
            videoId: results.results?.[0]?.videoId,
          };
        },
      );

      const searchResults = await Promise.all(searchPromises);

      // Update tracks with video IDs
      const updatedTracks = playlistData.tracks.map((track, index) => {
        if (index < 5) {
          const result = searchResults.find((r) =>
            r.track.title === track.title && r.track.artist === track.artist
          );
          return { ...track, videoId: result?.videoId as string | undefined };
        }
        return track;
      });

      // Update playlist with video IDs
      // In production, this would be an atomic update
      await deleteAIPlaylist(playlist.id, ctx.state.user as User.login);
      const updatedPlaylist = await createAIPlaylist({
        ...playlist,
        tracks: updatedTracks,
      });

      const response = successResponse(updatedPlaylist, "Playlist created");
      return toJson(response, 201);
    } catch (err) {
      console.error("Error finding video IDs:", err);
      // Return original playlist if video ID lookup fails
      const response = successResponse(
        playlist,
        "Playlist created (without video IDs)",
      );
      return toJson(response, 201);
    }
  } catch (error) {
    const [errorResp, status] = handleApiError(error);
    return toJson(errorResp, status);
  }
}

/**
 * POST /api/music/ai/playlists/mood
 * Create a mood-based playlist
 */
export async function handleMoodPlaylist(req: Request, ctx: RouteContext) {
  try {
    if (!ctx.state.user) {
      const response = errorResponse("UNAUTHORIZED", "Authentication required");
      return toJson(response, 401);
    }

    const body = await req.json();
    const { mood, activity, timeOfDay, trackCount = 15, isPublic = false } =
      body;

    if (!mood) {
      const response = errorResponse("MISSING_PARAM", "Mood required");
      return toJson(response, 400);
    }

    // Generate mood-based playlist
    const playlistData = await groqClient.generateMoodPlaylist(
      mood,
      activity,
      timeOfDay,
      Math.min(Math.max(trackCount, 5), 30), // Limit between 5-30 tracks
    );

    // Create playlist in database
    const prompt = `A ${mood} playlist${activity ? ` for ${activity}` : ""}${
      timeOfDay ? ` during ${timeOfDay}` : ""
    }`;
    const playlist = await createAIPlaylist({
      name: `${mood.charAt(0).toUpperCase() + mood.slice(1)}${
        activity ? ` ${activity}` : ""
      }`,
      description: `Generated playlist for ${mood} mood${
        activity ? ` while ${activity}` : ""
      }${timeOfDay ? ` during ${timeOfDay}` : ""}`,
      prompt,
      userLogin: ctx.state.user as User.login,
      tracks: playlistData.tracks.map((t) => ({
        title: t.title,
        artist: t.artist,
        mood,
      })),
      themes: [],
      mood: playlistData.mood,
      energyCurve: playlistData.energyCurve,
      isPublic,
    });

    const response = successResponse(playlist, "Mood playlist created");
    return toJson(response, 201);
  } catch (error) {
    const [errorResp, status] = handleApiError(error);
    return toJson(errorResp, status);
  }
}

/**
 * POST /api/music/ai/playlists/continue
 * Continue an existing playlist with AI-generated recommendations
 */
export async function handleContinuePlaylist(req: Request, ctx: RouteContext) {
  try {
    if (!ctx.state.user) {
      const response = errorResponse("UNAUTHORIZED", "Authentication required");
      return toJson(response, 401);
    }

    const body = await req.json();
    const { playlistId, trackCount = 10 } = body;

    if (!playlistId) {
      const response = errorResponse("MISSING_PARAM", "Playlist ID required");
      return toJson(response, 400);
    }

    // Get the existing playlist
    const playlist = await getAIPlaylist(playlistId);

    if (!playlist) {
      const response = errorResponse("NOT_FOUND", "Playlist not found");
      return toJson(response, 404);
    }

    // Check permissions
    if (playlist.userLogin !== ctx.state.user as User.login) {
      const response = errorResponse("FORBIDDEN", "Access denied");
      return toJson(response, 403);
    }

    // Generate continuation using Cerebras
    const continuation = await cerebrasClient.generatePlaylistContinuation(
      playlist.tracks.map((t) => ({
        title: t.title,
        artist: t.artist,
      })),
      Math.min(Math.max(trackCount, 3), 20), // Limit between 3-20 tracks
    );

    // Update playlist
    const updatedTracks = [
      ...playlist.tracks,
      ...continuation.continuation.map((t) => ({
        title: t.title,
        artist: t.artist,
        mood: playlist.mood,
      })),
    ];

    // In production, this would be an atomic update
    await deleteAIPlaylist(playlist.id, ctx.state.user as User.login);
    const updatedPlaylist = await createAIPlaylist({
      ...playlist,
      tracks: updatedTracks,
    });

    const response = successResponse({
      playlist: updatedPlaylist,
      added: continuation.continuation.length,
      coherence: continuation.coherence,
      genreProgression: continuation.genreProgression,
    }, "Playlist extended");

    return toJson(response, 200);
  } catch (error) {
    const [errorResp, status] = handleApiError(error);
    return toJson(errorResp, status);
  }
}

/**
 * DELETE /api/music/ai/playlists/:id
 * Delete an AI-generated playlist
 */
export async function handleDELETE(req: Request, ctx: RouteContext) {
  try {
    if (!ctx.state.user) {
      const response = errorResponse("UNAUTHORIZED", "Authentication required");
      return toJson(response, 401);
    }

    const playlistId = ctx.params.id;

    if (!playlistId) {
      const response = errorResponse("MISSING_PARAM", "Playlist ID required");
      return toJson(response, 400);
    }

    const deleted = await deleteAIPlaylist(
      playlistId,
      (ctx.state.user as { login: string }).login,
    );

    if (!deleted) {
      const response = errorResponse(
        "NOT_FOUND",
        "Playlist not found or not owned by user",
      );
      return toJson(response, 404);
    }

    const response = successResponse({ playlistId }, "Playlist deleted");
    return toJson(response, 200);
  } catch (error) {
    const [errorResp, status] = handleApiError(error);
    return toJson(errorResp, status);
  }
}

/**
 * GET /api/music/ai/playlists
 * Get user's AI-generated playlists
 *
 * POST /api/music/ai/playlists?action=mood|continue
 * Create AI-generated playlist
 *
 * DELETE /api/music/ai/playlists
 * Delete AI-generated playlist
 */
export const handler: Handlers = {
  async GET(req, ctx) {
    if (ctx.params.id) {
      return await handleGETById(req, ctx);
    }
    return await handleGET(ctx);
  },

  async POST(req, ctx) {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "mood") {
      return await handleMoodPlaylist(req, ctx);
    }

    if (action === "continue") {
      return await handleContinuePlaylist(req, ctx);
    }

    return await handlePOST(req, ctx);
  },

  async DELETE(req, ctx) {
    return await handleDELETE(req, ctx);
  },
};
