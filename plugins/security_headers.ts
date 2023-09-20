// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { type Plugin } from "$fresh/server.ts";

export default {
  name: "security-headers",
  middlewares: [
    {
      path: "/",
      middleware: {
        handler: async (req, ctx) => {
          if (
            ctx.destination !== "route" ||
            new URL(req.url).pathname.startsWith("/api")
          ) return await ctx.next();

          const response = await ctx.next();

          // TODO(Jabolol): Implement Content-Security-Policy
          response.headers.set(
            "Strict-Transport-Security",
            "max-age=63072000;",
          );
          response.headers.set(
            "Referrer-Policy",
            "strict-origin-when-cross-origin",
          );
          response.headers.set("X-Content-Type-Options", "nosniff");
          response.headers.set("X-Frame-Options", "SAMEORIGIN");
          response.headers.set("X-XSS-Protection", "1; mode=block");

          return response;
        },
      },
    },
  ],
} as Plugin;
