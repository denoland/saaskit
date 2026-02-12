// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.

/**
 * Vector Search System for Music
 * Provides semantic search capabilities using embeddings and similarity algorithms
 */

import {
  getAllTrackEmbeddings,
  getTrackEmbedding,
  saveTrackEmbedding,
  type TrackEmbedding,
} from "@/utils/music_models.ts";
// groqClient imported for future use
import { groqClient as _groqClient } from "@/utils/groq_client.ts";

// ============ CONFIGURATION ============
const _EMBEDDING_MODEL = "nomic-ai/nomic-embed-text-v1.5";
const EMBEDDING_DIMENSIONS = 768;
const MAX_SEARCH_RESULTS = 50;

// ============ EMBEDDING GENERATION ============

/**
 * Generate embedding for a given text using Groq API
 */
export function generateEmbedding(text: string): number[] {
  // For now, generate a simple hash-based embedding
  // In production, use an actual embedding service
  return simpleHash(text);
}

/**
 * Simple hash-based embedding generation
 * TODO: Replace with actual embedding API (OpenAI, Cohere, etc.)
 */
function simpleHash(text: string): number[] {
  const normalized = text.toLowerCase().trim();
  const embedding = new Array(EMBEDDING_DIMENSIONS).fill(0);

  // Generate features from text
  const words = normalized.split(/\s+/);
  const chars = normalized.split("");

  // Hash based on character codes and word positions
  for (let i = 0; i < chars.length; i++) {
    const charCode = chars[i].charCodeAt(0) || 0;
    const position = (charCode + i * 17) % EMBEDDING_DIMENSIONS;
    embedding[position] = (embedding[position] || 0) + (charCode / 255);
  }

  // Add word-based features
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const wordHash = word.split("").reduce(
      (acc, char, idx) => acc + char.charCodeAt(0) * (idx + 1),
      0,
    );
    const position = wordHash % EMBEDDING_DIMENSIONS;
    embedding[position] = (embedding[position] || 0) + 0.1;
  }

  // Normalize vector
  const magnitude = Math.sqrt(
    embedding.reduce((sum, val) => sum + val * val, 0),
  );
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= magnitude;
    }
  }

  return embedding;
}

/**
 * Generate embedding for a track based on its metadata
 */
export async function generateTrackEmbedding(
  trackId: string,
  videoId: string,
  title: string,
  artist: string,
  album?: string,
  genre?: string,
  mood?: string,
  themes?: string[],
): Promise<TrackEmbedding> {
  // Build rich text description for better semantic search
  const textParts = [
    `${title} by ${artist}`,
  ];

  if (album) textParts.push(`album: ${album}`);
  if (genre) textParts.push(`genre: ${genre}`);
  if (mood) textParts.push(`mood: ${mood}`);
  if (themes?.length) textParts.push(`themes: ${themes.join(", ")}`);

  const text = textParts.join(". ");

  const embedding = await generateEmbedding(text);

  return {
    trackId,
    videoId,
    embedding,
    text,
    createdAt: Date.now(),
  };
}

/**
 * Generate and save embedding for a track
 */
export async function indexTrack(
  trackId: string,
  videoId: string,
  title: string,
  artist: string,
  album?: string,
  genre?: string,
  mood?: string,
  themes?: string[],
): Promise<TrackEmbedding> {
  // Check if embedding already exists
  const existing = await getTrackEmbedding(trackId);
  if (existing) {
    return existing;
  }

  // Generate and save new embedding
  const embedding = await generateTrackEmbedding(
    trackId,
    videoId,
    title,
    artist,
    album,
    genre,
    mood,
    themes,
  );

  await saveTrackEmbedding(embedding);
  return embedding;
}

// ============ SIMILARITY CALCULATIONS ============

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vector dimensions must match");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  if (magnitude === 0) return 0;

  return dotProduct / magnitude;
}

/**
 * Calculate Euclidean distance between two vectors
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vector dimensions must match");
  }

  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

/**
 * Calculate Manhattan distance between two vectors
 */
