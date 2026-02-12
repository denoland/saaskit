// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.

/**
 * Download System for Audio Files
 * Handles audio file downloads, conversion, and progress tracking
 */

import { ulid } from "jsr:@std/ulid@^1.0.0";
import { kv } from "@/utils/db.ts";
import { fetchFromInvidious, fetchFromPiped } from "@/utils/music_client.ts";

// ============ DOWNLOAD MODELS ============

export interface DownloadJob {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  userId?: string;
  status:
    | "queued"
    | "downloading"
    | "converting"
    | "completed"
    | "failed"
    | "cancelled";
  progress: number; // 0-100
  format?: "mp3" | "m4a" | "webm" | "wav";
  quality?: "low" | "medium" | "high";
  filePath?: string;
  fileSize?: number;
  error?: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  downloadUrl?: string;
}

export interface DownloadOptions {
  format?: "mp3" | "m4a" | "webm" | "wav";
  quality?: "low" | "medium" | "high";
  bitrate?: number;
}

// ============ DOWNLOAD JOB MANAGEMENT ============

/**
 * Create a new download job
 */
export async function createDownloadJob(
  videoId: string,
  title: string,
  artist: string,
  userId?: string,
  options?: DownloadOptions,
): Promise<DownloadJob> {
  const job: DownloadJob = {
    id: ulid(),
    videoId,
    title,
    artist,
    userId,
    status: "queued",
    progress: 0,
    format: options?.format || "mp3",
    quality: options?.quality || "medium",
    createdAt: Date.now(),
  };

  await kv.set(["download_jobs", job.id], job);
  await kv.set(["download_jobs_by_video", videoId, job.id], job.id);

  if (userId) {
    await kv.set(["download_jobs_by_user", userId, job.id], job.id);
  }

  return job;
}

/**
 * Get download job by ID
 */
export async function getDownloadJob(
  jobId: string,
): Promise<DownloadJob | null> {
  const res = await kv.get(["download_jobs", jobId]);
  return res.value as DownloadJob | null;
}

/**
 * Get download job by video ID
 */
export async function getDownloadJobByVideoId(
  videoId: string,
): Promise<DownloadJob | null> {
  const iter = kv.list({ prefix: ["download_jobs_by_video", videoId] });
  const entries = [];

  for await (const entry of iter) {
    entries.push(entry);
  }

  if (entries.length === 0) return null;

  const jobId = entries[0].value as string;
  return getDownloadJob(jobId);
}

/**
 * Get all download jobs for a user
 */
export async function getUserDownloadJobs(
  userId: string,
  limit = 50,
): Promise<DownloadJob[]> {
  const iter = kv.list(
    { prefix: ["download_jobs_by_user", userId] },
    { limit, reverse: true },
  );

  const jobs: DownloadJob[] = [];
  for await (const entry of iter) {
    const jobId = entry.value as string;
    const job = await getDownloadJob(jobId);
    if (job) jobs.push(job);
  }

  return jobs;
}

/**
 * Update download job progress
 */
export async function updateDownloadJob(
  jobId: string,
  updates: Partial<
    Omit<
      DownloadJob,
      "id" | "videoId" | "title" | "artist" | "createdAt" | "userId"
    >
  >,
): Promise<DownloadJob | null> {
  const job = await getDownloadJob(jobId);
  if (!job) return null;

  const updated: DownloadJob = {
    ...job,
    ...updates,
  };

  await kv.set(["download_jobs", jobId], updated);
  return updated;
}

/**
 * Complete download job
 */
export function completeDownloadJob(
  jobId: string,
  filePath: string,
  fileSize: number,
  downloadUrl: string,
): Promise<DownloadJob | null> {
  return updateDownloadJob(jobId, {
    status: "completed",
    progress: 100,
    filePath,
    fileSize,
    downloadUrl,
    completedAt: Date.now(),
  });
}

/**
 * Fail download job
 */
export function failDownloadJob(
  jobId: string,
  error: string,
): Promise<DownloadJob | null> {
  return updateDownloadJob(jobId, {
    status: "failed",
    error,
    completedAt: Date.now(),
  });
}

/**
 * Cancel download job
 */
export async function cancelDownloadJob(jobId: string): Promise<boolean> {
  const job = await getDownloadJob(jobId);
  if (!job || job.status === "completed") return false;

  await updateDownloadJob(jobId, {
    status: "cancelled",
    completedAt: Date.now(),
  });

  return true;
}

/**
 * Delete download job
 */
export async function deleteDownloadJob(
  jobId: string,
  userId?: string,
): Promise<boolean> {
  const job = await getDownloadJob(jobId);
  if (!job) return false;

  // Check ownership if userId provided
  if (userId && job.userId !== userId) return false;

  await kv.atomic()
    .delete(["download_jobs", jobId])
    .delete(["download_jobs_by_video", job.videoId, jobId])
    .delete(["download_jobs_by_user", userId || "anonymous", jobId])
    .commit();

  return true;
}

/**
 * Clean up old download jobs
 */
export async function cleanupOldDownloadJobs(
  maxAge = 7 * 24 * 60 * 60 * 1000,
): Promise<number> {
  const cutoff = Date.now() - maxAge;
  const iter = kv.list({ prefix: ["download_jobs"] });
  let deleted = 0;

  for await (const entry of iter) {
    const job = entry.value as DownloadJob;

    // Only clean up completed or failed jobs older than maxAge
    if (
      (job.status === "completed" || job.status === "failed") &&
      job.completedAt &&
      job.completedAt < cutoff
    ) {
      await deleteDownloadJob(job.id);
      deleted++;
    }
  }

  return deleted;
}

