// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertNotEquals } from "std/testing/asserts.ts";
import { chunk } from "std/collections/chunk.ts";

const KV_PATH_KEY = "KV_PATH";
let path = undefined;
if (
  (await Deno.permissions.query({ name: "env", variable: KV_PATH_KEY }))
    .state === "granted"
) {
  path = Deno.env.get(KV_PATH_KEY);
}
export const kv = await Deno.openKv(path);

// Helpers
async function getValue<T>(
  key: Deno.KvKey,
  options?: { consistency?: Deno.KvConsistencyLevel },
) {
  const res = await kv.get<T>(key, options);
  return res.value;
}

async function getValues<T>(
  selector: Deno.KvListSelector,
  options?: Deno.KvListOptions,
) {
  const values = [];
  const iter = kv.list<T>(selector, options);
  for await (const entry of iter) values.push(entry.value);
  return values;
}

/**
 * Gets many values from KV. Uses batched requests to get values in chunks of 10.
 */
async function getManyValues<T>(
  keys: Deno.KvKey[],
): Promise<(T | null)[]> {
  const promises = [];
  for (const batch of chunk(keys, 10)) {
    promises.push(kv.getMany<T[]>(batch));
  }
  return (await Promise.all(promises))
    .flat()
    .map((entry) => entry?.value);
}

export function assertIsEntry<T>(
  entry: Deno.KvEntryMaybe<T>,
): asserts entry is Deno.KvEntry<T> {
  assertNotEquals(entry.value, null, `KV entry not found: ${entry.key}`);
}

/** Gets all dates since a given number of milliseconds ago */
export function getDatesSince(msAgo: number) {
  const dates = [];
  const now = Date.now();
  const start = new Date(now - msAgo);

  while (+start < now) {
    start.setDate(start.getDate() + 1);
    dates.push(formatDate(new Date(start)));
  }

  return dates;
}

export async function collectValues<T>(iter: Deno.KvListIterator<T>) {
  const values = [];
  for await (const { value } of iter) values.push(value);
  return values;
}

/** Converts `Date` to ISO format that is zero UTC offset */
export function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

// Item
export interface Item {
  userLogin: string;
  title: string;
  url: string;
  // The below properties can be automatically generated upon item creation
  id: string;
  createdAt: Date;
  score: number;
}

export function newItemProps(): Pick<Item, "id" | "score" | "createdAt"> {
  return {
    id: crypto.randomUUID(),
    score: 0,
    createdAt: new Date(),
  };
}

/**
 * Creates a new item in KV. Throws if the item already exists in one of the indexes.
 *
 * @example New item creation
 * ```ts
 * import { newItemProps, createItem } from "@/utils/db.ts";
 *
 * const item: Item = {
 *   userLogin: "example-user-login",
 *   title: "example-title",
 *   url: "https://example.com"
 *   ..newItemProps(),
 * };
 *
 * await createItem(item);
 * ```
 */
export async function createItem(item: Item) {
  const itemsKey = ["items", item.id];
  const itemsByTimeKey = ["items_by_time", item.createdAt.getTime(), item.id];
  const itemsByUserKey = ["items_by_user", item.userLogin, item.id];
  const itemsCountKey = ["items_count", formatDate(item.createdAt)];

  const res = await kv.atomic()
    .check({ key: itemsKey, versionstamp: null })
    .check({ key: itemsByTimeKey, versionstamp: null })
    .check({ key: itemsByUserKey, versionstamp: null })
    .set(itemsKey, item)
    .set(itemsByTimeKey, item)
    .set(itemsByUserKey, item)
    .sum(itemsCountKey, 1n)
    .commit();

  if (!res.ok) throw new Error(`Failed to create item: ${item}`);
}

export async function deleteItem(item: Item) {
  const itemsKey = ["items", item.id];
  const itemsByTimeKey = ["items_by_time", item.createdAt.getTime(), item.id];
  const itemsByUserKey = ["items_by_user", item.userLogin, item.id];

  const res = await kv.atomic()
    .delete(itemsKey)
    .delete(itemsByTimeKey)
    .delete(itemsByUserKey)
    .commit();

  if (!res.ok) throw new Error(`Failed to delete item: ${item}`);
}