export function manhattanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vector dimensions must match");
  }

  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.abs(a[i] - b[i]);
  }

  return sum;
}

// ============ VECTOR SEARCH ============

export type DistanceMetric = "cosine" | "euclidean" | "manhattan";

export interface SearchResult {
  trackId: string;
  videoId: string;
  similarity: number;
  distance: number;
  text: string;
}

/**
 * Search for similar tracks using vector similarity
 */
export async function vectorSearch(
  query: string,
  options: {
    limit?: number;
    threshold?: number;
    metric?: DistanceMetric;
  } = {},
): Promise<SearchResult[]> {
  const {
    limit = MAX_SEARCH_RESULTS,
    threshold = 0.5,
    metric = "cosine",
  } = options;

  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(query);

  // Get all track embeddings
  const embeddings = await getAllTrackEmbeddings();

  // Calculate similarities
  const results: SearchResult[] = [];

  for (const trackEmbedding of embeddings) {
    let score: number;

    switch (metric) {
      case "cosine":
        score = cosineSimilarity(queryEmbedding, trackEmbedding.embedding);
        break;
      case "euclidean": {
        // Convert distance to similarity (1 / (1 + distance))
        const dist = euclideanDistance(
          queryEmbedding,
          trackEmbedding.embedding,
        );
        score = 1 / (1 + dist);
        break;
      }
      case "manhattan": {
        // Convert distance to similarity
        const manDist = manhattanDistance(
          queryEmbedding,
          trackEmbedding.embedding,
        );
        score = 1 / (1 + manDist);
        break;
      }
      default:
        score = cosineSimilarity(queryEmbedding, trackEmbedding.embedding);
    }

    if (score >= threshold) {
      results.push({
        trackId: trackEmbedding.trackId,
        videoId: trackEmbedding.videoId,
        similarity: score,
        distance: metric === "cosine" ? 1 - score : score,
        text: trackEmbedding.text,
      });
    }
  }

  // Sort by similarity descending
  results.sort((a, b) => b.similarity - a.similarity);

  // Return top results
  return results.slice(0, limit);
}

/**
 * Find similar tracks to a given track
 */
export async function findSimilarTracks(
  trackId: string,
  options: {
    limit?: number;
    threshold?: number;
    metric?: DistanceMetric;
  } = {},
): Promise<SearchResult[]> {
  const {
    limit = MAX_SEARCH_RESULTS,
    threshold = 0.6,
    metric = "cosine",
  } = options;

  // Get track embedding
  const trackEmbedding = await getTrackEmbedding(trackId);
  if (!trackEmbedding) {
    return [];
  }

  // Get all track embeddings
  const embeddings = await getAllTrackEmbeddings();

  // Calculate similarities
  const results: SearchResult[] = [];

  for (const otherEmbedding of embeddings) {
    // Skip the same track
    if (otherEmbedding.trackId === trackId) continue;

    let score: number;

    switch (metric) {
      case "cosine":
        score = cosineSimilarity(
          trackEmbedding.embedding,
          otherEmbedding.embedding,
        );
        break;
      case "euclidean": {
        const dist = euclideanDistance(
          trackEmbedding.embedding,
          otherEmbedding.embedding,
        );
        score = 1 / (1 + dist);
        break;
      }
      case "manhattan": {
        const manDist = manhattanDistance(
          trackEmbedding.embedding,
          otherEmbedding.embedding,
        );
        score = 1 / (1 + manDist);
        break;
      }
      default:
        score = cosineSimilarity(
          trackEmbedding.embedding,
          otherEmbedding.embedding,
        );
    }

    if (score >= threshold) {
      results.push({
        trackId: otherEmbedding.trackId,
        videoId: otherEmbedding.videoId,
        similarity: score,
        distance: metric === "cosine" ? 1 - score : score,
        text: otherEmbedding.text,
      });
    }
  }

  // Sort by similarity descending
  results.sort((a, b) => b.similarity - a.similarity);

  // Return top results
  return results.slice(0, limit);
}

/**
 * Batch index multiple tracks
 */
