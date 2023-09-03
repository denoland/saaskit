// Copyright 2023 the Deno authors. All rights reserved. MIT license.
/**
 * This script is used to perform migration jobs on the database.
 * These jobs can be performed on remote KV instances using {@link https://github.com/denoland/deno/tree/main/ext/kv#kv-connect|KV Connect}.
 *
 * @example
 * ```bash
 * deno task db:migrate
 * ```
 */
import { kv, type Notification } from "@/utils/db.ts";

interface OldNotification extends Notification {
  createdAt: Date;
}

if (!confirm("WARNING: The database will be migrated. Continue?")) Deno.exit();

const iter1 = kv.list<OldNotification>({ prefix: ["notifications"] });
for await (const { key } of iter1) console.log(key);

const iter2 = kv.list<OldNotification>({ prefix: ["notifications_by_user"] });
for await (const { key } of iter2) console.log(key);

kv.close();
