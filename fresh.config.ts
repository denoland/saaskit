// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import twindPlugin from "$fresh/plugins/twindv1.ts";
import { FreshOptions } from "$fresh/server.ts";
import errorHandling from "./plugins/error_handling.ts";
import ga4 from "./plugins/ga4.ts";
import kvOAuthPlugin from "./plugins/kv_oauth.ts";
import protectedRoutes from "./plugins/protected_routes.ts";
import twindConfig from "./twind.config.ts";

export default {
  plugins: [
    ga4,
    kvOAuthPlugin,
    protectedRoutes,
    twindPlugin(twindConfig),
    errorHandling,
  ],
} as FreshOptions;
