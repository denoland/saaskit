// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.

/// <reference lib="deno.unstable" />

import { ulid } from "$std/ulid/mod.ts";
import Chance from "https://esm.sh/chance";
const chance = new Chance();


const DENO_KV_PATH_KEY = "DENO_KV_PATH";
let path = undefined;
if (
  (await Deno.permissions.query({ name: "env", variable: DENO_KV_PATH_KEY }))
    .state === "granted"
) {
  path = Deno.env.get(DENO_KV_PATH_KEY);
}
export const kv = await Deno.openKv(
    Deno.env.get("DENO_DEPLOYMENT_ID") ? undefined : "./dev-kv.sqlite3",
);
/**
 * Returns an array of values of a given {@linkcode Deno.KvListIterator} that's
 * been iterated over.
 *
 * @example
 * ```ts
 * import { collectValues, listProducts, type product } from "@/utils/db.ts";
 *
 * const produtos = await collectValues<product>(listItems());
 * produtos[0].id; // Returns "01H9YD2RVCYTBVJEYEJEV5D1S1";
 * produtos[0].userLogin; // Returns "snoop"
 * produtos[0].title; // Returns "example-title"
 * produtos[0].url; // Returns "http://example.com"
 * produtos[0].score; // Returns 420
 * ```
 */
export async function collectValues<T>(iter: Deno.KvListIterator<T>) {
  return await Array.fromAsync(iter, ({ value }) => value);
}

// Product
export interface Product {
  // Uses ULID
  id: string;
  userLogin: string;
  title: string;
  url: string;
  score: number;
  category: string;
  createdAt: number;
  image: string;
}

export interface Brand {
  // Uses ULID
  id: string;
  userLogin: string;
  title: string;
  url: string;
  score: number;
  bio?: string;
  website?: string;
  logoUrl?: string;
}

/** For testing */
export function randomProduct(): Product {
  return {
    id: ulid(),
    userLogin: chance.twitter().replace("@", ""),
    title: chance.sentence({ words: 3 }),
    url: chance.url(),
    score: chance.integer({ min: 0, max: 999 }),
    category: chance.pickone(["tops", "bottoms", "footwear", "accessories", "other"]),
    createdAt: Date.now(), // 🛠️ matches `number` type
    image: chance.url(),
  };
}

export function randomBrand(): Brand {
  return {
    id: ulid(),
    userLogin: chance.twitter().replace("@", ""),
    title: chance.company(),
    url: chance.url(),
    score: chance.integer({ min: 0, max: 999 }),
    bio: chance.sentence({ words: 8 }),
    website: chance.url(),
    logoUrl: chance.url(),
  };
}

/**
 * Creates a new product in the database. Throws if the product already exists in
 * one of the indexes.
 *
 * @example
 * ```ts
 * import { createProduct } from "@/utils/db.ts";
 * import { ulid } from "$std/ulid/mod.ts";
 *
 * await createProduct({
 *   id: ulid(),
 *   userLogin: "john_doe",
 *   title: "example-title",
 *   url: "https://example.com",
 *   score: 0,
 * });
 * ```
 */
export async function createProduct(product: Product) {
  const productsKey = ["products", product.id];
  const productsByUserKey = ["products_by_user", product.userLogin, product.id];

  const res = await kv.atomic()
    .check({ key: productsKey, versionstamp: null })
    .check({ key: productsByUserKey, versionstamp: null })
    .set(productsKey, product)
    .set(productsByUserKey, product)
    .commit();

  if (!res.ok) {
    console.error("❌ Failed to create product:", product.id);

    const existing = await Promise.all([
      kv.get(productsKey),
      kv.get(productsByUserKey),
    ]);
    console.log("🔍 Existing productsKey?", existing[0].value);
    console.log("🔍 Existing productsByUserKey?", existing[1].value);

    throw new Error("Failed to create product");
  }

  console.log("✅ Product created:", product.id);
}

