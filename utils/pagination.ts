// Copyright 2023 the Deno authors. All rights reserved. MIT license.

// This should not exceed 10 since denoKV Kv.getMany can't handle as input an array with more than 10 elements
export const PAGE_LENGTH = 10;

export function calcPageNum(url: URL) {
  return parseInt(url.searchParams.get("page") || "1");
}

export function calcLastPage(total = 0, pageLength = PAGE_LENGTH): number {
  return Math.ceil(total / pageLength);
}

export function getCursor(url: URL) {
  return url.searchParams.get("cursor") ?? undefined;
}

export async function getPagination<T>(
  iter: Deno.KvListIterator<T>,
  limit: number,
) {
  const values: T[] = [];
  let cursor = "";
  let done = true;
  for await (const entry of iter) {
    if (values.length <= limit - 1) {
      values.push(entry.value);
      cursor = iter.cursor;
    } else {
      done = false;
      break;
    }
  }

  return { values, cursor, done };
}
