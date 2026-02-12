// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
// Music API - Deno Deploy Build (ProxyHub disabled)
import tailwind from "$fresh/plugins/tailwind.ts";
// import kvOAuthPlugin from "./plugins/kv_oauth.ts";
// import sessionPlugin from "./plugins/session.ts";
// import errorHandling from "./plugins/error_handling.ts";
// import securityHeaders from "./plugins/security_headers.ts";
// import rateLimiting from "./plugins/rate_limiting.ts"; // Temporarily disabled
// import monitoring from "./plugins/monitoring.ts"; // Temporarily disabled
// import cors from "./plugins/cors.ts"; // Temporarily disabled
import type { FreshConfig } from "$fresh/server.ts";
// import { ga4Plugin } from "https://deno.land/x/fresh_ga4@0.0.4/mod.ts";

export default {
  plugins: [
    // ga4Plugin(),
    // kvOAuthPlugin,
    // sessionPlugin,
    tailwind(),
    // errorHandling,
    // securityHeaders,
    // cors,
    // rateLimiting,
    // monitoring,
  ],
} satisfies FreshConfig;
