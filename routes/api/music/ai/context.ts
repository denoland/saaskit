// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
/**
 * Contextual Music Recommendations
 * Mood-based, activity-specific, and time-aware music suggestions
 */

import { groqClient } from "@/utils/groq_client.ts";
import { cerebrasClient } from "@/utils/cerebras_client.ts";
import { YTMusic } from "@/utils/music_client.ts";
import {
  createAIPlaylist,
  getListeningStats,
  getLyricsByMood,
  getUserTasteProfile,
} from "@/utils/music_models.ts";
import {
  errorResponse,
  handleApiError,
  successResponse,
  toJson,
} from "@/utils/api_response.ts";
import type { Handlers, RouteContext } from "$fresh/server.ts";

const _ytmusic = new YTMusic();

/**
 * GET /api/music/ai/context/mood
 * Get mood-based playlist recommendations
 * Query params: mood (required), activity (optional), timeOfDay (optional), limit (optional)
 */
export async function handleMoodPlaylist(req: Request, ctx: RouteContext) {
  try {
    const url = new URL(req.url);
    const mood = url.searchParams.get("mood");
    const activity = url.searchParams.get("activity");
    const timeOfDay = url.searchParams.get("timeOfDay");
    const limit = parseInt(url.searchParams.get("limit") || "15");
    const userLogin = ctx.state.sessionUser?.login || "anonymous";

    if (!mood) {
      const response = errorResponse(
        "MISSING_PARAM",
        "Mood parameter required",
      );
      return toJson(response, 400);
    }

    // Generate mood playlist
    const playlistData = await groqClient.generateMoodPlaylist(
      mood,
      activity,
      timeOfDay,
      Math.min(Math.max(limit, 5), 30),
    );

    // Find lyrics that match the mood
    let moodBasedTracks = [];
    try {
      const lyricsAnalyses = await getLyricsByMood(mood);
      moodBasedTracks = lyricsAnalyses.slice(0, 5).map((analysis) => ({
        title: analysis.videoId.split("-")[0].replace(/([A-Z])/g, " $1").trim(),
        artist:
          analysis.videoId.split("-")[1]?.replace(/([A-Z])/g, " $1").trim() ||
          "Unknown",
        why: `Lyrics match the ${mood} mood`,
      }));
    } catch (err) {
      console.error("Error finding mood-based tracks:", err);
    }

    // Combine generated playlist with mood-based tracks
    const combinedTracks = [
      ...playlistData.tracks.slice(0, limit - moodBasedTracks.length),
      ...moodBasedTracks,
    ];

    // Save playlist if user is authenticated
    let savedPlaylist = null;
    if (ctx.state.user) {
      try {
        const prompt = `A ${mood} playlist${
          activity ? ` for ${activity}` : ""
        }${timeOfDay ? ` during ${timeOfDay}` : ""}`;
        savedPlaylist = await createAIPlaylist({
          name: `${mood.charAt(0).toUpperCase() + mood.slice(1)}${
            activity ? ` ${activity}` : ""
          }`,
          description: `Generated playlist for ${mood} mood${
            activity ? ` while ${activity}` : ""
          }${timeOfDay ? ` during ${timeOfDay}` : ""}`,
          prompt,
          userLogin,
          tracks: combinedTracks.map((t) => ({
            title: t.title,
            artist: t.artist,
            mood,
          })),
          themes: [],
          mood: playlistData.mood,
          energyCurve: playlistData.energyCurve,
          isPublic: false,
        });
      } catch (err) {
        console.error("Error saving playlist:", err);
      }
    }

    const response = successResponse({
      mood: playlistData.mood,
      activity,
      timeOfDay,
      tracks: combinedTracks,
      transitions: playlistData.transitions,
      energyCurve: playlistData.energyCurve,
      savedPlaylistId: savedPlaylist?.id,
    });

    return toJson(response);
  } catch (error) {
    const [errorResp, status] = handleApiError(error);
    return toJson(errorResp, status);
  }
}

/**
 * GET /api/music/ai/context/time
 * Get time-aware music recommendations
 * Automatically detects time of day and suggests appropriate music
 */
