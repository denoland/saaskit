// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import { ulid } from "std/ulid/mod.ts";

const DENO_KV_PATH_KEY = "DENO_KV_PATH";
let path = undefined;
if (
  (await Deno.permissions.query({ name: "env", variable: DENO_KV_PATH_KEY }))
    .state === "granted"
) {
  path = Deno.env.get(DENO_KV_PATH_KEY);
}
export const kv = await Deno.openKv(path);

/**
 * Returns an array of values of a given {@linkcode Deno.KvListIterator} that's
 * been iterated over.
 *
 * @example
 * ```ts
 * import { collectValues, listItems, type Item } from "@/utils/db.ts";
 *
 * const items = await collectValues<Item>(listItems());
 * items[0].id; // Returns "01H9YD2RVCYTBVJEYEJEV5D1S1";
 * items[0].userId; // Returns "13d643e1-ad65-42bf-be9f-31c95e1b94d8"
 * items[0].title; // Returns "example-title"
 * items[0].url; // Returns "http://example.com"
 * items[0].score; // Returns 420
 * ```
 */
export async function collectValues<T>(iter: Deno.KvListIterator<T>) {
  return await Array.fromAsync(iter, ({ value }) => value);
}

// Item
export interface Item {
  // Uses ULID
  id: string;
  userId: string;
  title: string;
  url: string;
  score: number;
}

/** For testing */
export function randomItem(): Item {
  return {
    id: ulid(),
    userId: crypto.randomUUID(),
    title: crypto.randomUUID(),
    url: `http://${crypto.randomUUID()}.com`,
    score: 0,
  };
}

/**
 * Creates a new item in the database. Throws if the item already exists in
 * one of the indexes.
 *
 * @example
 * ```ts
 * import { createItem } from "@/utils/db.ts";
 * import { ulid } from "std/ulid/mod.ts";
 *
 * await createItem({
 *   id: ulid(),
 *   userId: "13d643e1-ad65-42bf-be9f-31c95e1b94d8",
 *   title: "example-title",
 *   url: "https://example.com",
 *   score: 0,
 * });
 * ```
 */
export async function createItem(item: Item) {
  const itemsKey = ["items", item.id];
  const itemsByUserKey = ["items_by_user", item.userId, item.id];

  const res = await kv.atomic()
    .check({ key: itemsKey, versionstamp: null })
    .check({ key: itemsByUserKey, versionstamp: null })
    .set(itemsKey, item)
    .set(itemsByUserKey, item)
    .commit();

  if (!res.ok) throw new Error("Failed to create item");
}

/**
 * Gets the item with the given ID from the database.
 *
 * @example
 * ```ts
 * import { getItem } from "@/utils/db.ts";
 *
 * const item = await getItem("01H9YD2RVCYTBVJEYEJEV5D1S1");
 * item?.id; // Returns "01H9YD2RVCYTBVJEYEJEV5D1S1";
 * item?.userId; // Returns "13d643e1-ad65-42bf-be9f-31c95e1b94d8"
 * item?.title; // Returns "example-title"
 * item?.url; // Returns "http://example.com"
 * item?.score; // Returns 420
 * ```
 */
export async function getItem(id: string) {
  const res = await kv.get<Item>(["items", id]);
  return res.value;
}

/**
 * Returns a {@linkcode Deno.KvListIterator} which can be used to iterate over
 * the items in the database, in chronological order.
 *
 * @example
 * ```ts
 * import { listItems } from "@/utils/db.ts";
 *
 * for await (const entry of listItems()) {
 *   entry.value.id; // Returns "01H9YD2RVCYTBVJEYEJEV5D1S1"
 *   entry.value.userId; // Returns "13d643e1-ad65-42bf-be9f-31c95e1b94d8"
 *   entry.key; // Returns ["items_voted_by_user", "01H9YD2RVCYTBVJEYEJEV5D1S1", "13d643e1-ad65-42bf-be9f-31c95e1b94d8"]
 *   entry.versionstamp; // Returns "00000000000000010000"
 * }
 * ```
 */
export function listItems(options?: Deno.KvListOptions) {
  return kv.list<Item>({ prefix: ["items"] }, options);
}

