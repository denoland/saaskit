// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { SITE_DESCRIPTION } from "@/utils/constants.ts";
import { isStripeEnabled, stripe } from "@/utils/stripe.ts";
import "std/dotenv/load.ts";

if (!isStripeEnabled()) throw new Error("Stripe is disabled.");

/**
 * These values provide a set of default values for the demo.
 * However, these can be adjusted to fit your use case.
 */
const product = await stripe.products.create({
  name: "Premium",
  description: "Unlock premium features like flair and more.",
  default_price_data: {
    unit_amount: 500,
    currency: "usd",
    recurring: {
      interval: "month",
    },
  },
});

await stripe.billingPortal.configurations.create({
  features: {
    payment_method_update: {
      enabled: true,
    },
    customer_update: {
      allowed_updates: ["email", "name"],
      enabled: true,
    },
    subscription_cancel: {
      enabled: true,
      mode: "immediately",
    },
    subscription_update: {
      enabled: true,
      default_allowed_updates: ["price"],
      products: [{
        prices: [product.default_price as string],
        product: product.id,
      }],
    },
    invoice_history: { enabled: true },
  },
  business_profile: {
    headline: SITE_DESCRIPTION,
  },
});

console.log(
  "Please copy and paste this value into the `STRIPE_PREMIUM_PLAN_PRICE_ID` variable in `.env`: " +
    product.default_price,
);
