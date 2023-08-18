// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { kv } from "@/utils/db.ts";

export async function migrateKv() {
  const promises = [];

  const iter1 = kv.list({ prefix: ["votes"] });
  for await (const { key } of iter1) promises.push(kv.delete(key));

  const iter2 = kv.list({ prefix: ["votes_by_item"] });
  for await (const { key } of iter2) promises.push(kv.delete(key));

  const iter3 = kv.list({ prefix: ["votes_by_user"] });
  for await (const { key } of iter3) promises.push(kv.delete(key));

  const iter4 = kv.list({ prefix: ["votes_count"] });
  for await (const { key } of iter4) promises.push(kv.delete(key));

  await Promise.all(promises);
  console.log("KV migration complete");
}

if (import.meta.main) {
  if (
    !confirm("Would you like to continue?")
  ) {
    close();
  }
  await migrateKv();
  await kv.close();
}
