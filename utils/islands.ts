// Copyright 2023 the Deno authors. All rights reserved. MIT license.

/**
 * Asynchronously fetches values from the specified endpoint with an optional cursor.
 *
 * @example
 * // Fetch values without a cursor
 * const valuesWithoutCursor = await fetchValues("/api/data", "");
 *
 * // Fetch values with a cursor
 * const cursor = "123456";
 * const valuesWithCursor = await fetchValues("/api/data", cursor);
 */
export async function fetchValues<T>(endpoint: string, cursor: string) {
  let url = endpoint;
  if (cursor !== "") url += "?cursor=" + cursor;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Request failed: GET ${url}`);
  return await resp.json() as { values: T[]; cursor: string };
}
