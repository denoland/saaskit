// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
/**
 * AI-Enhanced Smart Search
 * Semantic understanding and natural language query expansion
 */

import { cerebrasClient } from "@/utils/cerebras_client.ts";
import { YTMusic } from "@/utils/music_client.ts";
import {
  getAllTrackEmbeddings,
  logSearch,
  saveTrackEmbedding,
} from "@/utils/music_models.ts";
import {
  errorResponse,
  handleApiError,
  successResponse,
  toJson,
} from "@/utils/api_response.ts";
import type { Handlers, RouteContext } from "$fresh/server.ts";

const ytmusic = new YTMusic();

/**

export const handler: Handlers = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const path = url.pathname;

    // Route to natural language search
    if (path.endsWith("/natural")) {
      return await handleNaturalLanguageSearch(req, ctx);
    }

    // Main search
    try {
      const query = url.searchParams.get("q");
      const limit = parseInt(url.searchParams.get("limit") || "20");
      const semanticOnly = url.searchParams.get("semantic") === "true";
      const userLogin = ctx.state.user?.login || "anonymous";

        if (!query) {
          const response = errorResponse(
            "MISSING_PARAM",
            "Query parameter 'q' is required",
          );
          return toJson(response, 400);
        }

        // Expand search query using Cerebras
        const expandedQuery = await cerebrasClient.expandSearchQuery(query);

        // Perform search with expanded terms
        const searchResults = [];
        const searchedTerms = [query];

        if (!semanticOnly) {
          // Primary search with original query
          const primaryResults = await ytmusic.search(query);
          searchResults.push(...(primaryResults.results || []));

          // Search with expanded terms if needed to fill results
          if (searchResults.length < limit && expandedQuery.expanded.length > 0) {
            for (const term of expandedQuery.expanded.slice(0, 3)) {
              if (term === query) continue;
              searchedTerms.push(term);

              const results = await ytmusic.search(term);
              // Add unique results only
              for (const result of results.results || []) {
                if (!searchResults.some(r => r.videoId === result.videoId)) {
                  searchResults.push(result);
                }

                if (searchResults.length >= limit) break;
              }

              if (searchResults.length >= limit) break;
            }
          }
        }

        // Create embeddings for semantic search
        const queryEmbedding = await cerebrasClient.createEmbedding(query);
        const trackEmbeddings = await getAllTrackEmbeddings();

        // Perform semantic search
        let semanticResults = [];
        if (trackEmbeddings.length > 0) {
          const similar = cerebrasClient.findSimilar(
            queryEmbedding,
            trackEmbeddings.map(te => ({
              id: te.videoId,
              embedding: te.embedding,
              metadata: { text: te.text },
            })),
            0.6,
            limit,
          );

          semanticResults = similar.map(s => ({
            videoId: s.id,
            title: s.metadata?.text?.split(" by ")[0] || "Unknown",
            artist: s.metadata?.text?.split(" by ")[1] || "Unknown",
            resultType: "song",
            similarity: s.similarity,
          }));
        }

        // Combine results based on query intent
        let combinedResults;

        if (semanticOnly) {
          combinedResults = semanticResults;
        } else if (expandedQuery.intent === "discovery") {
          // For discovery intent, prioritize semantic results
          combinedResults = [
            ...semanticResults.slice(0, Math.floor(limit * 0.7)),
            ...searchResults.slice(0, Math.ceil(limit * 0.3)),
          ];
        } else {
          // For specific intents, prioritize direct search results
          combinedResults = [
            ...searchResults.slice(0, Math.floor(limit * 0.7)),
            ...semanticResults.slice(0, Math.ceil(limit * 0.3)),
          ];
        }

        // Deduplicate results
        const uniqueResults = [];
        const seenVideoIds = new Set();

        for (const result of combinedResults) {
          if (!result.videoId || seenVideoIds.has(result.videoId)) continue;

          seenVideoIds.add(result.videoId);
          uniqueResults.push(result);

          // Store embedding for this result to improve future searches
          if (result.videoId && result.title && result.artist) {
            try {
              const text = `${result.title} by ${result.artist}`;
              const embedding = await cerebrasClient.createEmbedding(text);

              await saveTrackEmbedding({
                trackId: result.videoId, // Using videoId as trackId for simplicity
                videoId: result.videoId,
                embedding,
                text,
              });
            } catch (err) {
              console.error("Error saving embedding:", err);
            }
          }
        }

        // Log search for analytics
        await logSearch(query, undefined, uniqueResults.length, userLogin).catch(
          () => null,
        );

        const response = successResponse({
          query,
          expandedQuery,
          searchedTerms,
          resultCount: uniqueResults.length,
          results: uniqueResults.slice(0, limit),
          semanticResults: semanticResults.length,
          directResults: searchResults.length,
        });

        return toJson(response);
      } catch (error) {
        const [errorResp, status] = handleApiError(error);
        return toJson(errorResp, status);
      }
  },
};

* GET /api/music/ai/search
 * Smart search with query expansion and semantic understanding
 * Query params: q (required), limit (optional, default: 20)
 */

