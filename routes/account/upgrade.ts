// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import { FreshContext, HttpError } from "fresh";
import type { SignedInState } from "@/middlewares/session.ts";
import {
  getStripePremiumPlanPriceId,
  isStripeEnabled,
  stripe,
} from "@/utils/stripe.ts";

export default async (ctx: FreshContext<SignedInState>): Promise<Response> => {
  if (!isStripeEnabled()) throw new HttpError(404);
  const stripePremiumPlanPriceId = getStripePremiumPlanPriceId();
  if (stripePremiumPlanPriceId === undefined) {
    throw new Error(
      '"STRIPE_PREMIUM_PLAN_PRICE_ID" environment variable not set',
    );
  }

  const { url } = await stripe.checkout.sessions.create({
    success_url: ctx.url.origin + "/account",
    customer: ctx.state.sessionUser.stripeCustomerId,
    line_items: [
      {
        price: stripePremiumPlanPriceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
  });
  if (url === null) throw new HttpError(404);

  return ctx.redirect(url);
};
