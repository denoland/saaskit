// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { createHandler, Status } from "$fresh/server.ts";
import manifest from "@/fresh.gen.ts";
import {
  collectValues,
  createItem,
  createUser,
  createVote,
  getUser,
  type Item,
  listItemsByUser,
  User,
  Vote,
} from "@/utils/db.ts";
import { genNewItem, genNewUser, genNewVote } from "@/utils/db_test.ts";
import { stripe } from "@/utils/stripe.ts";
import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertFalse,
  assertInstanceOf,
  assertNotEquals,
  assertObjectMatch,
  assertStringIncludes,
} from "std/assert/mod.ts";
import { resolvesNext, returnsNext, stub } from "std/testing/mock.ts";
import Stripe from "stripe";
import options from "./fresh.config.ts";

/**
 * @see {@link https://fresh.deno.dev/docs/examples/writing-tests|Writing tests} example on how to write tests for Fresh projects.
 */
const handler = await createHandler(manifest, options);

function assertResponseAccepted(resp: Response) {
  assert(resp.ok);
  assertEquals(resp.body, null);
  assertEquals(resp.status, Status.Accepted);
}

function assertResponseBadRequest(resp: Response) {
  assertFalse(resp.ok);
  assertEquals(
    resp.headers.get("content-type"),
    "text/plain;charset=UTF-8",
  );
  assertEquals(resp.status, Status.BadRequest);
}

function assertResponseCreated(resp: Response) {
  assert(resp.ok);
  assertEquals(resp.body, null);
  assertEquals(resp.status, Status.Created);
}

function assertResponseHtml(resp: Response) {
  assert(resp.ok);
  assertInstanceOf(resp.body, ReadableStream);
  assertEquals(
    resp.headers.get("content-type"),
    "text/html; charset=utf-8",
  );
  assertEquals(resp.status, Status.OK);
}

function assertResponseJson(resp: Response) {
  assert(resp.ok);
  assertNotEquals(resp.body, null);
  assertEquals(resp.headers.get("content-type"), "application/json");
  assertEquals(resp.status, Status.OK);
}

function assertResponseNoContent(resp: Response) {
  assert(resp.ok);
  assertEquals(resp.body, null);
  assertEquals(resp.status, Status.NoContent);
}

function assertResponseNotFound(resp: Response, header: string) {
  assertFalse(resp.ok);
  assertEquals(
    resp.headers.get("content-type"),
    header,
  );
  assertEquals(resp.status, Status.NotFound);
}

function assertResponseRedirect(
  resp: Response,
  location: string,
  status: Status,
) {
  assertFalse(resp.ok);
  assertFalse(resp.body);
  assertStringIncludes(resp.headers.get("location")!, location);
  assertEquals(resp.status, status);
}

function assertResponseServerError(resp: Response, header: string) {
  assertFalse(resp.ok);
  assertInstanceOf(resp.body, ReadableStream);
  assertEquals(
    resp.headers.get("content-type"),
    header,
  );
  assertEquals(resp.status, Status.InternalServerError);
}

function assertResponseUnauthorized(resp: Response) {
  assertFalse(resp.ok);
  assertEquals(
    resp.headers.get("content-type"),
    "text/plain;charset=UTF-8",
  );
  assertEquals(resp.status, Status.Unauthorized);
}

function assertResponseXml(resp: Response) {
  assert(resp.ok);
  assertInstanceOf(resp.body, ReadableStream);
  assertEquals(
    resp.headers.get("content-type"),
    "application/atom+xml; charset=utf-8",
  );
  assertEquals(resp.status, Status.OK);
}

Deno.test("[e2e] GET /", async () => {
  const resp = await handler(new Request("http://localhost"));

  assertResponseHtml(resp);
});

Deno.test("[e2e] GET /callback", async () => {
  const resp = await handler(
    new Request("http://localhost/callback"),
  );

  assertResponseServerError(resp, "text/html; charset=utf-8");
});

Deno.test("[e2e] GET /blog", async () => {
  const resp = await handler(
    new Request("http://localhost/blog"),
  );

  assertResponseHtml(resp);
});

Deno.test("[e2e] GET /pricing", async () => {
  const req = new Request("http://localhost/pricing");

  Deno.env.delete("STRIPE_SECRET_KEY");
  const resp = await handler(req);

  assertResponseNotFound(resp, "text/html; charset=utf-8");
});

