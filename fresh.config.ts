// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import kvOAuthPlugin from "./plugins/kv_oauth.ts";
import sessionPlugin from "./plugins/session.ts";
import errorHandling from "./plugins/error_handling.ts";
import securityHeaders from "./plugins/security_headers.ts";
import welcomePlugin from "./plugins/welcome.ts";
import { FreshOptions } from "$fresh/server.ts";
import tailwindPlugin from "$fresh/plugins/tailwind.ts";

export default {
  plugins: [
    welcomePlugin,
    kvOAuthPlugin,
    sessionPlugin,
    tailwindPlugin({
      css: "./styles.css",
      mode: "build",
      dest: "./static/styles",
    }, {
      content: [
        "./routes/**/*.{ts,tsx}",
        "./islands/**/*.tsx",
        "./components/**/*.tsx",
      ],
    }),
    errorHandling,
    securityHeaders,
  ],
} as FreshOptions;
