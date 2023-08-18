// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  type Comment,
  createComment,
  createItem,
  createNotification,
  createUser,
  deleteComment,
  deleteItem,
  deleteNotification,
  deleteUserBySession,
  formatDate,
  getAllItems,
  getCommentsByItem,
  getDatesSince,
  getItem,
  getItemsByUser,
  getItemsSince,
  getManyMetrics,
  getNotification,
  getNotificationsByUser,
  getUser,
  getUserBySession,
  getUserByStripeCustomer,
  ifUserHasNotifications,
  incrVisitsCountByDay,
  type Item,
  newCommentProps,
  newItemProps,
  newNotificationProps,
  newUserProps,
  Notification,
  updateUser,
  type User,
} from "./db.ts";
import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertRejects,
} from "std/testing/asserts.ts";
import { DAY } from "std/datetime/constants.ts";

function genNewComment(): Comment {
  return {
    itemId: crypto.randomUUID(),
    userLogin: crypto.randomUUID(),
    text: crypto.randomUUID(),
    ...newCommentProps(),
  };
}

function genNewItem(): Item {
  return {
    userLogin: crypto.randomUUID(),
    title: crypto.randomUUID(),
    url: `http://${crypto.randomUUID()}.com`,
    ...newItemProps(),
  };
}

function genNewUser(): User {
  return {
    login: crypto.randomUUID(),
    sessionId: crypto.randomUUID(),
    stripeCustomerId: crypto.randomUUID(),
    ...newUserProps(),
  };
}

function genNewNotification(): Notification {
  return {
    userLogin: crypto.randomUUID(),
    type: crypto.randomUUID(),
    text: crypto.randomUUID(),
    originUrl: crypto.randomUUID(),
    ...newNotificationProps(),
  };
}

Deno.test("[db] newItemProps()", () => {
  const itemProps = newItemProps();
  assert(itemProps.createdAt.getTime() <= Date.now());
  assertEquals(typeof itemProps.id, "string");
});

Deno.test("[db] getAllItems()", async () => {
  const item1 = genNewItem();
  const item2 = genNewItem();

  assertEquals(await getAllItems(), []);

  await createItem(item1);
  await createItem(item2);
  assertArrayIncludes(await getAllItems(), [item1, item2]);
});

Deno.test("[db] (get/create/delete)Item()", async () => {
  const item = genNewItem();

  assertEquals(await getItem(item.id), null);

  const dates = [new Date()];
  const [itemsCount] = await getManyMetrics("items_count", dates);
  await createItem(item);
  assertEquals(await getManyMetrics("items_count", dates), [itemsCount + 1n]);
  await assertRejects(async () => await createItem(item));
  assertEquals(await getItem(item.id), item);

  await deleteItem(item);
  assertEquals(await getItem(item.id), null);
});

Deno.test("[db] getItemsByUser()", async () => {
  const userLogin = crypto.randomUUID();
  const item1 = { ...genNewItem(), userLogin };
  const item2 = { ...genNewItem(), userLogin };

  assertEquals(await getItemsByUser(userLogin), []);

  await createItem(item1);
  await createItem(item2);
  assertArrayIncludes(await getItemsByUser(userLogin), [item1, item2]);
});

Deno.test("[db] getItemsSince()", async () => {
  const item1 = genNewItem();
  const item2 = {
    ...genNewItem(),
    createdAt: new Date(Date.now() - (2 * DAY)),
  };

  await createItem(item1);
  await createItem(item2);

  assertArrayIncludes(await getItemsSince(DAY), [item1]);
  assertArrayIncludes(await getItemsSince(3 * DAY), [item1, item2]);
});