/**
 * Creates a new product in the database. Throws if the product already exists in
 * one of the indexes.
 *
 * @example
 * ```ts
 * import { createBrand } from "@/utils/db.ts";
 * import { ulid } from "$std/ulid/mod.ts";
 *
 * await createBrand({
 *   id: ulid(),
 *   userLogin: "john_doe",
 *   title: "example-title",
 *   url: "https://example.com",
 *   score: 0,
 * });
 * ```
 */
export async function createBrand(brand: Brand) {
  const brandsKey = ["brands", brand.id];
  const brandsByUserKey = ["brands_by_user", brand.userLogin, brand.id];

  const res = await kv.atomic()
      .check({ key: brandsKey, versionstamp: null })
      .check({ key: brandsByUserKey, versionstamp: null })
      .set(brandsKey, brand)
      .set(brandsByUserKey, brand)
      .commit();

  if (!res.ok) {
    console.error("❌ Failed to create brand:", brand.id);

    const existing = await Promise.all([
      kv.get(brandsKey),
      kv.get(brandsByUserKey),
    ]);
    console.log("🔍 Existing brandsKey?", existing[0].value);
    console.log("🔍 Existing brandsByUserKey?", existing[1].value);

    throw new Error("Failed to create product");
  }

  console.log("✅ Brand created:", brand.id);
}

/**
 * Gets the product with the given ID from the database.
 *
 * @example
 * ```ts
 * import { getBrand } from "@/utils/db.ts";
 *
 * const brand = await getItem("01H9YD2RVCYTBVJEYEJEV5D1S1");
 * brand?.id; // Returns "01H9YD2RVCYTBVJEYEJEV5D1S1";
 * brand?.userLogin; // Returns "snoop"
 * brand?.title; // Returns "example-title"
 * brand?.url; // Returns "http://example.com"
 * brand?.score; // Returns 420
 * ```
 */
export async function getBrand(id: string) {
  const res = await kv.get<Brand>(["brands", id]);
  return res.value;
}

/**
 * Returns a {@linkcode Deno.KvListIterator} which can be used to iterate over
 * the produtos in the database, in chronological order.
 *
 * @example
 * ```ts
 * import { listBrands } from "@/utils/db.ts";
 *
 * for await (const entry of listBrands()) {
 *   entry.value.id; // Returns "01H9YD2RVCYTBVJEYEJEV5D1S1"
 *   entry.value.userLogin; // Returns "pedro"
 *   entry.key; // Returns ["items_voted_by_user", "01H9YD2RVCYTBVJEYEJEV5D1S1", "pedro"]
 *   entry.versionstamp; // Returns "00000000000000010000"
 * }
 * ```
 */
export function listBrands(options?: Deno.KvListOptions) {
  return kv.list<Brand>({ prefix: ["brands"] }, options);
}

/**
 * Returns a {@linkcode Deno.KvListIterator} which can be used to iterate over
 * the produtos by a given user in the database, in chronological order.
 *
 * @example
 * ```ts
 * import { listBrandsByUser } from "@/utils/db.ts";
 *
 * for await (const entry of listBrandsByUser("pedro")) {
 *   entry.value.id; // Returns "01H9YD2RVCYTBVJEYEJEV5D1S1"
 *   entry.value.userLogin; // Returns "pedro"
 *   entry.key; // Returns ["items_voted_by_user", "01H9YD2RVCYTBVJEYEJEV5D1S1", "pedro"]
 *   entry.versionstamp; // Returns "00000000000000010000"
 * }
 * ```
 */
export function listBrandsByUser(
    userLogin: string,
    options?: Deno.KvListOptions,
) {
  return kv.list<Brand>({ prefix: ["brands_by_user", userLogin] }, options);
}


