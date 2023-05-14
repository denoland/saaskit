import { createSupabaseClient } from "../utils/auth.ts";
import { handler } from "../routes/signup.tsx";
import { stripe } from "@/utils/payments.ts";
import { assert } from "https://deno.land/std@0.178.0/_util/asserts.ts";
Deno.test("Create new user", async (t) => {
  await t.step("Returns 201 on successful creation", async () => {
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
      { state: { supabaseClient } } as any,
    );
    assert(res.status === 201, "Did not return 201");
  });
  await deleteAllStripeCustomers();
});
async function deleteAllStripeCustomers() {
  const response = await stripe.customers.list();
  for (const customer of response.data) {
    await stripe.customers.del(customer.id);
  }
}
