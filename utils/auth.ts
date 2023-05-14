// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { MiddlewareHandlerContext } from "$fresh/server.ts";

import { createServerSupabaseClient } from "@supabase/auth-helpers-shared";
import { getCookies, setCookie } from "std/http/cookie.ts";
import { redirect } from "./http.ts";
import { CookieSerializeOptions } from "cookie";

export type SupabaseClient = ReturnType<typeof createSupabaseClient>;

export function createSupabaseClient(
  requestHeaders: Headers,
  responseHeaders: Headers,
) {
  return createServerSupabaseClient({
    supabaseUrl: Deno.env.get("SUPABASE_API_URL")!,
    supabaseKey: Deno.env.get("SUPABASE_ANON_KEY")!,
    getRequestHeader: (key: string) => requestHeaders.get(key) ?? undefined,
    getCookie: (name: string) => {
      const cookie = getCookies(requestHeaders)[name];
      return cookie ? decodeURIComponent(cookie) : undefined;
    },
    setCookie: (
      name: string,
      value: string | number | boolean,
      options: CookieSerializeOptions,
    ) =>
      setCookie(responseHeaders, {
        name,
        value: encodeURIComponent(value),
        ...options,
        sameSite: "Lax",
        httpOnly: false,
      }),
  });
}

export async function ensureLoggedInMiddleware(
  req: Request,
  ctx: MiddlewareHandlerContext,
) {
  if (!ctx.state.session) {
    return redirect(`/login?redirect_url=${encodeURIComponent(req.url)}`);
  }

  return await ctx.next();
}