/**
 * Gets the product with the given ID from the database.
 *
 * @example
 * ```ts
 * import { getItem } from "@/utils/db.ts";
 *
 * const product = await getItem("01H9YD2RVCYTBVJEYEJEV5D1S1");
 * product?.id; // Returns "01H9YD2RVCYTBVJEYEJEV5D1S1";
 * product?.userLogin; // Returns "snoop"
 * product?.title; // Returns "example-title"
 * product?.url; // Returns "http://example.com"
 * product?.score; // Returns 420
 * ```
 */
export async function getProduct(id: string) {
  const res = await kv.get<Product>(["products", id]);
  return res.value;
}

/**
 * Returns a {@linkcode Deno.KvListIterator} which can be used to iterate over
 * the produtos in the database, in chronological order.
 *
 * @example
 * ```ts
 * import { listItems } from "@/utils/db.ts";
 *
 * for await (const entry of listItems()) {
 *   entry.value.id; // Returns "01H9YD2RVCYTBVJEYEJEV5D1S1"
 *   entry.value.userLogin; // Returns "pedro"
 *   entry.key; // Returns ["items_voted_by_user", "01H9YD2RVCYTBVJEYEJEV5D1S1", "pedro"]
 *   entry.versionstamp; // Returns "00000000000000010000"
 * }
 * ```
 */
export function listProducts(options?: Deno.KvListOptions) {
  return kv.list<Product>({ prefix: ["products"] }, options);
}

/**
 * Returns a {@linkcode Deno.KvListIterator} which can be used to iterate over
 * the produtos by a given user in the database, in chronological order.
 *
 * @example
 * ```ts
 * import { listItemsByUser } from "@/utils/db.ts";
 *
 * for await (const entry of listItemsByUser("pedro")) {
 *   entry.value.id; // Returns "01H9YD2RVCYTBVJEYEJEV5D1S1"
 *   entry.value.userLogin; // Returns "pedro"
 *   entry.key; // Returns ["items_voted_by_user", "01H9YD2RVCYTBVJEYEJEV5D1S1", "pedro"]
 *   entry.versionstamp; // Returns "00000000000000010000"
 * }
 * ```
 */
export function listProductsByBrand(
  userLogin: string,
  options?: Deno.KvListOptions,
) {
  return kv.list<Product>({ prefix: ["products_by_brand", userLogin] }, options);
}

// Vote
export interface Vote {
  productId: string;
  userLogin: string;
}

/**
 * Creates a vote in the database. Throws if the given product or user doesn't
 * exist or the vote already exists. The product's score is incremented by 1.
 *
 * @example
 * ```ts
 * import { createVote } from "@/utils/db.ts";
 *
 * await createVote({
 *   itemId: "01H9YD2RVCYTBVJEYEJEV5D1S1",
 *   userLogin: "pedro",
 * });
 * ```
 */
export async function createVote(vote: Vote) {
  const productKey = ["products", vote.productId];
  const userKey = ["users", vote.userLogin];
  const [productRes, userRes] = await kv.getMany<[Product, User]>([productKey, userKey]);
  const product = productRes.value;
  const user = userRes.value;
  if (product === null) throw new Deno.errors.NotFound("Product not found");
  if (user === null) throw new Deno.errors.NotFound("User not found");

  const productVotedByUserKey = [
    "products_voted_by_user",
    vote.userLogin,
    vote.productId,
  ];
  const userVotedForProductKey = [
    "users_voted_for_item",
    vote.productId,
    vote.userLogin,
  ];
  const productByUserKey = ["products_by_user", product.userLogin, product.id];

  product.score++;

  const res = await kv.atomic()
    .check(productRes)
    .check(userRes)
    .check({ key: productVotedByUserKey, versionstamp: null })
    .check({ key: userVotedForProductKey, versionstamp: null })
    .set(productKey, product)
    .set(productByUserKey, product)
    .set(productVotedByUserKey, product)
    .set(userVotedForProductKey, user)
    .commit();

  if (!res.ok) throw new Error("Failed to create vote");
}