/**
 * Returns a {@linkcode Deno.KvListIterator} which can be used to iterate over
 * the items by a given user in the database, in chronological order.
 *
 * @example
 * ```ts
 * import { listItemsByUser } from "@/utils/db.ts";
 *
 * for await (const entry of listItemsByUser("13d643e1-ad65-42bf-be9f-31c95e1b94d8")) {
 *   entry.value.id; // Returns "01H9YD2RVCYTBVJEYEJEV5D1S1"
 *   entry.value.userId; // Returns "13d643e1-ad65-42bf-be9f-31c95e1b94d8"
 *   entry.key; // Returns ["items_voted_by_user", "01H9YD2RVCYTBVJEYEJEV5D1S1", "13d643e1-ad65-42bf-be9f-31c95e1b94d8"]
 *   entry.versionstamp; // Returns "00000000000000010000"
 * }
 * ```
 */
export function listItemsByUser(
  userId: string,
  options?: Deno.KvListOptions,
) {
  return kv.list<Item>({ prefix: ["items_by_user", userId] }, options);
}

// Vote
export interface Vote {
  itemId: string;
  userId: string;
}

/**
 * Creates a vote in the database. Throws if the given item or user doesn't
 * exist or the vote already exists. The item's score is incremented by 1.
 *
 * @example
 * ```ts
 * import { createVote } from "@/utils/db.ts";
 *
 * await createVote({
 *   itemId: "01H9YD2RVCYTBVJEYEJEV5D1S1",
 *   userId: "pedro",
 * });
 * ```
 */
export async function createVote(vote: Vote) {
  const itemKey = ["items", vote.itemId];
  const userKey = ["users", vote.userId];
  const [itemRes, userRes] = await kv.getMany<[Item, User]>([itemKey, userKey]);
  const item = itemRes.value;
  const user = userRes.value;
  if (item === null) throw new Deno.errors.NotFound("Item not found");
  if (user === null) throw new Deno.errors.NotFound("User not found");

  const itemVotedByUserKey = [
    "items_voted_by_user",
    vote.userId,
    vote.itemId,
  ];
  const userVotedForItemKey = [
    "users_voted_for_item",
    vote.itemId,
    vote.userId,
  ];
  const itemByUserKey = ["items_by_user", item.userId, item.id];

  item.score++;

  const res = await kv.atomic()
    .check(itemRes)
    .check(userRes)
    .check({ key: itemVotedByUserKey, versionstamp: null })
    .check({ key: userVotedForItemKey, versionstamp: null })
    .set(itemKey, item)
    .set(itemByUserKey, item)
    .set(itemVotedByUserKey, item)
    .set(userVotedForItemKey, user)
    .commit();

  if (!res.ok) throw new Error("Failed to create vote");
}

/**
 * Returns a {@linkcode Deno.KvListIterator} which can be used to iterate over
 * the items voted by a given user in the database, in chronological order.
 *
 * @example
 * ```ts
 * import { listItemsVotedByUser } from "@/utils/db.ts";
 *
 * for await (const entry of listItemsVotedByUser("john")) {
 *   entry.value.id; // Returns "01H9YD2RVCYTBVJEYEJEV5D1S1"
 *   entry.value.userId; // Returns "13d643e1-ad65-42bf-be9f-31c95e1b94d8"
 *   entry.key; // Returns ["items_voted_by_user", "01H9YD2RVCYTBVJEYEJEV5D1S1", "13d643e1-ad65-42bf-be9f-31c95e1b94d8"]
 *   entry.versionstamp; // Returns "00000000000000010000"
 * }
 * ```
 */
export function listItemsVotedByUser(userId: string) {
  return kv.list<Item>({ prefix: ["items_voted_by_user", userId] });
}

// User
export interface User {
  id: string;
  // AKA username
  login: string;
  sessionId: string;
  /**
   * Whether the user is subscribed to the "Premium Plan".
   * @default {false}
   */
  isSubscribed: boolean;
  stripeCustomerId?: string;
}

/** For testing */
export function randomUser(): User {
  return {
    id: crypto.randomUUID(),
    login: crypto.randomUUID(),
    sessionId: crypto.randomUUID(),
    isSubscribed: false,
    stripeCustomerId: crypto.randomUUID(),
  };
}

