// Copyright 2023 the Deno authors. All rights reserved. MIT license.
/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import * as path from "std/path/mod.ts";
import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";

import twindPlugin from "$fresh/plugins/twindv1.ts";
import twindConfig from "./twind.config.ts";

import {
  kvAdminPlugin,
} from "https://raw.githubusercontent.com/deer/fresh_kv_admin/main/mod.ts";

/**
 * @todo Remove at v1. This is a quick way to reset Deno KV, as database changes are likely to occur and require reset.
 */
import { resetKv } from "./tools/reset_kv.ts";
import { migrateKv } from "./tools/migrate_kv.ts";

if (Deno.env.get("RESET_DENO_KV") === "1") {
  await resetKv();
}

/**
 * @todo Remove at v1. This is a quick way to migrate Deno KV, as database changes are likely to occur and require adjustment.
 */
if (Deno.env.get("MIGRATE_DENO_KEY") === "1") {
  await migrateKv();
}

await start(manifest, {
  plugins: [
    twindPlugin(twindConfig),
    await kvAdminPlugin({
      modelPath: path.join(path.dirname(import.meta.url), "utils/types.ts"),
    }),
  ],
});
