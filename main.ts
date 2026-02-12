// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

console.log("[STARTUP] Starting app...");

import { start } from "$fresh/server.ts";
console.log("[STARTUP] Imported fresh server");

import manifest from "./fresh.gen.ts";
console.log("[STARTUP] Imported manifest");

import config from "./fresh.config.ts";
console.log("[STARTUP] Imported config");

// Music API - Deno Deploy
// Integrated with YouTube Music, Last.fm, Piped, and LRCLib
import { isStripeEnabled } from "@/utils/stripe.ts";
console.log("[STARTUP] Imported stripe utils");

console.log(
  isStripeEnabled()
    ? "`STRIPE_SECRET_KEY` environment variable is defined. Stripe is enabled."
    : "`STRIPE_SECRET_KEY` environment variable is not defined. Stripe is disabled.\n" +
      "For more information on how to set up Stripe, see https://github.com/denoland/saaskit#set-up-stripe-optional",
);

console.log("[STARTUP] About to call start()");
await start(manifest, config);
console.log("[STARTUP] Started successfully");