Deno.test("[e2e] GET /signin", async () => {
  const resp = await handler(
    new Request("http://localhost/signin"),
  );

  assertResponseRedirect(
    resp,
    "https://github.com/login/oauth/authorize",
    Status.Found,
  );
});

Deno.test("[e2e] GET /signout", async () => {
  const resp = await handler(
    new Request("http://localhost/signout"),
  );

  assertResponseRedirect(resp, "/", Status.Found);
});

Deno.test("[e2e] GET /dashboard", async (test) => {
  const url = "http://localhost/dashboard";
  const user = genNewUser();
  await createUser(user);

  await test.step("returns redirect response if the session user is not signed in", async () => {
    const resp = await handler(new Request(url));

    assertResponseRedirect(resp, "/signin", Status.SeeOther);
  });

  await test.step("returns redirect response to /dashboard/stats from root route when the session user is signed in", async () => {
    const resp = await handler(
      new Request(url, {
        headers: { cookie: "site-session=" + user.sessionId },
      }),
    );

    assertResponseRedirect(resp, "/dashboard/stats", Status.SeeOther);
  });
});

Deno.test("[e2e] GET /dashboard/stats", async (test) => {
  const url = "http://localhost/dashboard/stats";
  const user = genNewUser();
  await createUser(user);

  await test.step("returns redirect response if the session user is not signed in", async () => {
    const resp = await handler(new Request(url));

    assertResponseRedirect(resp, "/signin", Status.SeeOther);
  });

  await test.step("renders dashboard stats chart for a user who is signed in", async () => {
    const resp = await handler(
      new Request(url, {
        headers: { cookie: "site-session=" + user.sessionId },
      }),
    );

    assertStringIncludes(await resp.text(), "<!--frsh-chart_default");
  });
});

Deno.test("[e2e] GET /dashboard/users", async (test) => {
  const url = "http://localhost/dashboard/users";
  const user = genNewUser();
  await createUser(user);

  await test.step("returns redirect response if the session user is not signed in", async () => {
    const resp = await handler(new Request(url));

    assertResponseRedirect(resp, "/signin", Status.SeeOther);
  });

  await test.step("renders dashboard stats table for a user who is signed in", async () => {
    const resp = await handler(
      new Request(url, {
        headers: { cookie: "site-session=" + user.sessionId },
      }),
    );

    assertStringIncludes(await resp.text(), "<!--frsh-userstable_default");
  });
});

Deno.test("[e2e] GET /submit", async () => {
  const resp = await handler(
    new Request("http://localhost/submit"),
  );

  assertResponseRedirect(resp, "/signin", Status.SeeOther);
});

Deno.test("[e2e] GET /feed", async () => {
  const resp = await handler(
    new Request("http://localhost/feed"),
  );

  assertResponseXml(resp);
});

Deno.test("[e2e] GET /api/items", async () => {
  const item1 = genNewItem();
  const item2 = genNewItem();
  await createItem(item1);
  await createItem(item2);

  const req = new Request("http://localhost/api/items");
  const resp = await handler(req);

  const { values } = await resp.json();

  assertResponseJson(resp);
  assertArrayIncludes(values, [
    JSON.parse(JSON.stringify(item1)),
    JSON.parse(JSON.stringify(item2)),
  ]);
});

