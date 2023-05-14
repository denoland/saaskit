// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { createSupabaseClient } from "../utils/auth.ts";
import { handler } from "../routes/signup.tsx";
import { stripe } from "@/utils/payments.ts";
import { assert } from "https://deno.land/std@0.178.0/_util/asserts.ts";
import { deleteAllUsers, getAllUsers } from "../utils/db.ts";
Deno.test("Create new user", async (t) => {
  await t.step("Returns 303 on successful creation", async () => {
    const formData = new FormData();
    formData.append("display_name", "testDisplay");
    formData.append("email", "mygoodemail@email.com");
    formData.append("password", "random password so secure");
    const requestHeaders = new Headers();
    requestHeaders.append("host", "http://localhost");
    const request = new Request("https://myfake.com/endpoint", {
      method: "POST",
      body: formData,
      headers: requestHeaders,
    });

    const headers = new Headers();
    const supabaseClient = createSupabaseClient(request.headers, headers);

    const res = await handler!.POST!(
      request,
      // deno-lint-ignore no-explicit-any
      { state: { supabaseClient } } as any,
    );
    const users = await getAllUsers();
    assert(res.status === 303, "Did not return 303");
    assert(users.length === 1, "User not created in DB");
  });
  await deleteAllUsers();
  await deleteAllStripeCustomers();
});
async function deleteAllStripeCustomers() {
  const response = await stripe.customers.list();
  for (const customer of response.data) {
    await stripe.customers.del(customer.id);
  }
}