export async function getItem(id: string) {
  return await getValue<Item>(["items", id]);
}

export async function getItemsByUser(userLogin: string) {
  return await getValues<Item>({ prefix: ["items_by_user", userLogin] });
}

export function listItemsByUser(
  userLogin: string,
  options?: Deno.KvListOptions,
) {
  return kv.list<Item>({ prefix: ["items_by_user", userLogin] }, options);
}

export function listItemsByTime(options?: Deno.KvListOptions) {
  return kv.list<Item>({ prefix: ["items_by_time"] }, options);
}

export async function getAllItems() {
  return await getValues<Item>({ prefix: ["items"] });
}

/**
 * Gets all items since a given number of milliseconds ago from KV.
 *
 * @example Since a week ago
 * ```ts
 * import { WEEK } from "std/datetime/constants.ts";
 * import { getItemsSince } from "@/utils/db.ts";
 *
 * const itemsSinceAllTime = await getItemsSince(WEEK);
 * ```
 *
 * @example Since a month ago
 * ```ts
 * import { DAY } from "std/datetime/constants.ts";
 * import { getItemsSince } from "@/utils/db.ts";
 *
 * const itemsSinceAllTime = await getItemsSince(DAY * 30);
 * ```
 */
export async function getItemsSince(msAgo: number) {
  return await getValues<Item>({
    prefix: ["items_by_time"],
    start: ["items_by_time", Date.now() - msAgo],
  });
}

// Notification
export interface Notification {
  userLogin: string;
  type: string;
  text: string;
  originUrl: string;
  // The below properties can be automatically generated upon notification creation
  id: string;
  createdAt: Date;
}

export function newNotificationProps(): Pick<Item, "id" | "createdAt"> {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date(),
  };
}

/**
 * Creates a new notification in KV. Throws if the item already exists in one of the indexes.
 *
 * @example New notification creation
 * ```ts
 * import { newNotificationProps, createNotification } from "@/utils/db.ts";
 *
 * const notification: Notification = {
 *   userLogin: "example-user-login",
 *   type: "example-type",
 *   text: "Hello, world!",
 *   originUrl: "https://hunt.deno.land"
 *   ...newNotificationProps(),
 * };
 *
 * await createNotification(notification);
 * ```
 */
export async function createNotification(notification: Notification) {
  const notificationsKey = ["notifications", notification.id];
  const notificationsByUserKey = [
    "notifications_by_user",
    notification.userLogin,
    notification.createdAt.getTime(),
    notification.id,
  ];

  const res = await kv.atomic()
    .check({ key: notificationsKey, versionstamp: null })
    .check({ key: notificationsByUserKey, versionstamp: null })
    .set(notificationsKey, notification)
    .set(notificationsByUserKey, notification)
    .commit();

  if (!res.ok) {
    throw new Error(`Failed to create notification: ${notification}`);
  }
}

export async function deleteNotification(notification: Notification) {
  const notificationsKey = ["notifications", notification.id];
  const notificationsByUserKey = [
    "notifications_by_user",
    notification.userLogin,
    notification.createdAt.getTime(),
    notification.id,
  ];

  const res = await kv.atomic()
    .delete(notificationsKey)
    .delete(notificationsByUserKey)
    .commit();

  if (!res.ok) {
    throw new Error(`Failed to delete notification: ${notification}`);
  }
}

export async function getNotification(id: string) {
  return await getValue<Notification>(["notifications", id]);
}

export function listNotificationsByUser(
  userLogin: string,
  options?: Deno.KvListOptions,
) {
  return kv.list<Notification>({
    prefix: ["notifications_by_user", userLogin],
  }, options);
}

export async function ifUserHasNotifications(userLogin: string) {
  const iter = kv.list({ prefix: ["notifications_by_user", userLogin] }, {
    consistency: "eventual",
  });
  for await (const _entry of iter) return true;
  return false;
}

// Comment
export interface Comment {
  userLogin: string;
  itemId: string;
  text: string;
  // The below properties can be automatically generated upon comment creation
  id: string;
  createdAt: Date;
}

export function newCommentProps(): Pick<Comment, "id" | "createdAt"> {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date(),
  };
}

