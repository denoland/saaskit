// Copyright 2023 the Deno authors. All rights reserved. MIT license.
// Description: Prints kv to stdout
// Usage: deno run -A --unstable tools/dump_kv.ts
import { kv } from "@/utils/db.ts";

interface ToReplace {
  bigint: bigint;
}

function applyReplacer<T extends keyof ToReplace>(value: ToReplace[T]) {
  const revivers: { [K in keyof ToReplace]?: (value: ToReplace[K]) => string } =
    {
      bigint: (value) => value.toString(),
    };
  return revivers[typeof value as T]?.(value) ?? value;
}

export async function dumpKv() {
  const iter = kv.list({ prefix: [] });
  const items = [];
  for await (const res of iter) {
    items.push({ [res.key.toString()]: res.value });
  }
  console.log(
    `${JSON.stringify(items, (_key, value) => applyReplacer(value), 2)}`,
  );
}

if (import.meta.main) {
  await dumpKv();
  await kv.close();
}
