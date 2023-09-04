// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import Stripe from "stripe";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");

export const stripe = STRIPE_SECRET_KEY !== undefined
  ? new Stripe(
    STRIPE_SECRET_KEY,
    {
      apiVersion: "2022-11-15",
      // Use the Fetch API instead of Node's HTTP client.
      httpClient: Stripe.createFetchHttpClient(),
    },
  )
  : undefined;

if (stripe) {
  console.log(
    "`STRIPE_SECRET_KEY` environment variable is defined. Stripe is enabled.",
  );
} else {
  console.log(
    "`STRIPE_SECRET_KEY` environment variable is not defined. Stripe is disabled.",
  );
}

/**
 * We assume that the product has a default price.
 * The official types allow for the default_price to be `undefined | null | string`
 */
export type StripProductWithPrice = Stripe.Product & {
  default_price: Stripe.Price;
};

/**
 * Type guard function to check if a Stripe product has a valid price.
 *
 * @param {Stripe.Product} product - The Stripe product to be checked.
 *
 * @returns {product is StripProductWithPrice} A boolean value indicating whether the provided product meets the criteria for being a `StripProductWithPrice`.
 */
export function isProductWithPrice(product: Stripe.Product): product is StripProductWithPrice {
  return (
    product.default_price !== undefined &&
    product.default_price !== null &&
    typeof product.default_price !== "string"
  );
}


/**
 * Format a numeric amount with a specified currency for display.
 *
 * @param {number} amount - The numeric amount to be formatted.
 * @param {string} currency - The currency code (e.g., "USD", "EUR") for formatting.
 *
 * @returns {string} A formatted string representing the amount with the currency symbol.
 */
export function formatAmountForDisplay(amount: number, currency: string): string {
  // Create a new `Intl.NumberFormat` object with the specified options for formatting.
  const numberFormat = new Intl.NumberFormat(
    navigator.language, // Use the user's preferred language for formatting.
    {
      style: "currency", // Format as currency.
      currency, // Specify the currency code.
      currencyDisplay: "symbol", // Display the currency symbol (e.g., $, €).
      maximumFractionDigits: 0, // Maximum number of decimal places (0 for whole numbers).
    },
  );

  // Format the numeric `amount` using the `numberFormat` object and return the result as a string.
  return numberFormat.format(amount);
}