/**
 * Returns a {@linkcode Deno.KvListIterator} which can be used to iterate over
 * the produtos voted by a given user in the database, in chronological order.
 *
 * @example
 * ```ts
 * import { listProductsVotedByUser } from "@/utils/db.ts";
 *
 * for await (const entry of listProductsVotedByUser("john")) {
 *   entry.value.id; // Returns "01H9YD2RVCYTBVJEYEJEV5D1S1"
 *   entry.value.userLogin; // Returns "pedro"
 *   entry.key; // Returns ["items_voted_by_user", "01H9YD2RVCYTBVJEYEJEV5D1S1", "pedro"]
 *   entry.versionstamp; // Returns "00000000000000010000"
 * }
 * ```
 */
export function listProductsVotedByUser(userLogin: string) {
  return kv.list<Product>({ prefix: ["products_voted_by_user", userLogin] });
}

// User
export interface User {
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
 *   login: "john",
 *   sessionId: crypto.randomUUID(),
 *   isSubscribed: false,
 * });
 * ```
 */
export async function createUser(user: User) {
  const usersKey = ["usuarios", user.login];
  const usersBySessionKey = ["users_by_session", user.sessionId];

  const atomicOp = kv.atomic()
    .check({ key: usersKey, versionstamp: null })
    .check({ key: usersBySessionKey, versionstamp: null })
    .set(usersKey, user)
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

  console.error("Atomic op created for user:", user.login);

  if (!res.ok) {
    try {
      console.log("KV path:", Deno.realPathSync("dev-kv.sqlite3"));
    } catch {
      console.warn("KV file hasn't been created yet.");
    }
    console.error("Atomic op failed for user:", user.login);
    throw new Error("Failed to create user");
  }}

/**
 * Creates a user in the database, overwriting any previous data.
 *
 * @example
 * ```ts
 * import { updateUser } from "@/utils/db.ts";
 *
 * await updateUser({
 *   login: "john",
 *   sessionId: crypto.randomUUID(),
 *   isSubscribed: false,
 * });
 * ```
 */
export async function updateUser(user: User) {
  const usersKey = ["users", user.login];
  const usersBySessionKey = ["users_by_session", user.sessionId];

  const atomicOp = kv.atomic()
    .set(usersKey, user)
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
 *   login: "john",
 *   sessionId: "xxx",
 *   isSubscribed: false,
 * }, "yyy");
 * ```
 */
export async function updateUserSession(user: User, sessionId: string) {
  const userKey = ["users", user.login];
  const oldUserBySessionKey = ["users_by_session", user.sessionId];
  const newUserBySessionKey = ["users_by_session", sessionId];
  const newUser: User = { ...user, sessionId };

  const atomicOp = kv.atomic()
    .set(userKey, newUser)
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
 * Gets the user with the given login from the database.
 *
 * @example
 * ```ts
 * import { getUser } from "@/utils/db.ts";
 *
 * const user = await getUser("jack");
 * user?.login; // Returns "jack"
 * user?.sessionId; // Returns "xxx"
 * user?.isSubscribed; // Returns false
 * ```
 */
export async function getUser(login: string) {
  const res = await kv.get<User>(["users", login]);
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
 * the usuarios in the database.
 *
 * @example
 * ```ts
 * import { listUsers } from "@/utils/db.ts";
 *
 * for await (const entry of listUsers()) {
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
 * Returns a boolean array indicating whether the given produtos have been voted
 * for by the given user in the database.
 *
 * @example
 * ```ts
 * import { getAreVotedByUser } from "@/utils/db.ts";
 *
 * const produtos = [
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
 * await getAreVotedByUser(produtos, "jack"); // Returns [true, false]
 * ```
 */
export async function getAreVotedByUser(products: Product[], userLogin: string) {
  const votedProducts = await collectValues(listProductsVotedByUser(userLogin));
  const votedProductsIds = votedProducts.map((product) => product.id);
  return products.map((product) => votedProductsIds.includes(product.id));
}
