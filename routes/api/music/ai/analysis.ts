// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
/**
 * AI-Powered Music Analysis
 * Advanced insights for tracks, lyrics, and listening patterns
 */

import { groqClient } from "@/utils/groq_client.ts";
import { cerebrasClient } from "@/utils/cerebras_client.ts";
import { openaiClient } from "@/utils/openai_client.ts";
import { getLyrics } from "@/utils/music_client.ts";
import {
  getAudioFeatures,
  getListeningHistory,
  getListeningStats,
  getLyricsAnalysis,
  getTrack,
  getTracksByVideoId,
  saveAudioFeatures,
  saveLyricsAnalysis,
} from "@/utils/music_models.ts";
import {
  errorResponse,
  handleApiError,
  successResponse,
  toJson,
} from "@/utils/api_response.ts";
import type { Handlers, RouteContext } from "$fresh/server.ts";

/**
 * GET /api/music/ai/analysis/track
 * Get AI-powered track analysis with audio features
 * Query params: videoId (required)
 */
export async function handleTrackAnalysis(req: Request) {
  try {
    const url = new URL(req.url);
    const videoId = url.searchParams.get("videoId");
    const forceRefresh = url.searchParams.get("refresh") === "true";

    if (!videoId) {
      const response = errorResponse("MISSING_PARAM", "videoId is required");
      return toJson(response, 400);
    }

    // Get track from database
    const tracks = await getTracksByVideoId(videoId);
    const track = tracks[0];

    if (!track) {
      const response = errorResponse("NOT_FOUND", "Track not found");
      return toJson(response, 404);
    }

    // Check for existing audio features
    let audioFeatures = await getAudioFeatures(track.id);

    if (!audioFeatures || forceRefresh) {
      // Generate audio features using Cerebras
      const features = await cerebrasClient.extractAudioFeatures(
        track.title,
        track.artist,
        track.album,
      );

      // Save to database
      audioFeatures = await saveAudioFeatures({
        trackId: track.id,
        ...features,
      });
    }

    const response = successResponse({
      track,
      audioFeatures,
    });

    return toJson(response);
  } catch (error) {
    const [errorResp, status] = handleApiError(error);
    return toJson(errorResp, status);
  }
}

/**
 * GET /api/music/ai/analysis/lyrics
 * Get AI-powered lyrics analysis with sentiment, themes, and meaning
 * Query params: videoId (required)
 */
export async function handleLyricsAnalysis(req: Request) {
  try {
    const url = new URL(req.url);
    const videoId = url.searchParams.get("videoId");
    const forceRefresh = url.searchParams.get("refresh") === "true";

    if (!videoId) {
      const response = errorResponse("MISSING_PARAM", "videoId is required");
      return toJson(response, 400);
    }

    // Get track from database
    const tracks = await getTracksByVideoId(videoId);
    const track = tracks[0];

    if (!track) {
      const response = errorResponse("NOT_FOUND", "Track not found");
      return toJson(response, 404);
    }

    // Check for existing lyrics analysis
    let lyricsAnalysis = await getLyricsAnalysis(track.id);

    if (!lyricsAnalysis || forceRefresh) {
      // Fetch lyrics
      const lyricsResult = await getLyrics(
        track.title,
        track.artist,
        track.duration,
      );

      if (!lyricsResult.success || !(lyricsResult as any).plainLyrics) {
        const response = errorResponse("NOT_FOUND", "Lyrics not found");
        return toJson(response, 404);
      }

      // Analyze lyrics using Groq
      const analysis = await groqClient.analyzeLyrics(
        track.title,
        track.artist,
        (lyricsResult as any).plainLyrics,
      );

      // Save to database
      lyricsAnalysis = await saveLyricsAnalysis({
        trackId: track.id,
        videoId,
        sentiment: analysis.sentiment,
        themes: analysis.themes,
        mood: analysis.mood,
        summary: analysis.summary,
        keyPhrases: analysis.keyPhrases,
        emotionalJourney: analysis.emotionalJourney,
      });
    }

    const response = successResponse({
      track,
      lyricsAnalysis,
    });

    return toJson(response);
  } catch (error) {
    const [errorResp, status] = handleApiError(error);
    return toJson(errorResp, status);
  }
}

