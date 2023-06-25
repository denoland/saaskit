// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import Stripe from "stripe";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");

export const stripe: Stripe | undefined = STRIPE_SECRET_KEY
  ? new Stripe(
    STRIPE_SECRET_KEY,
    {
      apiVersion: "2022-11-15",
      // Use the Fetch API instead of Node's HTTP client.
      httpClient: Stripe.createFetchHttpClient(),
    },
  )
  : undefined;

export function formatAmountForDisplay(
  amount: number,
  currency: string,
): string {
  const numberFormat = new Intl.NumberFormat(
    navigator.language,
    {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
    },
  );
  const parts = numberFormat.formatToParts(amount);
  const amountToFormat = parts.some((part) => part.type === "decimal")
    ? amount / 100
    : amount;
  return numberFormat.format(amountToFormat);
}
