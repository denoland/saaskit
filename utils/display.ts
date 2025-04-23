// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import { difference, type Unit } from "$std/datetime/difference.ts";

const units = [
  "years",
  "months",
  "weeks",
  "days",
  "hours",
  "minutes",
  "seconds",
] as Unit[];

/**
 * Returns how long ago a given date is from now.
 *
 * @example
 * ```ts
 * import { timeAgo } from "@/utils/display.ts";
 * import { SECOND, MINUTE, HOUR } from "$std/datetime/constants.ts";
 *
 * timeAgo(new Date()); // Returns "just now"
 * timeAgo(new Date(Date.now() - 3 * HOUR)); // Returns "3 hours ago"
 * ```
 */
export function timeAgo(date: Date): string {
  const now = new Date();
  if (date > now) throw new Error("Timestamp must be in the past");
  const duration = difference(date, now, { units });
  if (duration.seconds === 0) return "just now";
  const largestUnit = units.find((unit) => duration[unit]! > 0) || "seconds";
  // @ts-ignore - TS doesn't know about this API yet
  return new Intl.DurationFormat("en", { style: "long" })
    .format({ [largestUnit]: duration[largestUnit] }) + " ago";
}

/**
 * Returns a formatted string based on the given amount of currency and the
 * `en-US` locale. Change the locale for your use case as required.
 *
 * @see {@linkcode Intl.NumberFormat}
 *
 * @example
 * ```ts
 * import { formatCurrency } from "@/utils/display.ts";
 *
 * formatCurrency(5, "USD"); // Returns "$5"
 * ```
 */
export function formatCurrency(
  amount: number,
  currency: string,
): string {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
      maximumFractionDigits: 0,
    },
  ).format(amount)
    // Issue: https://stackoverflow.com/questions/44533919/space-after-symbol-with-js-intl
    .replace(/^(\D+)/, "$1")
    .replace(/\s+/, "");
}
