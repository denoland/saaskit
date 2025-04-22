// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import { type FreshContext, HttpError } from "fresh";
import { getSessionId } from "kv_oauth/mod.ts";
import { getUserBySession } from "@/utils/db.ts";
import type { User } from "@/utils/db.ts";

export interface State {
  /** Title of the current page */
  tite: string;
  /** Description of the current page */
  description: string;
  /** URL of the cover image */
  imageUrl: string;
  sessionUser?: User;
}

export type SignedInState = Required<State>;

export async function setSessionState(
  ctx: FreshContext<State>,
): Promise<Response> {
  // Initial state
  ctx.state.sessionUser = undefined;

  const sessionId = getSessionId(ctx.req);
  if (sessionId === undefined) return ctx.next();
  const user = await getUserBySession(sessionId);
  if (user === null) return ctx.next();

  ctx.state.sessionUser = user;

  return ctx.next();
}

export function ensureSignedIn(ctx: FreshContext<State>): Promise<Response> {
  if (ctx.state.sessionUser === undefined) {
    throw new HttpError(401);
  }
  return ctx.next();
}