Deno.test("[db] user", async () => {
  const user = genNewUser();

  assertEquals(await getUser(user.login), null);
  assertEquals(await getUserBySession(user.sessionId), null);
  assertEquals(await getUserByStripeCustomer(user.stripeCustomerId!), null);

  await createUser(user);
  await assertRejects(async () => await createUser(user));
  assertEquals(await getManyMetrics("users_count", [new Date()]), [1n]);
  assertEquals(await getUser(user.login), user);
  assertEquals(await getUserBySession(user.sessionId), user);
  assertEquals(await getUserByStripeCustomer(user.stripeCustomerId!), user);

  const user1 = genNewUser();
  await createUser(user1);

  await deleteUserBySession(user.sessionId);
  assertEquals(await getUserBySession(user.sessionId), null);

  const newUser: User = { ...user, sessionId: crypto.randomUUID() };
  await updateUser(newUser);
  assertEquals(await getUser(newUser.login), newUser);
  assertEquals(await getUserBySession(newUser.sessionId), newUser);
  assertEquals(
    await getUserByStripeCustomer(newUser.stripeCustomerId!),
    newUser,
  );
});

Deno.test("[db] visit", async () => {
  const date = new Date();
  await incrVisitsCountByDay(date);
  assertEquals(await getManyMetrics("visits_count", [date]), [1n]);
});

Deno.test("[db] newCommentProps()", () => {
  const commentProps = newCommentProps();
  assert(commentProps.createdAt.getTime() <= Date.now());
  assertEquals(typeof commentProps.id, "string");
});

Deno.test("[db] (create/delete)Comment() + getCommentsByItem()", async () => {
  const itemId = crypto.randomUUID();
  const comment1 = { ...genNewComment(), itemId };
  const comment2 = { ...genNewComment(), itemId };

  assertEquals(await getCommentsByItem(itemId), []);

  await createComment(comment1);
  await createComment(comment2);
  await assertRejects(async () => await createComment(comment2));
  assertArrayIncludes(await getCommentsByItem(itemId), [comment1, comment2]);

  await deleteComment(comment1);
  await deleteComment(comment2);
  assertEquals(await getCommentsByItem(itemId), []);
});

Deno.test("[db] getManyMetrics()", async () => {
  const last5Days = getDatesSince(DAY * 5).map((date) => new Date(date));
  const last30Days = getDatesSince(DAY * 30).map((date) => new Date(date));

  assertEquals((await getManyMetrics("items_count", last5Days)).length, 5);
  assertEquals((await getManyMetrics("items_count", last30Days)).length, 30);
});

Deno.test("[db] formatDate()", () => {
  assertEquals(formatDate(new Date("2023-01-01")), "2023-01-01");
  assertEquals(formatDate(new Date("2023-01-01T13:59:08.740Z")), "2023-01-01");
});

Deno.test("[db] getDatesSince()", () => {
  assertEquals(getDatesSince(0), []);
  assertEquals(getDatesSince(DAY), [formatDate(new Date())]);
  assertEquals(getDatesSince(DAY * 2), [
    formatDate(new Date(Date.now() - DAY)),
    formatDate(new Date()),
  ]);
});

Deno.test("[db] newNotificationProps()", () => {
  const notificationProps = newNotificationProps();
  assert(notificationProps.createdAt.getTime() <= Date.now());
  assertEquals(typeof notificationProps.id, "string");
});

Deno.test("[db] (get/create/delete)Notification()", async () => {
  const notification = genNewNotification();

  assertEquals(await getNotification(notification.id), null);

  await createNotification(notification);
  await assertRejects(async () => await createNotification(notification));
  assertEquals(await getNotification(notification.id), notification);

  await deleteNotification(notification);
  assertEquals(await getItem(notification.id), null);
});

Deno.test("[db] getNotificationsByUser()", async () => {
  const userLogin = crypto.randomUUID();
  const notification1 = { ...genNewNotification(), userLogin };
  const notification2 = { ...genNewNotification(), userLogin };

  assertEquals(await getNotificationsByUser(userLogin), []);
  assertEquals(await ifUserHasNotifications(userLogin), false);

  await createNotification(notification1);
  await createNotification(notification2);
  assertArrayIncludes(await getNotificationsByUser(userLogin), [
    notification1,
    notification2,
  ]);
  assertEquals(await ifUserHasNotifications(userLogin), true);
});
