// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  deleteNotification,
  Item,
  kv,
  type Notification,
  User,
} from "@/utils/db.ts";

type OldItem = Omit<Item, "userLogin"> & { userId: string };
type OldUser = User & { id: string };
interface OldVote {
  item: OldItem;
  user: OldUser;
}

async function migrateItem(item: OldItem) {
  const userRes = await kv.get<User>(["users", item.userId]);
  if (userRes.value === null) {
    throw new Deno.errors.NotFound(`User not found: ${item.userId}`);
  }

  const itemsKey = ["items", item.id];
  const itemsByTimeKey = ["items_by_time", item.createdAt.getTime(), item.id];
  const itemsByUserKey = ["items_by_user", userRes.value.login, item.id];
  const oldItemsByUserKey = ["items_by_user", item.userId, item.id];

  const res = await kv.atomic()
    .set(itemsKey, item)
    .set(itemsByTimeKey, item)
    .set(itemsByUserKey, item)
    .delete(oldItemsByUserKey)
    .commit();

  if (!res.ok) throw new Error(`Failed to migrate item: ${item}`);
}

export async function migrateKv() {
  const promises = [];

  // Items
  const itemsIter = kv.list<OldItem>({ prefix: ["items"] });
  for await (const entry of itemsIter) {
    if (entry.value.userId) {
      promises.push(migrateItem(entry.value));
    }
  }

  // Notifications
  const notificationsIter = kv.list<Notification>({
    prefix: ["notifications"],
  });
  for await (const entry of notificationsIter) {
    promises.push(deleteNotification(entry.value));
  }

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
