// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { MiddlewareHandlerContext } from "$fresh/server.ts";

export async function hardenHeaders(
  req: Request,
  ctx: MiddlewareHandlerContext,
) {
  if (
    ctx.destination !== "route" || new URL(req.url).pathname.startsWith("/api")
  ) return await ctx.next();
  
  const response = await ctx.next();

  const contentSecurityPolicy = [
    "default-src 'self'",
    "img-src 'self' https://avatars.githubusercontent.com",
    "frame-ancestors 'self'",
    "script-src 'self' 'unsafe-inline';",
    "style-src 'self' 'unsafe-inline'",
    "object-src 'none'",
  ];

  response.headers.set(
    "Content-Security-Policy",
    contentSecurityPolicy.join("; "),
  );
  response.headers.set("Strict-Transport-Security", "max-age=63072000;");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}