Deno.test("[e2e] POST /api/items", async (test) => {
  const url = "http://localhost/api/items";
  const user = genNewUser();
  await createUser(user);

  await test.step("returns HTTP 401 Unauthorized response if the session user is not signed in", async () => {
    const resp = await handler(new Request(url, { method: "POST" }));

    assertResponseUnauthorized(resp);
    assertEquals(await resp.text(), "User must be signed in");
  });

  await test.step("returns HTTP 400 Bad Request response if item is missing title", async () => {
    const body = new FormData();
    const resp = await handler(
      new Request(url, {
        method: "POST",
        headers: { cookie: "site-session=" + user.sessionId },
        body,
      }),
    );

    assertResponseBadRequest(resp);
    assertEquals(await resp.text(), "Title is missing");
  });

  await test.step("returns HTTP 400 Bad Request response if item has an invalid or missing url", async () => {
    const body = new FormData();
    body.set("title", "Title text");
    const resp1 = await handler(
      new Request(url, {
        method: "POST",
        headers: { cookie: "site-session=" + user.sessionId },
        body,
      }),
    );

    assertResponseBadRequest(resp1);
    assertEquals(await resp1.text(), "URL is invalid or missing");

    body.set("url", "invalid-url");
    const resp2 = await handler(
      new Request(url, {
        method: "POST",
        headers: { cookie: "site-session=" + user.sessionId },
        body,
      }),
    );

    assertResponseBadRequest(resp2);
    assertEquals(await resp2.text(), "URL is invalid or missing");
  });

  await test.step("creates an item and redirects to the home page", async () => {
    const item = { title: "Title text", url: "http://bobross.com" };
    const body = new FormData();
    body.set("title", item.title);
    body.set("url", item.url);
    const resp = await handler(
      new Request(url, {
        method: "POST",
        headers: { cookie: "site-session=" + user.sessionId },
        body,
      }),
    );
    const items = await collectValues(listItemsByUser(user.login));

    assertResponseRedirect(resp, "/", Status.SeeOther);
    // Deep partial match since the item ID is a ULID generated at runtime
    assertObjectMatch(items[0], item);
  });
});

Deno.test("[e2e] GET /api/items/[id]", async () => {
  const item = genNewItem();
  const req = new Request("http://localhost/api/items/" + item.id);

  const resp1 = await handler(req);

  assertResponseNotFound(resp1, "text/plain;charset=UTF-8");
  assertEquals(await resp1.text(), "Item not found");

  await createItem(item);
  const resp2 = await handler(req);

  assertResponseJson(resp2);
  assertEquals(await resp2.json(), JSON.parse(JSON.stringify(item)));
});

Deno.test("[e2e] GET /api/users", async () => {
  const user1 = genNewUser();
  const user2 = genNewUser();
  await createUser(user1);
  await createUser(user2);

  const req = new Request("http://localhost/api/users");
  const resp = await handler(req);

  const { values } = await resp.json();

  assertResponseJson(resp);
  assertArrayIncludes(values, [user1, user2]);
});

Deno.test("[e2e] GET /api/users/[login]", async () => {
  const user = genNewUser();
  const req = new Request("http://localhost/api/users/" + user.login);

  const resp1 = await handler(req);

  assertResponseNotFound(resp1, "text/plain;charset=UTF-8");
  assertEquals(await resp1.text(), "User not found");

  await createUser(user);
  const resp2 = await handler(req);

  assertResponseJson(resp2);
  assertEquals(await resp2.json(), user);
});

Deno.test("[e2e] GET /api/users/[login]/items", async () => {
  const user = genNewUser();
  const item: Item = {
    ...genNewItem(),
    userLogin: user.login,
  };
  const req = new Request(`http://localhost/api/users/${user.login}/items`);

  const resp1 = await handler(req);

  assertResponseNotFound(resp1, "text/plain;charset=UTF-8");

  await createUser(user);
  await createItem(item);

  const resp2 = await handler(req);
  const { values } = await resp2.json();

  assertResponseJson(resp2);
  assertArrayIncludes(values, [JSON.parse(JSON.stringify(item))]);
});

Deno.test("[e2e] DELETE /api/items/[id]/vote", async (test) => {
  const item = genNewItem();
  const user = genNewUser();
  await createItem(item);
  await createUser(user);
  const vote: Vote = {
    ...genNewVote(),
    itemId: item.id,
    userLogin: user.login,
  };
  await createVote(vote);
  const url = `http://localhost/api/items/${item.id}/vote`;

  await test.step("returns HTTP 401 Unauthorized response if the session user is not signed in", async () => {
    const resp = await handler(new Request(url, { method: "DELETE" }));

    assertResponseUnauthorized(resp);
    assertEquals(await resp.text(), "User must be signed in");
  });

  await test.step("returns HTTP 404 Not Found response if the item is not found", async () => {
    const resp = await handler(
      new Request("http://localhost/api/items/bob-ross/vote", {
        method: "DELETE",
        headers: { cookie: "site-session=" + user.sessionId },
      }),
    );

    assertResponseNotFound(resp, "text/plain;charset=UTF-8");
    assertEquals(await resp.text(), "Item not found");
  });

  await test.step("returns HTTP 204 No Content when it deletes a vote", async () => {
    const resp = await handler(
      new Request(url, {
        method: "DELETE",
        headers: { cookie: "site-session=" + user.sessionId },
      }),
    );

    assertResponseNoContent(resp);
  });
});

