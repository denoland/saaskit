// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { RouteContext } from "$fresh/server.ts";
import { stripe } from "@/utils/payments.ts";
import type { AccountState } from "./_middleware.ts";
import { redirect } from "@/utils/redirect.ts";

export default async function AccountManagePage(
  req: Request,
  ctx: RouteContext<unknown, AccountState>,
) {
  if (stripe === undefined || ctx.state.user.stripeCustomerId === undefined) {
    return ctx.renderNotFound();
  }

  const { url } = await stripe.billingPortal.sessions.create({
    customer: ctx.state.user.stripeCustomerId,
    return_url: new URL(req.url).origin + "/account",
  });

  return redirect(url);
}