/**
 * Creates a new user in the database. Throws if the user or user session
 * already exists.
 *
 * @example
 * ```ts
 * import { createUser } from "@/utils/db.ts";
 *
 * await createUser({
 *   id: "13d643e1-ad65-42bf-be9f-31c95e1b94d8",
 *   login: "john",
 *   sessionId: crypto.randomUUID(),
 *   isSubscribed: false,
 * });
 * ```
 */
export async function createUser(user: User) {
  const usersKey = ["users", user.id];
  const usersByLoginKey = ["users_by_login", user.login];
  const usersBySessionKey = ["users_by_session", user.sessionId];

  const atomicOp = kv.atomic()
    .check({ key: usersKey, versionstamp: null })
    .check({ key: usersByLoginKey, versionstamp: null })
    .check({ key: usersBySessionKey, versionstamp: null })
    .set(usersKey, user)
    .set(usersByLoginKey, user)
    .set(usersBySessionKey, user);

  if (user.stripeCustomerId !== undefined) {
    const usersByStripeCustomerKey = [
      "users_by_stripe_customer",
      user.stripeCustomerId,
    ];
    atomicOp
      .check({ key: usersByStripeCustomerKey, versionstamp: null })
      .set(usersByStripeCustomerKey, user);
  }

  const res = await atomicOp.commit();
  if (!res.ok) throw new Error("Failed to create user");
}

/**
 * Creates a user in the database, overwriting any previous data.
 *
 * @example
 * ```ts
 * import { updateUser } from "@/utils/db.ts";
 *
 * await updateUser({
 *   id: "13d643e1-ad65-42bf-be9f-31c95e1b94d8",
 *   login: "john",
 *   sessionId: crypto.randomUUID(),
 *   isSubscribed: false,
 * });
 * ```
 */
export async function updateUser(user: User) {
  const usersKey = ["users", user.id];
  const usersByLoginKey = ["users_by_login", user.login];
  const usersBySessionKey = ["users_by_session", user.sessionId];

  const atomicOp = kv.atomic()
    .set(usersKey, user)
    .set(usersByLoginKey, user)
    .set(usersBySessionKey, user);

  if (user.stripeCustomerId !== undefined) {
    const usersByStripeCustomerKey = [
      "users_by_stripe_customer",
      user.stripeCustomerId,
    ];
    atomicOp
      .set(usersByStripeCustomerKey, user);
  }

  const res = await atomicOp.commit();
  if (!res.ok) throw new Error("Failed to update user");
}

/**
 * Updates the session ID of a given user in the database.
 *
 * @example
 * ```ts
 * import { updateUserSession } from "@/utils/db.ts";
 *
 * await updateUserSession({
 *   id: "13d643e1-ad65-42bf-be9f-31c95e1b94d8",
 *   login: "john",
 *   sessionId: "xxx",
 *   isSubscribed: false,
 * }, "yyy");
 * ```
 */
export async function updateUserSession(user: User, sessionId: string) {
  const userKey = ["users", user.id];
  const usersByLoginKey = ["users_by_login", user.login];
  const oldUserBySessionKey = ["users_by_session", user.sessionId];
  const newUserBySessionKey = ["users_by_session", sessionId];
  const newUser: User = { ...user, sessionId };

  const atomicOp = kv.atomic()
    .set(userKey, newUser)
    .set(usersByLoginKey, newUser)
    .delete(oldUserBySessionKey)
    .check({ key: newUserBySessionKey, versionstamp: null })
    .set(newUserBySessionKey, newUser);

  if (user.stripeCustomerId !== undefined) {
    const usersByStripeCustomerKey = [
      "users_by_stripe_customer",
      user.stripeCustomerId,
    ];
    atomicOp
      .set(usersByStripeCustomerKey, user);
  }

  const res = await atomicOp.commit();
  if (!res.ok) throw new Error("Failed to update user session");
}

/**
 * Gets the user with the given ID from the database.
 *
 * @example
 * ```ts
 * import { getUser } from "@/utils/db.ts";
 *
 * const user = await getUser("13d643e1-ad65-42bf-be9f-31c95e1b94d8");
 * user?.id; // Returns "13d643e1-ad65-42bf-be9f-31c95e1b94d8"
 * user?.login; // Returns "jack"
 * user?.sessionId; // Returns "xxx"
 * user?.isSubscribed; // Returns false
 * ```
 */
