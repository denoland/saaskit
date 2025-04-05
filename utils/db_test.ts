// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import { assertEquals, assertRejects } from "$std/assert/mod.ts";
import { ulid } from "$std/ulid/mod.ts";
import {
  collectValues,
  createProduct,
  createUser,
  createVote,
  getAreVotedByUser,
  getProduct,
  getUser,
  getUserBySession,
  getUserByStripeCustomer,
  type Product,
  listProducts,
  listProductsByUser,
  listProductsVotedByUser,
  randomProduct,
  randomUser,
  updateUser,
  updateUserSession,
  type User,
} from "./db.ts";

Deno.test("[db] products", async () => {
  const user = randomUser();
  const product1: Product = {
    ...randomProduct(),
    id: ulid(),
    userLogin: user.login,
  };
  const product2: Product = {
    ...randomProduct(),
    id: ulid(Date.now() + 1_000),
    userLogin: user.login,
  };

  assertEquals(await getProduct(product1.id), null);
  assertEquals(await getProduct(product2.id), null);
  assertEquals(await collectValues(listProducts()), []);
  assertEquals(await collectValues(listProductsByUser(user.login)), []);

  await createProduct(product1);
  await createProduct(product2);
  await assertRejects(async () => await createProduct(product1));

  assertEquals(await getProduct(product1.id), product1);
  assertEquals(await getProduct(product2.id), product2);
  assertEquals(await collectValues(listProducts()), [product1, product2]);
  assertEquals(await collectValues(listProductsByUser(user.login)), [
    product1,
    product2,
  ]);
});

Deno.test("[db] user", async () => {
  const user = randomUser();

  assertEquals(await getUser(user.login), null);
  assertEquals(await getUserBySession(user.sessionId), null);
  assertEquals(await getUserByStripeCustomer(user.stripeCustomerId!), null);

  await createUser(user);
  await assertRejects(async () => await createUser(user));
  assertEquals(await getUser(user.login), user);
  assertEquals(await getUserBySession(user.sessionId), user);
  assertEquals(await getUserByStripeCustomer(user.stripeCustomerId!), user);

  const subscribedUser: User = { ...user, isSubscribed: true };
  await updateUser(subscribedUser);
  assertEquals(await getUser(subscribedUser.login), subscribedUser);
  assertEquals(
    await getUserBySession(subscribedUser.sessionId),
    subscribedUser,
  );
  assertEquals(
    await getUserByStripeCustomer(subscribedUser.stripeCustomerId!),
    subscribedUser,
  );

  const newSessionId = crypto.randomUUID();
  await updateUserSession(user, newSessionId);
  assertEquals(await getUserBySession(user.sessionId), null);
  assertEquals(await getUserBySession(newSessionId), {
    ...user,
    sessionId: newSessionId,
  });

  await assertRejects(
    async () => await updateUserSession(user, newSessionId),
    Error,
    "Failed to update user session",
  );
});

Deno.test("[db] votes", async () => {
  const product = randomProduct();
  const user = randomUser();
  const vote = {
    productId: product.id,
    userLogin: user.login,
    createdAt: new Date(),
  };

  assertEquals(await collectValues(listProductsVotedByUser(user.login)), []);

  await assertRejects(
    async () => await createVote(vote),
    Deno.errors.NotFound,
    "product not found",
  );
  await createProduct(product);
  await assertRejects(
    async () => await createVote(vote),
    Deno.errors.NotFound,
    "User not found",
  );
  await createUser(user);
  await createVote(vote);
  product.score++;

  assertEquals(await collectValues(listProductsVotedByUser(user.login)), [product]);
  await assertRejects(async () => await createVote(vote));
});

Deno.test("[db] getAreVotedByUser()", async () => {
  const product = randomProduct();
  const user = randomUser();
  const vote = {
    productId: product.id,
    userLogin: user.login,
    createdAt: new Date(),
  };

  assertEquals(await getProduct(product.id), null);
  assertEquals(await getUser(user.login), null);
  assertEquals(await getAreVotedByUser([product], user.login), [false]);

  await createProduct(product);
  await createUser(user);
  await createVote(vote);
  product.score++;

  assertEquals(await getProduct(product.id), product);
  assertEquals(await getUser(user.login), user);
  assertEquals(await getAreVotedByUser([product], user.login), [true]);
});