Deno.test("[e2e] POST /api/items/[id]/vote", async (test) => {
  const item = genNewItem();
  const user = genNewUser();
  await createItem(item);
  await createUser(user);
  const url = `http://localhost/api/items/${item.id}/vote`;

  await test.step("returns HTTP 401 Unauthorized response if the session user is not signed in", async () => {
    const resp = await handler(new Request(url, { method: "POST" }));

    assertResponseUnauthorized(resp);
    assertEquals(await resp.text(), "User must be signed in");
  });

  await test.step("returns HTTP 404 Not Found response if the item is not found", async () => {
    const resp = await handler(
      new Request("http://localhost/api/items/bob-ross/vote", {
        method: "POST",
        headers: { cookie: "site-session=" + user.sessionId },
      }),
    );

    assertResponseNotFound(resp, "text/plain;charset=UTF-8");
    assertEquals(await resp.text(), "Item not found");
  });

  await test.step("creates a vote", async () => {
    const item = { ...genNewItem(), userLogin: user.login };
    await createItem(item);
    const url = `http://localhost/api/items/${item.id}/vote`;
    const resp = await handler(
      new Request(url, {
        method: "POST",
        headers: { cookie: "site-session=" + user.sessionId },
      }),
    );

    assertEquals(resp.status, Status.Created);
  });
});

function createStripeEvent(
  type: Stripe.Event.Type,
  customer: string,
): Promise<Stripe.Event> {
  return Promise.resolve({
    id: "123",
    object: "event",
    api_version: null,
    created: 0,
    livemode: false,
    pending_webhooks: 0,
    type,
    request: null,
    data: {
      object: {
        customer,
      },
    },
  });
}