export async function createComment(comment: Comment) {
  const commentsByItemKey = [
    "comments_by_item",
    comment.itemId,
    comment.createdAt.getTime(),
    comment.id,
  ];

  const res = await kv.atomic()
    .check({ key: commentsByItemKey, versionstamp: null })
    .set(commentsByItemKey, comment)
    .commit();

  if (!res.ok) throw new Error(`Failed to create comment: ${comment}`);
}

export async function deleteComment(comment: Comment) {
  const commentsByItemKey = [
    "comments_by_item",
    comment.itemId,
    comment.createdAt.getTime(),
    comment.id,
  ];

  const res = await kv.atomic()
    .delete(commentsByItemKey)
    .commit();

  if (!res.ok) throw new Error(`Failed to delete comment: ${comment}`);
}

export function listCommentsByItem(
  itemId: string,
  options?: Deno.KvListOptions,
) {
  return kv.list<Comment>({ prefix: ["comments_by_item", itemId] }, options);
}

// Vote
export interface Vote {
  userLogin: string;
  item: Item;
  // The below property can be automatically generated upon vote creation
  id: string;
  createdAt: Date;
}

export function newVoteProps(): Pick<Vote, "id" | "createdAt"> {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date(),
  };
}

export async function createVote(vote: Vote) {
  vote.item.score++;

  const itemKey = ["items", vote.item.id];
  const itemsByTimeKey = [
    "items_by_time",
    vote.item.createdAt.getTime(),
    vote.item.id,
  ];
  const itemsByUserKey = ["items_by_user", vote.item.userLogin, vote.item.id];
  const [itemRes, itemsByTimeRes, itemsByUserRes] = await kv.getMany([
    itemKey,
    itemsByTimeKey,
    itemsByUserKey,
  ]);
  assertIsEntry(itemRes);
  assertIsEntry(itemsByTimeRes);
  assertIsEntry(itemsByUserRes);

  const votesKey = ["votes", vote.id];
  const votesByItemKey = ["votes_by_item", vote.item.id, vote.id];
  const votesByUserKey = ["votes_by_user", vote.userLogin, vote.id];
  const votesCountKey = ["votes_count", formatDate(vote.createdAt)];

  const res = await kv.atomic()
    .check(itemRes)
    .check(itemsByTimeRes)
    .check(itemsByUserRes)
    .check({ key: votesKey, versionstamp: null })
    .check({ key: votesByItemKey, versionstamp: null })
    .check({ key: votesByUserKey, versionstamp: null })
    .set(itemKey, vote.item)
    .set(itemsByTimeKey, vote.item)
    .set(itemsByUserKey, vote.item)
    .set(votesKey, vote)
    .set(votesByItemKey, vote)
    .set(votesByUserKey, vote)
    .sum(votesCountKey, 1n)
    .commit();

  if (!res.ok) throw new Error(`Failed to set vote: ${vote}`);
}

export async function deleteVote(vote: Vote) {
  vote.item.score--;

  const itemKey = ["items", vote.item.id];
  const itemsByTimeKey = [
    "items_by_time",
    vote.item.createdAt.getTime(),
    vote.item.id,
  ];
  const itemsByUserKey = ["items_by_user", vote.item.userLogin, vote.item.id];
  const [itemRes, itemsByTimeRes, itemsByUserRes] = await kv.getMany([
    itemKey,
    itemsByTimeKey,
    itemsByUserKey,
  ]);
  assertIsEntry(itemRes);
  assertIsEntry(itemsByTimeRes);
  assertIsEntry(itemsByUserRes);

  const votesKey = ["votes", vote.id];
  const votesByItemKey = ["votes_by_item", vote.item.id, vote.id];
  const votesByUserKey = ["votes_by_user", vote.userLogin, vote.id];

  const res = await kv.atomic()
    .check(itemRes)
    .check(itemsByTimeRes)
    .check(itemsByUserRes)
    .set(itemKey, vote.item)
    .set(itemsByTimeKey, vote.item)
    .set(itemsByUserKey, vote.item)
    .delete(votesKey)
    .delete(votesByItemKey)
    .delete(votesByUserKey)
    .commit();

  if (!res.ok) throw new Error(`Failed to delete vote: ${vote}`);
}