/**
 * GET /api/music/ai/search/natural
 * Natural language search for music
 * Query params: q (required)
 */
async function handleNaturalLanguageSearch(
  req: Request,
  ctx: RouteContext,
) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q");
    const userLogin = (ctx.state.user as any)?.login || "anonymous";

    if (!query) {
      const response = errorResponse(
        "MISSING_PARAM",
        "Query parameter 'q' is required",
      );
      return toJson(response, 400);
    }

    // Process natural language query
    const expandedQuery = await cerebrasClient.expandSearchQuery(query);

    // Determine search strategy based on intent
    let results = [];
    let explanation = "";

    switch (expandedQuery.intent) {
      case "artist":
        // Search for the artist
        const artistResults = await ytmusic.search(
          expandedQuery.relatedArtists[0] || query,
          "artists",
        );
        results = artistResults.results || [];
        explanation = `Searched for artist: ${
          expandedQuery.relatedArtists[0] || query
        }`;
        break;

      case "song":
        // Search for the specific song
        const songResults = await ytmusic.search(query, "songs");
        results = songResults.results || [];
        explanation = `Searched for song: ${query}`;
        break;

      case "album":
        // Search for the album
        const albumResults = await ytmusic.search(query, "albums");
        results = albumResults.results || [];
        explanation = `Searched for album: ${query}`;
        break;

      case "genre":
        // Search for the genre with expanded terms
        const genreQuery = expandedQuery.relatedGenres[0] ||
          expandedQuery.expanded[0] ||
          query;
        const genreResults = await ytmusic.search(genreQuery);
        results = genreResults.results || [];
        explanation = `Searched for genre: ${genreQuery}`;
        break;

      case "mood":
        // Search for the mood with expanded terms
        const moodQuery = expandedQuery.relatedMoods[0] ||
          expandedQuery.expanded[0] ||
          query;
        const moodResults = await ytmusic.search(moodQuery);
        results = moodResults.results || [];
        explanation = `Searched for mood: ${moodQuery}`;
        break;

      case "discovery":
      default:
        // Use multiple search terms for discovery
        let discoveryResults: any[] = [];

        for (const term of [query, ...expandedQuery.expanded.slice(0, 2)]) {
          const termResults = await ytmusic.search(term);

          // Add unique results
          for (const result of termResults.results || []) {
            if (!discoveryResults.some((r) => r.videoId === result.videoId)) {
              discoveryResults.push(result);
            }

            if (discoveryResults.length >= 20) break;
          }

          if (discoveryResults.length >= 20) break;
        }

        results = discoveryResults;
        explanation = `Searched with multiple terms for discovery: ${
          [query, ...expandedQuery.expanded.slice(0, 2)].join(", ")
        }`;
        break;
    }

    // Log search for analytics
    await logSearch(query, undefined, results.length, userLogin).catch(
      () => null,
    );

    const response = successResponse({
      query,
      intent: expandedQuery.intent,
      explanation,
      expandedQuery,
      resultCount: results.length,
      results,
    });

    return toJson(response);
  } catch (error) {
    const [errorResp, status] = handleApiError(error);
    return toJson(errorResp, status);
  }
}

// Route handlers
