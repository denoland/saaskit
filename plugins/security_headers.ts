// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import type { Plugin } from "$fresh/server.ts";
import securityHeadersMiddleware from "../middlewares/security_headers.ts";

export default {
  name: "security-headers",
  middlewares: [
    {
      path: "/",
      middleware: {
        handler: securityHeadersMiddleware,
      },
    },
  ],
} as Plugin;
