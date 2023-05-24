// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  createUser,
  deleteUser,
  deleteVisitsPerDay,
  getUserById,
  getUserByLogin,
  getUserBySessionId,
  getUserByStripeCustomerId,
  getVisitsPerDay,
  incrementVisitsPerDay,
  setUserSession,
  setUserSubscription,
  type User,
} from "./db.ts";
import { assertEquals } from "std/testing/asserts.ts";

Deno.test("[db] user", async () => {
  const initUser = {
    id: crypto.randomUUID(),
    login: crypto.randomUUID(),
    avatarUrl: "https://example.com",
    stripeCustomerId: crypto.randomUUID(),
    sessionId: crypto.randomUUID(),
  };

  await createUser(initUser);
  let user = { ...initUser, isSubscribed: false } as User;
  assertEquals(await getUserById(user.id), user);
  assertEquals(await getUserByLogin(user.login), user);
  assertEquals(await getUserBySessionId(user.sessionId), user);
  assertEquals(await getUserByStripeCustomerId(user.stripeCustomerId), user);

  await setUserSubscription(user, true);
  user = { ...user, isSubscribed: true };
  assertEquals(await getUserById(user.id), user);
  assertEquals(await getUserByLogin(user.login), user);
  assertEquals(await getUserBySessionId(user.sessionId), user);
  assertEquals(await getUserByStripeCustomerId(user.stripeCustomerId), user);

  const sessionId = crypto.randomUUID();
  await setUserSession(user, sessionId);
  user = { ...user, sessionId };
  assertEquals(await getUserById(user.id), user);
  assertEquals(await getUserByLogin(user.login), user);
  assertEquals(await getUserBySessionId(user.sessionId), user);
  assertEquals(await getUserByStripeCustomerId(user.stripeCustomerId), user);

  await deleteUser(user);
  assertEquals(await getUserById(user.id), null);
  assertEquals(await getUserByLogin(user.login), null);
  assertEquals(await getUserBySessionId(user.sessionId), null);
  assertEquals(await getUserByStripeCustomerId(user.stripeCustomerId), null);

  const date = new Date("2023-01-01");
  await incrementVisitsPerDay(date);
  assertEquals((await getVisitsPerDay(date)).valueOf(), 1n);
  await deleteVisitsPerDay(date);
  assertEquals(await getVisitsPerDay(date), null);
});