export async function handleTimeAwarePlaylist(
  _req: Request,
  ctx: RouteContext,
) {
  try {
    const now = new Date();
    const hour = now.getHours();

    // Determine time of day
    let timeOfDay;
    let mood;

    if (hour >= 5 && hour < 9) {
      timeOfDay = "early morning";
      mood = "energizing";
    } else if (hour >= 9 && hour < 12) {
      timeOfDay = "morning";
      mood = "focused";
    } else if (hour >= 12 && hour < 14) {
      timeOfDay = "lunch";
      mood = "relaxed";
    } else if (hour >= 14 && hour < 17) {
      timeOfDay = "afternoon";
      mood = "productive";
    } else if (hour >= 17 && hour < 20) {
      timeOfDay = "evening";
      mood = "unwinding";
    } else if (hour >= 20 && hour < 23) {
      timeOfDay = "night";
      mood = "chill";
    } else {
      timeOfDay = "late night";
      mood = "mellow";
    }

    // Get user taste profile if available
    const activity = "";
    if (ctx.state.user) {
      const tasteProfile = await getUserTasteProfile(ctx.state.sessionUser!.login);
      if (tasteProfile) {
        // Adjust mood based on user preferences
        const preferredMoods = tasteProfile.moods.slice(0, 3).map((m) =>
          m.name
        );
        if (preferredMoods.length > 0) {
          mood = preferredMoods[0];
        }
      }
    }

    // Generate time-aware playlist
    const playlistData = await groqClient.generateMoodPlaylist(
      mood,
      activity,
      timeOfDay,
      15,
    );

    const response = successResponse({
      timeOfDay,
      mood: playlistData.mood,
      currentHour: hour,
      tracks: playlistData.tracks,
      energyCurve: playlistData.energyCurve,
      message: `Music curated for ${timeOfDay} (${hour}:00)`,
    });

    return toJson(response);
  } catch (error) {
    const [errorResp, status] = handleApiError(error);
    return toJson(errorResp, status);
  }
}

/**
 * GET /api/music/ai/context/activity
 * Get activity-specific music recommendations
 * Query params: activity (required), energy (optional), limit (optional)
 */
export async function handleActivityPlaylist(req: Request, _ctx: RouteContext) {
  try {
    const url = new URL(req.url);
    const activity = url.searchParams.get("activity");
    const energy = url.searchParams.get("energy") || "medium";
    const limit = parseInt(url.searchParams.get("limit") || "15");

    if (!activity) {
      const response = errorResponse(
        "MISSING_PARAM",
        "Activity parameter required",
      );
      return toJson(response, 400);
    }

    // Map activity to appropriate mood
    let mood;
    switch (activity.toLowerCase()) {
      case "workout":
      case "exercise":
      case "running":
      case "gym":
        mood = energy === "high" ? "intense" : "energetic";
        break;
      case "study":
      case "work":
      case "focus":
      case "reading":
        mood = "focused";
        break;
      case "relax":
      case "chill":
      case "unwind":
        mood = "relaxing";
        break;
      case "party":
      case "celebration":
        mood = "upbeat";
        break;
      case "sleep":
      case "bedtime":
        mood = "calm";
        break;
      case "commute":
      case "driving":
        mood = "engaging";
        break;
      case "meditation":
      case "yoga":
        mood = "peaceful";
        break;
      default:
        mood = "balanced";
        break;
    }

    // Generate activity playlist
    const playlistData = await groqClient.generateMoodPlaylist(
      mood,
      activity,
      undefined,
      Math.min(Math.max(limit, 5), 30),
    );

    const response = successResponse({
      activity,
      mood: playlistData.mood,
      energyLevel: energy,
      tracks: playlistData.tracks,
      transitions: playlistData.transitions,
      energyCurve: playlistData.energyCurve,
    });

    return toJson(response);
  } catch (error) {
    const [errorResp, status] = handleApiError(error);
    return toJson(errorResp, status);
  }
}

/**
 * GET /api/music/ai/context/discovery
 * Get personalized discovery playlist based on user's taste
 * Requires authentication
 */
