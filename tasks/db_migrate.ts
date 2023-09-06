// Copyright 2023 the Deno authors. All rights reserved. MIT license.
/**
 * This script is used to perform migration jobs on the database. These jobs
 * can be performed on remote KV instances using
 * {@link https://github.com/denoland/deno/tree/main/ext/kv#kv-connect|KV Connect}.
 *
 * This script will continually change over time for database migrations, as
 * required.
 *
 * @example
 * ```bash
 * deno task db:migrate
 * ```
 */
import { createItem, type Item, kv } from "@/utils/db.ts";
import { monotonicUlid } from "std/ulid/mod.ts";

interface OldItem extends Item {
  createdAt: Date;
}

if (!confirm("WARNING: The database will be migrated. Continue?")) Deno.exit();

const promises = [];

const iter1 = kv.list<OldItem>({ prefix: ["items"] });
for await (const { key, value } of iter1) {
  if (!value.createdAt) continue;
  promises.push(kv.delete(key));
  promises.push(createItem({
    id: monotonicUlid(value.createdAt.getTime()),
    userLogin: value.userLogin,
    url: value.url,
    title: value.title,
    score: value.score,
  }));
}

/** @todo(iuioiua) Voting data */

const results = await Promise.allSettled(promises);
results.forEach((result) => {
  if (result.status === "rejected") console.error(result);
});

kv.close();