export async function batchIndexTracks(
  tracks: Array<{
    trackId: string;
    videoId: string;
    title: string;
    artist: string;
    album?: string;
    genre?: string;
    mood?: string;
    themes?: string[];
  }>,
): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const track of tracks) {
    try {
      await indexTrack(
        track.trackId,
        track.videoId,
        track.title,
        track.artist,
        track.album,
        track.genre,
        track.mood,
        track.themes,
      );
      success++;
    } catch (error) {
      failed++;
      errors.push(`${track.trackId}: ${error}`);
    }
  }

  return { success, failed, errors };
}

// ============ CLUSTERING (for playlist generation) ============

/**
 * Group tracks into clusters based on embeddings
 * Useful for creating themed playlists
 */
export interface Cluster {
  id: string;
  trackIds: string[];
  centroid: number[];
  themes: string[];
}

export async function clusterTracks(
  numClusters: number,
): Promise<Cluster[]> {
  const embeddings = await getAllTrackEmbeddings();

  if (embeddings.length < numClusters) {
    throw new Error("Not enough tracks to create clusters");
  }

  // Initialize centroids randomly
  const centroidIndices = new Set<number>();
  while (centroidIndices.size < numClusters) {
    centroidIndices.add(Math.floor(Math.random() * embeddings.length));
  }

  const indices = Array.from(centroidIndices);
  let centroids = indices.map((i) => embeddings[i].embedding);

  // K-means clustering
  const maxIterations = 100;
  let iteration = 0;
  let clusters: Map<number, number[]> = new Map();

  while (iteration < maxIterations) {
    // Assign tracks to nearest centroid
    const newClusters: Map<number, number[]> = new Map();

    for (let i = 0; i < embeddings.length; i++) {
      const embedding = embeddings[i].embedding;
      let nearestCentroid = 0;
      let maxSimilarity = -1;

      for (let c = 0; c < centroids.length; c++) {
        const similarity = cosineSimilarity(embedding, centroids[c]);
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          nearestCentroid = c;
        }
      }

      if (!newClusters.has(nearestCentroid)) {
        newClusters.set(nearestCentroid, []);
      }
      newClusters.get(nearestCentroid)!.push(i);
    }

    // Check for convergence
    if (
      JSON.stringify(Array.from(clusters.keys())) ===
        JSON.stringify(Array.from(newClusters.keys()))
    ) {
      break;
    }

    clusters = newClusters;

    // Recalculate centroids
    const newCentroids: number[][] = [];

    for (const [clusterId, trackIndices] of clusters) {
      if (trackIndices.length === 0) {
        newCentroids[clusterId] = centroids[clusterId];
        continue;
      }

      // Calculate mean of all embeddings in cluster
      const sum = new Array(EMBEDDING_DIMENSIONS).fill(0);

      for (const idx of trackIndices) {
        const emb = embeddings[idx].embedding;
        for (let i = 0; i < emb.length; i++) {
          sum[i] += emb[i];
        }
      }

      newCentroids[clusterId] = sum.map((val) => val / trackIndices.length);
    }

    centroids = newCentroids;
    iteration++;
  }

  // Build cluster results
  const result: Cluster[] = [];

  for (const [clusterId, trackIndices] of clusters) {
    const clusterEmbeddings = trackIndices.map((i) => embeddings[i]);

    // Extract common themes from cluster text
    const texts = clusterEmbeddings.map((e) => e.text);
    const themes = extractCommonThemes(texts);

    result.push({
      id: `cluster_${clusterId}`,
      trackIds: clusterEmbeddings.map((e) => e.trackId),
      centroid: centroids[clusterId],
      themes,
    });
  }

  return result;
}

/**
 * Extract common themes from text descriptions
 */
function extractCommonThemes(texts: string[]): string[] {
  const words: Record<string, number> = {};

  for (const text of texts) {
    const tokens = text.toLowerCase().split(/\W+/);
    for (const token of tokens) {
      if (token.length > 3) {
        words[token] = (words[token] || 0) + 1;
      }
    }
  }

  return Object.entries(words)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}
