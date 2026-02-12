// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.

import {
  cancelDownloadJob,
  deleteDownloadJob,
  getDownloadJob,
  getDownloadStats,
} from "@/utils/download.ts";
import {
  errorResponse,
  handleApiError,
  successResponse,
  toJson,
} from "@/utils/api_response.ts";
import type { Handlers } from "$fresh/server.ts";

/**
 * GET /api/music/download/[jobId]
 * Get download job status
 */
export const handler: Handlers = {
  async GET(req, ctx) {
    try {
      const { jobId } = ctx.params;

      if (!jobId) {
        const response = errorResponse(
          "MISSING_PARAM",
          "jobId parameter required",
        );
        return toJson(response, 400);
      }

      const job = await getDownloadJob(jobId);

      if (!job) {
        const response = errorResponse(
          "JOB_NOT_FOUND",
          `Download job ${jobId} not found`,
        );
        return toJson(response, 404);
      }

      const response = successResponse(job);
      return toJson(response);
    } catch (error) {
      const [errorResp, status] = handleApiError(error);
      return toJson(errorResp, status);
    }
  },

  /**
   * DELETE /api/music/download/[jobId]
   * Cancel or delete a download job
   */
  async DELETE(req, ctx) {
    try {
      const { jobId } = ctx.params;
      const url = new URL(req.url);
      const force = url.searchParams.get("force") === "true";
      const userId = url.searchParams.get("userId"); // Would be from session in production

      if (!jobId) {
        const response = errorResponse(
          "MISSING_PARAM",
          "jobId parameter required",
        );
        return toJson(response, 400);
      }

      const job = await getDownloadJob(jobId);

      if (!job) {
        const response = errorResponse(
          "JOB_NOT_FOUND",
          `Download job ${jobId} not found`,
        );
        return toJson(response, 404);
      }

      // Check ownership if userId provided
      if (userId && job.userId !== userId) {
        const response = errorResponse(
          "FORBIDDEN",
          "You don't have permission to cancel this job",
        );
        return toJson(response, 403);
      }

      // If force, delete; otherwise, just cancel
      if (force) {
        await deleteDownloadJob(jobId, userId ?? undefined);
        const response = successResponse({
          jobId,
          deleted: true,
          message: "Download job deleted",
        });
        return toJson(response);
      } else {
        const cancelled = await cancelDownloadJob(jobId);

        if (!cancelled) {
          const response = errorResponse(
            "CANNOT_CANCEL",
            "Cannot cancel a completed download",
          );
          return toJson(response, 400);
        }

        const response = successResponse({
          jobId,
          cancelled: true,
          status: "cancelled",
          message: "Download job cancelled",
        });
        return toJson(response);
      }
    } catch (error) {
      const [errorResp, status] = handleApiError(error);
      return toJson(errorResp, status);
    }
  },
};
