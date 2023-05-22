// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { handler } from "../routes/submit.tsx";
import { assert } from "https://deno.land/std@0.178.0/_util/asserts.ts";
import { deleteAllItems, getAllItems } from "../utils/db.ts";

Deno.test("Create new post", async (t) => {
  await t.step("Returns 303 on successful creation", async () => {
    const formData = new FormData();
    formData.append("title", "My new post");
    formData.append("url", "http://google.com");
    const requestHeaders = new Headers();
    requestHeaders.append("host", "http://localhost");
    const request = new Request("https://myfake.com/endpoint", {
      method: "POST",
      body: formData,
      headers: requestHeaders,
    });

    const res = await handler!.POST!(
      request,
      // deno-lint-ignore no-explicit-any
      { state: { session: { user: { id: "myUserId" } } } } as any,
    );
    const itemsInDb = await getAllItems();
    assert(res.status === 303, "Did not return 303");
    assert(itemsInDb.length === 1, "Item not created in DB");
  });
  await deleteAllItems();
});