Deno.test("[e2e] POST /api/stripe-webhooks", async (test) => {
  const url = "http://localhost/api/stripe-webhooks";

  await test.step("returns HTTP 404 Not Found response if Stripe is disabled", async () => {
    Deno.env.delete("STRIPE_SECRET_KEY");
    const resp = await handler(new Request(url, { method: "POST" }));

    assertResponseNotFound(resp, "text/plain;charset=UTF-8");
    assertEquals(await resp.text(), "Not Found");
  });

  await test.step("returns HTTP 400 Bad Request response if `Stripe-Signature` header is missing", async () => {
    Deno.env.set("STRIPE_SECRET_KEY", crypto.randomUUID());
    const resp = await handler(new Request(url, { method: "POST" }));

    assertResponseBadRequest(resp);
    assertEquals(await resp.text(), "`Stripe-Signature` header is missing");
  });

  await test.step("returns HTTP 500 Internal Server Error response if `STRIPE_WEBHOOK_SECRET` environment variable is not set", async () => {
    Deno.env.delete("STRIPE_WEBHOOK_SECRET");
    const resp = await handler(
      new Request(url, {
        method: "POST",
        headers: { "Stripe-Signature": crypto.randomUUID() },
      }),
    );

    assertResponseServerError(resp, "text/plain;charset=UTF-8");
    assertEquals(
      await resp.text(),
      "`STRIPE_WEBHOOK_SECRET` environment variable is not set",
    );
  });

  await test.step("returns HTTP 400 Bad Request response if the event payload is invalid", async () => {
    Deno.env.set("STRIPE_WEBHOOK_SECRET", crypto.randomUUID());
    const resp = await handler(
      new Request(url, {
        method: "POST",
        headers: { "Stripe-Signature": crypto.randomUUID() },
      }),
    );

    assertResponseBadRequest(resp);
    assertEquals(
      await resp.text(),
      "No webhook payload was provided.",
    );
  });

  await test.step("returns HTTP 404 Not Found response if the user is not found for subscription creation", async () => {
    const constructEventAsyncStub = stub(
      stripe.webhooks,
      "constructEventAsync",
      returnsNext([
        createStripeEvent("customer.subscription.created", "x"),
      ]),
    );

    const resp = await handler(
      new Request(url, {
        method: "POST",
        headers: { "Stripe-Signature": crypto.randomUUID() },
      }),
    );

    assertResponseNotFound(resp, "text/plain;charset=UTF-8");
    assertEquals(await resp.text(), "User not found");

    constructEventAsyncStub.restore();
  });

  await test.step("returns HTTP 201 Created response if the subscription is created", async () => {
    const user = genNewUser();
    await createUser(user);

    const constructEventAsyncStub = stub(
      stripe.webhooks,
      "constructEventAsync",
      returnsNext([
        createStripeEvent(
          "customer.subscription.created",
          user.stripeCustomerId!,
        ),
      ]),
    );

    const resp = await handler(
      new Request(url, {
        method: "POST",
        headers: { "Stripe-Signature": crypto.randomUUID() },
      }),
    );

    assertEquals(await getUser(user.login), { ...user, isSubscribed: true });
    assertResponseCreated(resp);

    constructEventAsyncStub.restore();
  });

  await test.step("returns HTTP 404 Not Found response if the user is not found for subscription deletion", async () => {
    const constructEventAsyncStub = stub(
      stripe.webhooks,
      "constructEventAsync",
      returnsNext([
        createStripeEvent("customer.subscription.deleted", "x"),
      ]),
    );

    const resp = await handler(
      new Request(url, {
        method: "POST",
        headers: { "Stripe-Signature": crypto.randomUUID() },
      }),
    );

    assertResponseNotFound(resp, "text/plain;charset=UTF-8");
    assertEquals(await resp.text(), "User not found");

    constructEventAsyncStub.restore();
  });

  await test.step("returns HTTP 202 Accepted response if the subscription is deleted", async () => {
    const user: User = { ...genNewUser(), isSubscribed: true };
    await createUser(user);

    const constructEventAsyncStub = stub(
      stripe.webhooks,
      "constructEventAsync",
      returnsNext([
        createStripeEvent(
          "customer.subscription.deleted",
          user.stripeCustomerId!,
        ),
      ]),
    );

    const resp = await handler(
      new Request(url, {
        method: "POST",
        headers: { "Stripe-Signature": crypto.randomUUID() },
      }),
    );

    assertEquals(await getUser(user.login), { ...user, isSubscribed: false });
    assertResponseAccepted(resp);

    constructEventAsyncStub.restore();
  });

  await test.step("returns HTTP 400 Bad Request response if the event type is not supported", async () => {
    const constructEventAsyncStub = stub(
      stripe.webhooks,
      "constructEventAsync",
      returnsNext([
        createStripeEvent("account.application.authorized", "x"),
      ]),
    );

    const resp = await handler(
      new Request(url, {
        method: "POST",
        headers: { "Stripe-Signature": crypto.randomUUID() },
      }),
    );

    assertResponseBadRequest(resp);
    assertEquals(await resp.text(), "Event type not supported");

    constructEventAsyncStub.restore();
  });
});

Deno.test("[e2e] GET /account", async (test) => {
  const url = "http://localhost/account";

  await test.step("returns redirect response if the session user is not signed in", async () => {
    const resp = await handler(new Request(url));

    assertResponseRedirect(resp, "/signin", Status.SeeOther);
  });

  await test.step("renders the account page as a free user", async () => {
    const user = genNewUser();
    await createUser(user);

    const resp = await handler(
      new Request(url, {
        headers: { cookie: "site-session=" + user.sessionId },
      }),
    );

    assertStringIncludes(await resp.text(), 'href="/account/upgrade"');
  });

  await test.step("renders the account page as a premium user", async () => {
    const user = genNewUser();
    await createUser({ ...user, isSubscribed: true });

    const resp = await handler(
      new Request(url, {
        headers: { cookie: "site-session=" + user.sessionId },
      }),
    );

    assertStringIncludes(await resp.text(), 'href="/account/manage"');
  });
});

Deno.test("[e2e] GET /account/manage", async (test) => {
  const url = "http://localhost/account/manage";
  Deno.env.set("STRIPE_SECRET_KEY", crypto.randomUUID());

  await test.step("returns redirect response if the session user is not signed in", async () => {
    const resp = await handler(new Request(url));

    assertResponseRedirect(resp, "/signin", Status.SeeOther);
  });

  await test.step("returns HTTP 404 Not Found response if the session user does not have a Stripe customer ID", async () => {
    const user = genNewUser();
    await createUser({ ...user, stripeCustomerId: undefined });
    const resp = await handler(
      new Request(url, {
        headers: { cookie: "site-session=" + user.sessionId },
      }),
    );

    assertResponseNotFound(resp, "text/html; charset=utf-8");
  });

  await test.step("returns redirect response to the URL returned by Stripe after creating a billing portal session", async () => {
    const user = genNewUser();
    await createUser(user);

    const session = { url: "https://stubbing-returned-url" } as Stripe.Response<
      Stripe.BillingPortal.Session
    >;
    const sessionsCreateStub = stub(
      stripe.billingPortal.sessions,
      "create",
      resolvesNext([session]),
    );

    const resp = await handler(
      new Request(url, {
        headers: { cookie: "site-session=" + user.sessionId },
      }),
    );

    assertResponseRedirect(resp, session.url, Status.SeeOther);

    sessionsCreateStub.restore();
  });
});

