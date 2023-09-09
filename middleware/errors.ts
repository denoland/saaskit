// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { type MiddlewareHandlerContext, Status } from "$fresh/server.ts";
import { redirect } from "@/utils/http.ts";
import { errors, isHttpError } from "std/http/http_errors.ts";

// For web pages
export async function handleWebPageErrors(
  _req: Request,
  ctx: MiddlewareHandlerContext,
) {
  try {
    return await ctx.next();
  } catch (error) {
    if (error instanceof errors.Unauthorized) return redirect("/signin");
    throw error;
  }
}

/**
 * Returns the converted HTTP error response from the given HTTP-flavored
 * error.
 *
 * @see {@link https://deno.land/std/http/http_errors.ts}
 *
 * @example
 * ```ts
 * import { toErrorResponse } from "@/middleware/errors.ts";
 * import { errors } from "std/http/http_errors.ts";
 *
 * const resp = toErrorResponse(new errors.NotFound("User not found"));
 * resp.status; // Returns 404
 * await resp.text(); // Returns "User not found"
 * ```
 */
// deno-lint-ignore no-explicit-any
export function toErrorResponse(error: any) {
  if (error instanceof Deno.errors.NotFound) {
    return new Response(error.message, { status: Status.NotFound });
  }
  return isHttpError(error)
    ? new Response(error.message, {
      status: error.status,
      headers: error.headers,
    })
    : new Response(error.message, { status: Status.InternalServerError });
}

/**
 * Handles HTTP-flavored errors, if they are thrown in a proceeding middleware.
 */
export async function handleRestApiErrors(
  _req: Request,
  ctx: MiddlewareHandlerContext,
) {
  try {
    return await ctx.next();
  } catch (error) {
    return toErrorResponse(error);
  }
}
