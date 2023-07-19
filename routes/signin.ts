// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { RouteContext } from "$fresh/server.ts";
import type { State } from "./_middleware.ts";
import { redirect, setRedirectUrlCookie } from "@/utils/redirect.ts";
import { signIn } from "kv_oauth";
import { oauth2Client } from "@/utils/oauth2_client.ts";

/**
 * Redirects the client to the authenticated redirect path if already login.
 * If not logged in, it continues to rendering the login page.
 */
export default async function SignInPage(
  req: Request,
  ctx: RouteContext<unknown, State>,
) {
  if (ctx.state.sessionId !== undefined) return redirect("/");

  const resp = await signIn(req, oauth2Client);
  setRedirectUrlCookie(req, resp);
  return resp;
}
