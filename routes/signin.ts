// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers } from "$fresh/server.ts";
import type { State } from "./_middleware.ts";
import { redirect, setRedirectUrlCookie } from "@/utils/redirect.ts";
import { signIn } from "kv_oauth";
import { oauth2Client } from "@/utils/oauth2_client.ts";

// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, State> = {
  /**
   * Redirects the client to the authenticated redirect path if already login.
   * If not logged in, it continues to rendering the login page.
   */
  async GET(req, ctx) {
    if (ctx.state.sessionId !== undefined) return redirect("/");

    const resp = await signIn(req, oauth2Client);
    setRedirectUrlCookie(req, resp);
    return resp;
  },
};
