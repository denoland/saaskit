// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { difference } from "std/datetime/difference.ts";
import { ACTIVE_LINK_STYLES, LINK_STYLES } from "@/utils/constants.ts";

export function pluralize(unit: number, label: string) {
  return unit === 1 ? `${unit} ${label}` : `${unit} ${label}s`;
}

export function timeAgo(time: number | Date) {
  const minutes = difference(new Date(), new Date(time))?.minutes;
  if (!minutes) return pluralize(0, "minute");
  if (minutes < 60) return pluralize(~~minutes, "minute");
  else if (minutes < 24 * 60) return pluralize(~~(minutes / 60), "hour");
  else return pluralize(~~(minutes / (24 * 60)), "day");
}

/**
 * Dynamically generates link styles depending on whether the given expression is truthy.
 * This is used to visually highlight a link if it matches the current page.
 *
 * @example
 * ```ts
 * import { getLinkStyles } from "@/utils/display.ts";
 *
 * const activeLinkStyles = getLinkStyles(true);
 *
 * const inactiveLinkStyles = getLinkStyles(false);
 * ```
 */
export function getLinkStyles(expr: boolean) {
  let styles = LINK_STYLES;
  if (expr) styles += " " + ACTIVE_LINK_STYLES;
  return styles;
}
