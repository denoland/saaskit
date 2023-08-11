// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { kv } from "@/utils/db.ts";

const targetList = [
  "oauth-sessions",
  "users_by_login",
  "voted_items_by_user",
  "voted_users_by_item",
];

export async function migrateKv() {
  const iter = kv.list({ prefix: [] });
  const promises = [];
  for await (const entry of iter) {
    if (targetList.includes(entry.key[0] as string)) {
      promises.push(kv.delete(entry.key));
      console.log(entry.key);
    }
  }
  await Promise.all(promises);
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