export async function getVotesByUser(userLogin: string) {
  return await getValues<Vote>({ prefix: ["votes_by_user", userLogin] });
}

// User
export interface User {
  // AKA username
  login: string;
  sessionId: string;
  stripeCustomerId?: string;
  // The below properties can be automatically generated upon comment creation
  isSubscribed: boolean;
}

export function newUserProps(): Pick<User, "isSubscribed"> {
  return {
    isSubscribed: false,
  };
}

/**
 * Creates a new user in KV. Throws if the user already exists.
 *
 * @example
 * ```ts
 * import { createUser, newUser } from "@/utils/db.ts";
 *
 * const user = {
 *   login: "login",
 *   sessionId: "sessionId",
 *   ...newUserProps(),
 * };
 * await createUser(user);
 * ```
 */
export async function createUser(user: User) {
  const usersKey = ["users", user.login];
  const usersBySessionKey = ["users_by_session", user.sessionId];
  const usersCountKey = ["users_count", formatDate(new Date())];

  const atomicOp = kv.atomic();

  if (user.stripeCustomerId !== undefined) {
    const usersByStripeCustomerKey = [
      "users_by_stripe_customer",
      user.stripeCustomerId,
    ];
    atomicOp
      .check({ key: usersByStripeCustomerKey, versionstamp: null })
      .set(usersByStripeCustomerKey, user);
  }

  const res = await atomicOp
    .check({ key: usersKey, versionstamp: null })
    .check({ key: usersBySessionKey, versionstamp: null })
    .set(usersKey, user)
    .set(usersBySessionKey, user)
    .sum(usersCountKey, 1n)
    .commit();

  if (!res.ok) throw new Error(`Failed to create user: ${user}`);
}

export async function updateUser(user: User) {
  const usersKey = ["users", user.login];
  const usersBySessionKey = ["users_by_session", user.sessionId];

  const atomicOp = kv.atomic();

  if (user.stripeCustomerId !== undefined) {
    const usersByStripeCustomerKey = [
      "users_by_stripe_customer",
      user.stripeCustomerId,
    ];
    atomicOp
      .set(usersByStripeCustomerKey, user);
  }

  const res = await atomicOp
    .set(usersKey, user)
    .set(usersBySessionKey, user)
    .commit();

  if (!res.ok) throw new Error(`Failed to update user: ${user}`);
}

export async function deleteUserBySession(sessionId: string) {
  await kv.delete(["users_by_session", sessionId]);
}

/** @todo Migrate to ["users", login] key */
export async function getUser(login: string) {
  return await getValue<User>(["users", login]);
}

export async function getUserBySession(sessionId: string) {
  const usersBySessionKey = ["users_by_session", sessionId];
  return await getValue<User>(usersBySessionKey, {
    consistency: "eventual",
  }) ?? await getValue<User>(usersBySessionKey);
}

export async function getUserByStripeCustomer(stripeCustomerId: string) {
  return await getValue<User>([
    "users_by_stripe_customer",
    stripeCustomerId,
  ]);
}

export async function getUsers() {
  return await getValues<User>({ prefix: ["users"] });
}

export function listUsers(options?: Deno.KvListOptions) {
  return kv.list<User>({ prefix: ["users"] }, options);
}

export async function getAreVotedBySessionId(
  items: Item[],
  sessionId?: string,
) {
  if (!sessionId) return [];
  const sessionUser = await getUserBySession(sessionId);
  if (!sessionUser) return [];
  const votes = await getVotesByUser(sessionUser.login);
  const votesItemsIds = votes.map((vote) => vote.item.id);
  return items.map((item) => votesItemsIds.includes(item.id));
}

export function compareScore(a: Item, b: Item) {
  return Number(b.score) - Number(a.score);
}

// Analytics
export async function incrVisitsCountByDay(date: Date) {
  const visitsKey = ["visits_count", formatDate(date)];
  await kv.atomic()
    .sum(visitsKey, 1n)
    .commit();
}

export async function getManyMetrics(
  metric: "visits_count" | "items_count" | "votes_count" | "users_count",
  dates: Date[],
) {
  const keys = dates.map((date) => [metric, formatDate(date)]);
  const res = await getManyValues<bigint>(keys);
  return res.map((value) => value?.valueOf() ?? 0n);
}
