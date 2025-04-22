// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import { App, fsRoutes, staticFiles, trailingSlashes } from "fresh";
import type { State } from "@/plugins/session.ts";
import { isStripeEnabled } from "@/utils/stripe.ts";
import { ensureSignedIn, setSessionState } from "./middlewares/session.ts";

console.log(
  isStripeEnabled()
    ? "`STRIPE_SECRET_KEY` environment variable is defined. Stripe is enabled."
    : "`STRIPE_SECRET_KEY` environment variable is not defined. Stripe is disabled.\n" +
      "For more information on how to set up Stripe, see https://github.com/denoland/saaskit#set-up-stripe-optional",
);

export const app = new App<State>()
  .use(trailingSlashes("never"))
  .use(staticFiles())
  .get("/", setSessionState)
  .get("/account", ensureSignedIn)
  .get("/dashboard", ensureSignedIn)
  .get("/api/me", ensureSignedIn)
  .post("/api/vote", ensureSignedIn);

await fsRoutes(app, {
  dir: "./",
  loadIsland: (path) => import(`./islands/${path}`),
  loadRoute: (path) => import(`./routes/${path}`),
});

if (import.meta.main) {
  console.log(
    isStripeEnabled()
      ? "`STRIPE_SECRET_KEY` environment variable is defined. Stripe is enabled."
      : "`STRIPE_SECRET_KEY` environment variable is not defined. Stripe is disabled.\n" +
        "For more information on how to set up Stripe, see https://github.com/denoland/saaskit#set-up-stripe-optional",
  );

  await app.listen({ port: Number(Deno.env.get("PORT") ?? 8080) });
}
