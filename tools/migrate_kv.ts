// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { kv } from "@/utils/db.ts";

export async function migrateKv() {
  const iter = kv.list({ prefix: ["votes_count"] });
  const promises = [];
  for await (const { key } of iter) promises.push(kv.delete(key));
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