Deno.test("[e2e] GET /account/upgrade", async (test) => {
  const url = "http://localhost/account/upgrade";

  await test.step("returns redirect response if the session user is not signed in", async () => {
    const resp = await handler(new Request(url));

    assertResponseRedirect(resp, "/signin", Status.SeeOther);
  });

  const user = genNewUser();
  await createUser(user);

  await test.step("returns HTTP 500 Internal Server Error response if the `STRIPE_PREMIUM_PLAN_PRICE_ID` environment variable is not set", async () => {
    Deno.env.set("STRIPE_SECRET_KEY", crypto.randomUUID());
    Deno.env.delete("STRIPE_PREMIUM_PLAN_PRICE_ID");
    const resp = await handler(
      new Request(url, {
        headers: { cookie: "site-session=" + user.sessionId },
      }),
    );

    assertResponseServerError(resp, "text/html; charset=utf-8");
  });

  await test.step("returns HTTP 404 Not Found response if Stripe is disabled", async () => {
    Deno.env.set("STRIPE_PREMIUM_PLAN_PRICE_ID", crypto.randomUUID());
    Deno.env.delete("STRIPE_SECRET_KEY");
    const resp = await handler(
      new Request(url, {
        headers: { cookie: "site-session=" + user.sessionId },
      }),
    );

    assertResponseNotFound(resp, "text/html; charset=utf-8");
  });

  await test.step("returns HTTP 404 Not Found response if Stripe returns a `null` URL", async () => {
    Deno.env.set("STRIPE_PREMIUM_PLAN_PRICE_ID", crypto.randomUUID());
    Deno.env.set("STRIPE_SECRET_KEY", crypto.randomUUID());

    const session = { url: null } as Stripe.Response<
      Stripe.Checkout.Session
    >;
    const sessionsCreateStub = stub(
      stripe.checkout.sessions,
      "create",
      resolvesNext([session]),
    );

    const resp = await handler(
      new Request(url, {
        headers: { cookie: "site-session=" + user.sessionId },
      }),
    );

    assertResponseNotFound(resp, "text/html; charset=utf-8");
    sessionsCreateStub.restore();
  });

  await test.step("returns redirect response to the URL returned by Stripe after creating a checkout session", async () => {
    const priceId = crypto.randomUUID();
    Deno.env.set("STRIPE_PREMIUM_PLAN_PRICE_ID", priceId);
    Deno.env.set("STRIPE_SECRET_KEY", crypto.randomUUID());

    const session = { url: "https://stubbing-returned-url" } as Stripe.Response<
      Stripe.Checkout.Session
    >;
    const sessionsCreateStub = stub(
      stripe.checkout.sessions,
      "create",
      resolvesNext([session]),
    );

    const resp = await handler(
      new Request(url, {
        headers: { cookie: "site-session=" + user.sessionId },
      }),
    );

    assertResponseRedirect(resp, session.url!, Status.SeeOther);

    sessionsCreateStub.restore();
  });
});

Deno.test("[e2e] GET /api/me/votes", async () => {
  const user = genNewUser();
  await createUser(user);
  const item1 = genNewItem();
  const item2 = genNewItem();
  await createItem(item1);
  await createItem(item2);
  await createVote({
    userLogin: user.login,
    itemId: item1.id,
  });
  await createVote({
    userLogin: user.login,
    itemId: item2.id,
  });
  const resp = await handler(
    new Request("http://localhost/api/me/votes", {
      headers: { cookie: "site-session=" + user.sessionId },
    }),
  );
  const body = await resp.json();

  assertArrayIncludes(body, [{ ...item1, score: 1 }, { ...item2, score: 1 }]);
});
