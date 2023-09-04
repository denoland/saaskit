// Copyright 2023 the Deno authors. All rights reserved. MIT license.

/**
 * Fetch data from a specified API endpoint with optional cursor.
 *
 * @template T - The type of data you expect to receive from the API.
 *
 * @param {string} endpoint - The URL of the API endpoint to fetch data from.
 * @param {string} cursor - Optional cursor parameter for paginated requests.
 *
 * @throws {Error} If the HTTP request to the endpoint fails or if the response is not OK (HTTP status code 200).
 *
 * @returns {Promise<{ values: T[]; cursor: string }>} A Promise that resolves to an object containing the retrieved data and cursor.
 */
export async function fetchValues<T>(endpoint: string, cursor: string): Promise<{ values: T[]; cursor: string; }> {
  let url = endpoint;
  
  // Append the cursor parameter to the URL if it's provided.
  if (cursor !== "") url += "?cursor=" + cursor;
  
  // Send an HTTP GET request to the specified endpoint.
  const resp = await fetch(url);

  // Check if the response status is not OK (HTTP status code 200).
  if (!resp.ok) {
    throw new Error(`Request failed: GET ${url}`);
  }

  // Parse the response body as JSON and specify the type of data you expect (values and cursor).
  return await resp.json() as { values: T[]; cursor: string };
}

