// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { createHandler, Status } from "$fresh/server.ts";
import manifest from "@/fresh.gen.ts";
import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertFalse,
  assertInstanceOf,
  assertNotEquals,
  assertStringIncludes,
} from "std/testing/asserts.ts";
import {
  genNewComment,
  genNewItem,
  genNewNotification,
  genNewUser,
} from "@/utils/db_test.ts";
import {
  type Comment,
  createComment,
  createItem,
  createNotification,
  createUser,
  type Item,
  type Notification,
} from "@/utils/db.ts";

function assertResponseNotFound(resp: Response) {
  assertFalse(resp.ok);
  assertEquals(resp.body, null);
  assertEquals(resp.status, Status.NotFound);
}

function assertResponseJson(resp: Response) {
  assert(resp.ok);
  assertNotEquals(resp.body, null);
  assertEquals(resp.headers.get("content-type"), "application/json");
}

Deno.test("[http]", async (test) => {
  const handler = await createHandler(manifest);

  await test.step("GET /", async () => {
    const resp = await handler(new Request("http://localhost"));

    assert(resp.ok);
    assertInstanceOf(resp.body, ReadableStream);
    assertEquals(
      resp.headers.get("content-type"),
      "text/html; charset=utf-8",
    );
    assertEquals(resp.status, 200);
  });

  await test.step("GET /account", async () => {
    const resp = await handler(
      new Request("http://localhost/account"),
    );

    assertFalse(resp.ok);
    assertFalse(resp.body);
    assertEquals(
      resp.headers.get("location"),
      "/signin?from=http://localhost/account",
    );
    assertEquals(resp.status, 303);
  });

  await test.step("GET /callback", async () => {
    const resp = await handler(
      new Request("http://localhost/callback"),
    );

    assertFalse(resp.ok);
    assertInstanceOf(resp.body, ReadableStream);
    assertEquals(
      resp.headers.get("content-type"),
      "text/html; charset=utf-8",
    );
    assertEquals(resp.status, 500);
  });

  await test.step("GET /blog", async () => {
    const resp = await handler(
      new Request("http://localhost/blog"),
    );

    assert(resp.ok);
    assertInstanceOf(resp.body, ReadableStream);
    assertEquals(
      resp.headers.get("content-type"),
      "text/html; charset=utf-8",
    );
    assertEquals(resp.status, 200);
  });

  await test.step("GET /pricing", async () => {
    const resp = await handler(
      new Request("http://localhost/pricing"),
    );

    assertFalse(resp.ok);
    assertInstanceOf(resp.body, ReadableStream);
    assertEquals(
      resp.headers.get("content-type"),
      "text/html; charset=utf-8",
    );
    assertEquals(resp.status, 404);
  });

  await test.step("GET /signin", async () => {
    const resp = await handler(
      new Request("http://localhost/signin"),
    );

    assertFalse(resp.ok);
    assertFalse(resp.body);
    assertStringIncludes(
      resp.headers.get("location")!,
      "https://github.com/login/oauth/authorize",
    );
    assertEquals(resp.status, 302);
  });

  await test.step("GET /signout", async () => {
    const resp = await handler(
      new Request("http://localhost/signout"),
    );

    assertFalse(resp.ok);
    assertFalse(resp.body);
    assertEquals(resp.headers.get("location"), "/");
    assertEquals(resp.status, 302);
  });

  await test.step("GET /dashboard", async () => {
    const resp = await handler(
      new Request("http://localhost/dashboard"),
    );

    assertFalse(resp.ok);
    assertFalse(resp.body);
    assertEquals(
      resp.headers.get("location"),
      "/signin?from=http://localhost/dashboard",
    );
    assertEquals(resp.status, 303);
  });

  await test.step("GET /submit", async () => {
    const resp = await handler(
      new Request("http://localhost/submit"),
    );

    assertFalse(resp.ok);
    assertFalse(resp.body);
    assertEquals(
      resp.headers.get("location"),
      "/signin?from=http://localhost/submit",
    );
    assertEquals(resp.status, 303);
  });

  await test.step("POST /submit", async () => {
    const resp = await handler(
      new Request("http://localhost/submit", { method: "POST" }),
    );

    assertFalse(resp.ok);
    assertFalse(resp.body);
    assertEquals(resp.status, 303);
  });

  await test.step("GET /feed", async () => {
    const resp = await handler(
      new Request("http://localhost/feed"),
    );

    assert(resp.ok);
    assertInstanceOf(resp.body, ReadableStream);
    assertEquals(
      resp.headers.get("content-type"),
      "application/atom+xml; charset=utf-8",
    );
    assertEquals(resp.status, 200);
  });

  await test.step("GET /api/items", async () => {
    const item1 = genNewItem();
    const item2 = genNewItem();
    await createItem(item1);
    await createItem(item2);

    const req = new Request("http://localhost/api/items");
    const resp = await handler(req);

    const { items } = await resp.json();
    assertResponseJson(resp);
    assertArrayIncludes(items, [
      JSON.parse(JSON.stringify(item1)),
      JSON.parse(JSON.stringify(item2)),
    ]);
  });

  await test.step("GET /api/items/[id]", async () => {
    const item = genNewItem();
    const req = new Request("http://localhost/api/items/" + item.id);

    const resp1 = await handler(req);
    assertResponseNotFound(resp1);

    await createItem(item);
    const resp2 = await handler(req);
    assertResponseJson(resp2);
    assertEquals(await resp2.json(), JSON.parse(JSON.stringify(item)));
  });

  await test.step("GET /api/items/[id]/comments", async () => {
    const item = genNewItem();
    const comment: Comment = {
      ...genNewComment(),
      itemId: item.id,
    };
    const req = new Request(`http://localhost/api/items/${item.id}/comments`);

    const resp1 = await handler(req);
    assertResponseNotFound(resp1);

    await createItem(item);
    await createComment(comment);
    const resp2 = await handler(req);
    const { comments } = await resp2.json();
    assertResponseJson(resp2);
    assertEquals(comments, JSON.parse(JSON.stringify(comments)));
  });

  await test.step("GET /api/users", async () => {
    const user1 = genNewUser();
    const user2 = genNewUser();
    await createUser(user1);
    await createUser(user2);

    const req = new Request("http://localhost/api/users");
    const resp = await handler(req);

    const { users } = await resp.json();
    assertResponseJson(resp);
    assertArrayIncludes(users, [user1, user2]);
  });

  await test.step("GET /api/users/[login]", async () => {
    const user = genNewUser();
    const req = new Request("http://localhost/api/users/" + user.login);

    const resp1 = await handler(req);
    assertResponseNotFound(resp1);

    await createUser(user);
    const resp2 = await handler(req);
    assertResponseJson(resp2);
    assertEquals(await resp2.json(), user);
  });

  await test.step("GET /api/users/[login]/items", async () => {
    const user = genNewUser();
    const item: Item = {
      ...genNewItem(),
      userLogin: user.login,
    };
    const req = new Request(`http://localhost/api/users/${user.login}/items`);

    const resp1 = await handler(req);
    assertResponseNotFound(resp1);

    await createUser(user);
    await createItem(item);

    const resp2 = await handler(req);
    const { items } = await resp2.json();
    assertResponseJson(resp2);
    assertArrayIncludes(items, [JSON.parse(JSON.stringify(item))]);
  });

  await test.step("GET /api/users/[login]/notifications", async () => {
    const user = genNewUser();
    const notification: Notification = {
      ...genNewNotification(),
      userLogin: user.login,
    };
    const req = new Request(
      `http://localhost/api/users/${user.login}/notifications`,
    );

    const resp1 = await handler(req);
    assertResponseNotFound(resp1);

    await createUser(user);
    await createNotification(notification);

    const resp2 = await handler(req);
    const { notifications } = await resp2.json();
    assertResponseJson(resp2);
    assertArrayIncludes(notifications, [
      JSON.parse(JSON.stringify(notification)),
    ]);
  });
});