// ============ DOWNLOAD EXECUTION ============

/**
 * Select best audio stream based on quality preference
 * Exported for testing purposes
 */
export function selectBestStream(
  streams: {
    url: string;
    quality?: string;
    bitrate?: number;
    mimeType?: string;
  }[],
  quality: "low" | "medium" | "high",
) {
  // Filter for audio streams
  const audioStreams = streams.filter((s) => s.mimeType?.includes("audio"));

  if (audioStreams.length === 0) return null;

  // Sort by bitrate
  audioStreams.sort((a, b) => {
    const bitA = a.bitrate || 0;
    const bitB = b.bitrate || 0;
    return bitB - bitA;
  });

  // Select based on quality preference
  switch (quality) {
    case "low":
      return audioStreams[audioStreams.length - 1] || audioStreams[0];
    case "high":
      return audioStreams[0];
    case "medium":
    default: {
      // Select middle stream
      const mid = Math.floor(audioStreams.length / 2);
      return audioStreams[mid] || audioStreams[0];
    }
  }
}

/**
 * Process download job (download and optionally convert)
 */
export async function processDownloadJob(jobId: string): Promise<DownloadJob> {
  const job = await getDownloadJob(jobId);
  if (!job) {
    throw new Error("Download job not found");
  }

  // Update status to downloading
  await updateDownloadJob(jobId, {
    status: "downloading",
    startedAt: Date.now(),
    progress: 0,
  });

  try {
    // Try to fetch streaming URLs from Piped first, then Invidious
    let streamData = await fetchFromPiped(job.videoId);

    if (!streamData.success) {
      streamData = await fetchFromInvidious(job.videoId);
    }

    if (!streamData.success) {
      throw new Error("Could not fetch streaming URLs");
    }

    // Update progress
    await updateDownloadJob(jobId, { progress: 50 });

    // Select best stream
    const streamingUrls = streamData.streamingUrls as {
      url: string;
      quality?: string;
      bitrate?: number;
      mimeType?: string;
    }[];

    const selectedStream = selectBestStream(
      streamingUrls,
      job.quality || "medium",
    );

    if (!selectedStream) {
      throw new Error("No suitable audio stream found");
    }

    // For now, we'll just return the streaming URL
    // In a real implementation, you would:
    // 1. Download the audio file
    // 2. Convert to desired format (ffmpeg)
    // 3. Save to storage
    // 4. Return download URL

    const result = await completeDownloadJob(
      jobId,
      "", // filePath - would be set after actual download
      0, // fileSize - would be set after actual download
      selectedStream.url,
    );

    if (!result) {
      throw new Error("Failed to complete download job");
    }

    return result;
  } catch (error) {
    await failDownloadJob(jobId, String(error));
    throw error;
  }
}

/**
 * Batch process download jobs
 */
export async function processDownloadQueue(maxConcurrent = 3): Promise<void> {
  // Get all queued jobs
  const iter = kv.list({ prefix: ["download_jobs"] });
  const queuedJobs: DownloadJob[] = [];

  for await (const entry of iter) {
    const job = entry.value as DownloadJob;
    if (job.status === "queued") {
      queuedJobs.push(job);
    }
  }

  // Process jobs with concurrency limit
  const processing: Promise<void>[] = [];

  for (const job of queuedJobs) {
    if (processing.length >= maxConcurrent) {
      await Promise.race(processing);
      processing.shift();
    }

    const promise = processDownloadJob(job.id)
      .catch((error) => console.error(`Download job ${job.id} failed:`, error))
      .then(() => {
        const idx = processing.indexOf(promise as unknown as Promise<void>);
        if (idx > -1) processing.splice(idx, 1);
      });

    processing.push(promise);
  }

  await Promise.all(processing);
}

// ============ DOWNLOAD STATS ============

export interface DownloadStats {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalBytesDownloaded: number;
  averageDownloadTime: number;
}

/**
 * Get download statistics
 */
export async function getDownloadStats(
  userId?: string,
): Promise<DownloadStats> {
  const jobs = userId
    ? await getUserDownloadJobs(userId, 1000)
    : await (async () => {
      const iter = kv.list({ prefix: ["download_jobs"] });
      const allJobs: DownloadJob[] = [];
      for await (const entry of iter) {
        allJobs.push(entry.value as DownloadJob);
      }
      return allJobs;
    })();

  const stats: DownloadStats = {
    totalJobs: jobs.length,
    activeJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    totalBytesDownloaded: 0,
    averageDownloadTime: 0,
  };

  let totalDownloadTime = 0;
  let completedWithTime = 0;

  for (const job of jobs) {
    switch (job.status) {
      case "downloading":
      case "converting":
      case "queued":
        stats.activeJobs++;
        break;
      case "completed":
        stats.completedJobs++;
        stats.totalBytesDownloaded += job.fileSize || 0;
        if (job.startedAt && job.completedAt) {
          totalDownloadTime += job.completedAt - job.startedAt;
          completedWithTime++;
        }
        break;
      case "failed":
        stats.failedJobs++;
        break;
    }
  }

  stats.averageDownloadTime = completedWithTime > 0
    ? totalDownloadTime / completedWithTime
    : 0;

  return stats;
}