export async function getUser(id: string) {
  const res = await kv.get<User>(["users", id]);
  return res.value;
}

/**
 * Gets the user with the given username from the database.
 *
 * @example
 * ```ts
 * import { getUserByLogin } from "@/utils/db.ts";
 *
 * const user = await getUserByLogin("jack");
 * user?.id; // Returns "13d643e1-ad65-42bf-be9f-31c95e1b94d8"
 * user?.login; // Returns "jack"
 * user?.sessionId; // Returns "xxx"
 * user?.isSubscribed; // Returns false
 * ```
 */
export async function getUserByLogin(login: string) {
  const res = await kv.get<User>(["users_by_login", login]);
  return res.value;
}

/**
 * Gets the user with the given session ID from the database. The first attempt
 * is done with eventual consistency. If that returns `null`, the second
 * attempt is done with strong consistency. This is done for performance
 * reasons, as this function is called in every route request for checking
 * whether the session user is signed in.
 *
 * @example
 * ```ts
 * import { getUserBySession } from "@/utils/db.ts";
 *
 * const user = await getUserBySession("xxx");
 * user?.id; // Returns "13d643e1-ad65-42bf-be9f-31c95e1b94d8"
 * user?.login; // Returns "jack"
 * user?.sessionId; // Returns "xxx"
 * user?.isSubscribed; // Returns false
 * ```
 */
export async function getUserBySession(sessionId: string) {
  const key = ["users_by_session", sessionId];
  const eventualRes = await kv.get<User>(key, {
    consistency: "eventual",
  });
  if (eventualRes.value !== null) return eventualRes.value;
  const res = await kv.get<User>(key);
  return res.value;
}

/**
 * Gets a user by their given Stripe customer ID from the database.
 *
 * @example
 * ```ts
 * import { getUserByStripeCustomer } from "@/utils/db.ts";
 *
 * const user = await getUserByStripeCustomer("123");
 * user?.id; // Returns "13d643e1-ad65-42bf-be9f-31c95e1b94d8"
 * user?.login; // Returns "jack"
 * user?.sessionId; // Returns "xxx"
 * user?.isSubscribed; // Returns false
 * user?.stripeCustomerId; // Returns "123"
 * ```
 */
export async function getUserByStripeCustomer(stripeCustomerId: string) {
  const res = await kv.get<User>([
    "users_by_stripe_customer",
    stripeCustomerId,
  ]);
  return res.value;
}

/**
 * Returns a {@linkcode Deno.KvListIterator} which can be used to iterate over
 * the users in the database.
 *
 * @example
 * ```ts
 * import { listUsers } from "@/utils/db.ts";
 *
 * for await (const entry of listUsers()) {
 *   entry.value.id; // Returns "13d643e1-ad65-42bf-be9f-31c95e1b94d8"
 *   entry.value.login; // Returns "jack"
 *   entry.value.sessionId; // Returns "xxx"
 *   entry.value.isSubscribed; // Returns false
 * }
 * ```
 */
export function listUsers(options?: Deno.KvListOptions) {
  return kv.list<User>({ prefix: ["users"] }, options);
}

/**
 * Returns a boolean array indicating whether the given items have been voted
 * for by the given user in the database.
 *
 * @example
 * ```ts
 * import { getAreVotedByUser } from "@/utils/db.ts";
 *
 * const items = [
 *   {
 *     id: "01H9YD2RVCYTBVJEYEJEV5D1S1",
 *     userLogin: "jack",
 *     title: "Jack voted for this",
 *     url: "http://example.com",
 *     score: 1,
 *   },
 *   {
 *     id: "01H9YD2RVCYTBVJEYEJEV5D1S2",
 *     userLogin: "jill",
 *     title: "Jack didn't vote for this",
 *     url: "http://youtube.com",
 *     score: 0,
 *   }
 * ];
 * await getAreVotedByUser(items, "jack"); // Returns [true, false]
 * ```
 */
export async function getAreVotedByUser(items: Item[], userLogin: string) {
  const votedItems = await collectValues(listItemsVotedByUser(userLogin));
  const votedItemsIds = votedItems.map((item) => item.id);
  return items.map((item) => votedItemsIds.includes(item.id));
}
