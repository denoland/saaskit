import type { Stripe } from "stripe";

async function createPremiumTierProduct(stripe: Stripe) {
  return await stripe.products.create({
    name: "Premium tier",
    description: "Unlimited todos",
    default_price_data: {
      unit_amount: 500,
      currency: "usd",
      recurring: {
        interval: "month",
      },
    },
  });
}

async function createDefaultPortalConfiguration(
  stripe: Stripe,
  premiumTierProductId: string,
) {
  return await stripe.billingPortal.configurations.create({
    features: {
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
          prices: [premiumTierProductId],
          product: premiumTierProductId,
        }],
      },
      invoice_history: { enabled: true },
    },
    business_profile: {},
  });
}

if (import.meta.main) {
  await createPremiumTierProduct(stripe);
}
