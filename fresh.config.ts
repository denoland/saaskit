// Copyright 2023 the Deno authors. All rights reserved. MIT license.
// import { defineConfig } from "$fresh/server.ts";
import twindPlugin from "$fresh/plugins/twindv1.ts";
import twindConfig from "./twind.config.ts";
import kvOAuthPlugin from "./plugins/kv_oauth.ts";
import { FreshOptions } from "$fresh/server.ts";

/* export default defineConfig({
  plugins: [twindPlugin(twindConfig), kvOAuthPlugin],
}); */

export default {
  plugins: [twindPlugin(twindConfig), kvOAuthPlugin],
} as FreshOptions;
