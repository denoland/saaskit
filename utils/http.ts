// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { RedirectStatus, Status } from "std/http/http_status.ts";

/**
 * Generates a redirection response to the specified location with an optional status code.
 * 
 * @param location A relative (to the request URL) or absolute URL.
 * @param status HTTP status
 * 
 * @example
 * // Redirect to a new page with a default status code (303 - See Other).
 * const redirectResponse = redirect("/new-page");
 *
 * // Redirect to a different URL with a custom status code (301 - Moved Permanently).
 * const customRedirectResponse = redirect("/different-url", 301);
 *
 * // Use the response object to initiate the redirection.
 * event.respondWith(redirectResponse);
 * // or
 * event.respondWith(customRedirectResponse);
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location}
 */
export function redirect(
  location: string,
  status: Status.Created | RedirectStatus = 303,
) {
  return new Response(null, {
    headers: {
      location,
    },
    status,
  });
}

/**
 * Retrieves the "cursor" parameter value from the given URL's query string.
 *
 * @example
 * const urlString = "https://example.com/data?cursor=12345&page=1";
 * const url = new URL(urlString);
 *
 * const cursorValue = getCursor(url);
 * console.log(cursorValue); // Output: "12345"
 */
export function getCursor(url: URL) {
  return url.searchParams.get("cursor") ?? "";
}