/**
 * GET /api/music/ai/analysis/listening
 * Get AI-powered analysis of user's listening patterns
 */
export async function handleListeningAnalysis(
  _req: Request,
  ctx: RouteContext,
) {
  try {
    if (!ctx.state.user) {
      const response = errorResponse("UNAUTHORIZED", "Authentication required");
      return toJson(response, 401);
    }

    const user = ctx.state.user as { login: string };
    const userLogin = user.login;

    // Get user's listening history and stats
    const history = await getListeningHistory(userLogin, 200);
    const stats = await getListeningStats(userLogin);

    if (history.length === 0) {
      const response = errorResponse(
        "NO_HISTORY",
        "Need listening history for analysis. Listen to some tracks first!",
      );
      return toJson(response, 400);
    }

    // Analyze trends using Cerebras
    const trends = await cerebrasClient.analyzeTrends(
      history.map((h) => ({
        title: h.title,
        artist: h.artist,
        genre: (h as any).genre,
      })),
    );

    // Process listening patterns
    const timeOfDayPattern: Record<string, number> = {};
    const likedVsPlayed: Record<string, number> = {
      liked: 0,
      total: history.length,
    };

    for (const event of history) {
      // Analyze time of day
      const hour = new Date(event.playedAt).getHours();
      const timeCategory = hour >= 5 && hour < 12
        ? "morning"
        : hour >= 12 && hour < 17
        ? "afternoon"
        : hour >= 17 && hour < 22
        ? "evening"
        : "night";

      timeOfDayPattern[timeCategory] = (timeOfDayPattern[timeCategory] || 0) +
        1;

      // Count likes
      if (event.liked) {
        likedVsPlayed.liked++;
      }
    }

    const timeOfDay = Object.entries(timeOfDayPattern)
      .map(([time, count]) => ({
        time,
        count,
        percentage: (count / history.length * 100).toFixed(1) + "%",
      }))
      .sort((a, b) => b.count - a.count);

    const response = successResponse({
      userLogin,
      stats,
      trends,
      patterns: {
        timeOfDay,
        likedPercentage:
          ((likedVsPlayed.liked / likedVsPlayed.total) * 100).toFixed(1) + "%",
        completionRate: (stats.averageCompletionRate * 100).toFixed(1) + "%",
      },
      insights: [
        `You most frequently listen to music during ${
          timeOfDay[0]?.time || "the day"
        }`,
        `Your top genre is ${stats.topGenres[0]?.genre || "varied"}`,
        `Your favorite artist is ${stats.topArtists[0]?.artist || "varied"}`,
        ...trends.emergingPatterns,
      ],
      recommendations: trends.recommendations,
    });

    return toJson(response);
  } catch (error) {
    const [errorResp, status] = handleApiError(error);
    return toJson(errorResp, status);
  }
}

/**
 * GET /api/music/ai/analysis/compare
 * Compare two tracks for similarity and differences
 * Query params: videoId1, videoId2 (both required)
 */
