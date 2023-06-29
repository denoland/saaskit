// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  type Comment,
  createComment,
  createItem,
  createUser,
  createVote,
  deleteComment,
  deleteItem,
  deleteUserBySession,
  deleteVote,
  formatDate,
  getAllItems,
  getCommentsByItem,
  getDatesSince,
  getItem,
  getItemsByUser,
  getItemsSince,
  getManyMetrics,
  getManyUsers,
  getUser,
  getUserByLogin,
  getUserBySession,
  getUserByStripeCustomer,
  getVotedItemsByUser,
  incrVisitsCountByDay,
  type Item,
  newCommentProps,
  newItemProps,
  newUserProps,
  updateUser,
  type User,
} from "./db.ts";
import {
  assertAlmostEquals,
  assertArrayIncludes,
  assertEquals,
  assertRejects,
} from "std/testing/asserts.ts";
import { DAY } from "std/datetime/constants.ts";

function genNewComment(comment?: Partial<Comment>): Comment {
  return {
    itemId: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    text: crypto.randomUUID(),
    ...newCommentProps(),
    ...comment,
  };
}

function genNewItem(item?: Partial<Item>): Item {
  return {
    userId: crypto.randomUUID(),
    title: crypto.randomUUID(),
    url: `http://${crypto.randomUUID()}.com`,
    ...newItemProps(),
    ...item,
  };
}

function genNewUser(): User {
  return {
    id: crypto.randomUUID(),
    login: crypto.randomUUID(),
    avatarUrl: `http://${crypto.randomUUID()}`,
    sessionId: crypto.randomUUID(),
    stripeCustomerId: crypto.randomUUID(),
    ...newUserProps(),
  };
}

Deno.test("[db] newItemProps()", () => {
  const itemProps = newItemProps();
  assertAlmostEquals(itemProps.createdAt.getTime(), Date.now(), 1e-6);
  assertEquals(typeof itemProps.id, "string");
  assertEquals(itemProps.score, 0);
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
  const userId = crypto.randomUUID();
  const item1 = genNewItem({ userId });
  const item2 = genNewItem({ userId });

  assertEquals(await getItemsByUser(userId), []);

  await createItem(item1);
  await createItem(item2);
  assertArrayIncludes(await getItemsByUser(userId), [item1, item2]);
});

Deno.test("[db] getItemsSince()", async () => {
  const item1 = genNewItem();
  const item2 = genNewItem({
    createdAt: new Date(Date.now() - (2 * DAY)),
  });

  await createItem(item1);
  await createItem(item2);

  assertArrayIncludes(await getItemsSince(DAY), [item1]);
  assertArrayIncludes(await getItemsSince(3 * DAY), [item1, item2]);
});

Deno.test("[db] user", async () => {
  const user = genNewUser();

  assertEquals(await getUser(user.id), null);
  assertEquals(await getUserByLogin(user.login), null);
  assertEquals(await getUserBySession(user.sessionId), null);
  assertEquals(await getUserByStripeCustomer(user.stripeCustomerId!), null);

  await createUser(user);
  await assertRejects(async () => await createUser(user));
  assertEquals(await getManyMetrics("users_count", [new Date()]), [1n]);
  assertEquals(await getUser(user.id), user);
  assertEquals(await getUserByLogin(user.login), user);
  assertEquals(await getUserBySession(user.sessionId), user);
  assertEquals(await getUserByStripeCustomer(user.stripeCustomerId!), user);

  const user1 = genNewUser();
  await createUser(user1);
  assertArrayIncludes(await getManyUsers([user.id, user1.id]), [user, user1]);

  await deleteUserBySession(user.sessionId);
  assertEquals(await getUserBySession(user.sessionId), null);

  const newUser: User = { ...user, sessionId: crypto.randomUUID() };
  await updateUser(newUser);
  assertEquals(await getUser(newUser.id), newUser);
  assertEquals(await getUserByLogin(newUser.login), newUser);
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
  assertAlmostEquals(commentProps.createdAt.getTime(), Date.now(), 1e-6);
  assertEquals(typeof commentProps.id, "string");
});

Deno.test("[db] (create/delete)Comment() + getCommentsByItem()", async () => {
  const itemId = crypto.randomUUID();
  const comment1 = genNewComment({
    itemId,
  });
  const comment2 = genNewComment({
    itemId,
  });

  assertEquals(await getCommentsByItem(itemId), []);

  await createComment(comment1);
  await createComment(comment2);
  await assertRejects(async () => await createComment(comment2));
  assertArrayIncludes(await getCommentsByItem(itemId), [comment1, comment2]);

  await deleteComment(comment1);
  await deleteComment(comment2);
  assertEquals(await getCommentsByItem(itemId), []);
});

Deno.test("[db] votes", async () => {
  const user = genNewUser();
  const item = genNewItem();

  assertEquals(await getVotedItemsByUser(user.id), []);

  const dates = [new Date()];
  assertEquals(await getManyMetrics("votes_count", dates), [0n]);
  await createVote({ item, user });
  assertEquals(await getManyMetrics("votes_count", dates), [1n]);
  assertEquals(await getVotedItemsByUser(user.id), [item]);
  await deleteVote({ item, user });
  assertEquals(await getVotedItemsByUser(user.id), []);
  await createVote({ item, user });
  assertRejects(async () => await createVote({ item, user }));
  await deleteVote({ item, user });
  assertRejects(async () => await deleteVote({ item, user }));
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
