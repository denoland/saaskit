// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import { FreshContext, HttpError } from "fresh";
import type { SignedInState } from "@/middlewares/session.ts";
import { isStripeEnabled, stripe } from "@/utils/stripe.ts";
import { define } from "../../utils/define.ts";

export default define.handlers(async (ctx) => {
  const { sessionUser } = ctx.state;
  if (!isStripeEnabled() || sessionUser.stripeCustomerId === undefined) {
    throw new HttpError(404);
  }

  const { url } = await stripe.billingPortal.sessions.create({
    customer: sessionUser.stripeCustomerId,
    return_url: ctx.url.origin + "/account",
  });
  return ctx.redirect(url);
});