export async function handleTrackComparison(req: Request) {
  try {
    const url = new URL(req.url);
    const videoId1 = url.searchParams.get("videoId1");
    const videoId2 = url.searchParams.get("videoId2");

    if (!videoId1 || !videoId2) {
      const response = errorResponse(
        "MISSING_PARAM",
        "videoId1 and videoId2 are required",
      );
      return toJson(response, 400);
    }

    // Get tracks from database
    const tracks1 = await getTracksByVideoId(videoId1);
    const tracks2 = await getTracksByVideoId(videoId2);

    if (tracks1.length === 0 || tracks2.length === 0) {
      const response = errorResponse(
        "NOT_FOUND",
        "One or both tracks not found",
      );
      return toJson(response, 404);
    }

    const track1 = tracks1[0];
    const track2 = tracks2[0];

    // Get audio features for both tracks
    let features1 = await getAudioFeatures(track1.id);
    let features2 = await getAudioFeatures(track2.id);

    if (!features1) {
      const genFeatures = await cerebrasClient.extractAudioFeatures(
        track1.title,
        track1.artist,
        track1.album,
      );
      features1 = await saveAudioFeatures({
        trackId: track1.id,
        ...genFeatures,
      });
    }

    if (!features2) {
      const genFeatures = await cerebrasClient.extractAudioFeatures(
        track2.title,
        track2.artist,
        track2.album,
      );
      features2 = await saveAudioFeatures({
        trackId: track2.id,
        ...genFeatures,
      });
    }

    // Compare audio features
    const similarities: Record<string, number> = {};
    const differences: Record<string, number> = {};

    // Numeric features
    const numericFeatures = [
      "acousticness",
      "danceability",
      "energy",
      "instrumentalness",
      "liveness",
      "speechiness",
      "valence",
    ];

    for (const feature of numericFeatures) {
      const val1 = features1[feature as keyof typeof features1] as number || 0;
      const val2 = features2[feature as keyof typeof features2] as number || 0;
      const diff = Math.abs(val1 - val2);
      const similarity = 1 - diff;

      similarities[feature] = parseFloat(similarity.toFixed(2));
      differences[feature] = parseFloat(diff.toFixed(2));
    }

    // Calculate overall similarity
    const overallSimilarity = Object.values(similarities).reduce((sum, val) =>
      sum + val, 0) /
      numericFeatures.length;

    // Compare production styles and instrumentation
    const commonProductionStyles = features1.productionStyle.filter(
      (style) => features2.productionStyle.includes(style),
    );

    const commonInstrumentation = features1.instrumentation.filter(
      (instrument) => features2.instrumentation.includes(instrument),
    );

    const response = successResponse({
      track1: {
        ...track1,
        features: features1,
      },
      track2: {
        ...track2,
        features: features2,
      },
      comparison: {
        overallSimilarity: parseFloat(overallSimilarity.toFixed(2)),
        similarities,
        differences,
        commonProductionStyles,
        commonInstrumentation,
        sameModeAndKey: features1.key === features2.key &&
          features1.mode === features2.mode,
        tempoDifference: Math.abs(features1.tempo - features2.tempo),
      },
    });

    return toJson(response);
  } catch (error) {
    const [errorResp, status] = handleApiError(error);
    return toJson(errorResp, status);
  }
}

/**
 * GET /api/music/ai/analysis/description
 * Get OpenAI-generated track description
 * Query params: videoId (required)
 */
export async function handleTrackDescription(req: Request) {
  try {
    const url = new URL(req.url);
    const videoId = url.searchParams.get("videoId");

    if (!videoId) {
      const response = errorResponse("MISSING_PARAM", "videoId is required");
      return toJson(response, 400);
    }

    // Get track from database
    const tracks = await getTracksByVideoId(videoId);
    const track = tracks[0];

    if (!track) {
      const response = errorResponse("NOT_FOUND", "Track not found");
      return toJson(response, 404);
    }

    // Generate description using OpenAI
    const description = await openaiClient.generateMusicDescription({
      title: track.title,
      artist: track.artist,
      genre: (track as any).genre,
    });

    const response = successResponse({
      track,
      description,
      generatedBy: "openai",
    });

    return toJson(response);
  } catch (error) {
    const [errorResp, status] = handleApiError(error);
    return toJson(errorResp, status);
  }
}

/**
 * GET /api/music/ai/analysis?type=track&videoId=VIDEO_ID
 * AI-powered music analysis with multiple analysis types
 */
export const handler: Handlers = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const analysisType = url.searchParams.get("type") || "track";

    switch (analysisType) {
      case "track":
        return await handleTrackAnalysis(req);
      case "lyrics":
        return await handleLyricsAnalysis(req);
      case "listening":
        return await handleListeningAnalysis(req, ctx);
      case "compare":
        return await handleTrackComparison(req);
      case "description":
        return await handleTrackDescription(req);
      default: {
        const response = errorResponse(
          "INVALID_PARAM",
          "Invalid analysis type. Must be 'track', 'lyrics', 'listening', 'compare', or 'description'",
        );
        return toJson(response, 400);
      }
    }
  },
};