export async function handleDiscoveryPlaylist(req: Request, ctx: RouteContext) {
  try {
    if (!ctx.state.user) {
      const response = errorResponse("UNAUTHORIZED", "Authentication required");
      return toJson(response, 401);
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "15");
    const userLogin = ctx.state.user.login;

    // Get user taste profile and listening stats
    const tasteProfile = await getUserTasteProfile(userLogin);
    const stats = await getListeningStats(userLogin);

    if (!tasteProfile && (!stats || stats.totalPlays === 0)) {
      const response = errorResponse(
        "NO_DATA",
        "Not enough listening data for personalized discovery",
      );
      return toJson(response, 400);
    }

    // Create discovery prompt based on user taste
    const genres = tasteProfile?.genres.slice(0, 3).map((g) => g.name) ||
      stats?.topGenres.slice(0, 3).map((g) => g.genre) ||
      [];

    const artists = tasteProfile?.artists.slice(0, 3).map((a) => a.name) ||
      stats?.topArtists.slice(0, 3).map((a) => a.artist) ||
      [];

    const prompt =
      `Create a discovery playlist for a user who likes ${
        genres.join(", ")
      } music ` +
      `and artists like ${artists.join(", ")}. ` +
      `Include tracks they probably haven't heard before, but would enjoy.`;

    // Generate discovery playlist using Cerebras
    const playlistData = await cerebrasClient.generatePlaylistContinuation(
      artists.map((artist) => ({ title: "", artist })),
      Math.min(Math.max(limit, 5), 30),
    );

    // Create playlist in database
    let savedPlaylist = null;
    try {
      savedPlaylist = await createAIPlaylist({
        name: "Discovery Mix",
        description: `Personalized discovery playlist based on your taste in ${
          genres.join(", ")
        }`,
        prompt,
        userLogin,
        tracks: playlistData.continuation.map((t) => ({
          title: t.title,
          artist: t.artist,
        })),
        themes: [],
        mood: "discovery",
        energyCurve: "Varied",
        isPublic: false,
      });
    } catch (err) {
      console.error("Error saving playlist:", err);
    }

    const response = successResponse({
      type: "discovery",
      basedOn: {
        genres,
        artists,
      },
      tracks: playlistData.continuation,
      coherence: playlistData.coherence,
      genreProgression: playlistData.genreProgression,
      savedPlaylistId: savedPlaylist?.id,
    });

    return toJson(response);
  } catch (error) {
    const [errorResp, status] = handleApiError(error);
    return toJson(errorResp, status);
  }
}

/**
 * GET /api/music/ai/context/taste
 * Get or update user's taste profile
 * Requires authentication
 */
export async function handleTasteProfile(_req: Request, ctx: RouteContext) {
  try {
    if (!ctx.state.user) {
      const response = errorResponse("UNAUTHORIZED", "Authentication required");
      return toJson(response, 401);
    }

    const userLogin = ctx.state.user.login;

    // Get user taste profile
    const tasteProfile = await getUserTasteProfile(userLogin);

    if (!tasteProfile) {
      // Generate initial taste profile
      const questions = await groqClient.generateDiscoveryQuestions();

      const response = successResponse({
        status: "needs_setup",
        questions: questions.questions,
        initialProfile: questions.profile,
      });

      return toJson(response);
    }

    // Get listening stats
    const stats = await getListeningStats(userLogin);

    // Generate next discovery questions
    const questions = await groqClient.generateDiscoveryQuestions([
      {
        question: "What genres do you like?",
        answer: tasteProfile.genres.map((g) => g.name).join(", "),
      },
      {
        question: "What artists do you like?",
        answer: tasteProfile.artists.map((a) => a.name).join(", "),
      },
    ]);

    const response = successResponse({
      status: "existing",
      tasteProfile,
      stats,
      questions: questions.questions,
    });

    return toJson(response);
  } catch (error) {
    const [errorResp, status] = handleApiError(error);
    return toJson(errorResp, status);
  }
}

/**
 * GET /api/music/ai/context/{type}
 * Contextual music recommendations based on mood, time, activity, etc.
 */
export const handler: Handlers = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const contextType = url.pathname.split("/").pop();

    switch (contextType) {
      case "mood":
        return await handleMoodPlaylist(req, ctx);
      case "time":
        return await handleTimeAwarePlaylist(req, ctx);
      case "activity":
        return await handleActivityPlaylist(req, ctx);
      case "discovery":
        return await handleDiscoveryPlaylist(req, ctx);
      case "taste":
        return await handleTasteProfile(req, ctx);
      default: {
        const response = errorResponse(
          "INVALID_ENDPOINT",
          "Invalid context endpoint. Must be 'mood', 'time', 'activity', 'discovery', or 'taste'",
        );
        return toJson(response, 400);
      }
    }
  },
};
