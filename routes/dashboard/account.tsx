// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers, PageProps } from "$fresh/server.ts";
import Head from "@/components/Head.tsx";
import type { DashboardState } from "./_middleware.ts";
import Dashboard from "@/components/Dashboard.tsx";
import type { Database } from "@/utils/supabase_types.ts";
import { BASE_NOTICE_STYLES } from "@/utils/constants.ts";

interface AccountPageData extends DashboardState {
  customer: Database["public"]["Tables"]["customers"]["Row"];
}

export const handler: Handlers<AccountPageData, DashboardState> = {
  async GET(_request, ctx) {
    const customer = await ctx.state.createOrGetCustomer();
    return ctx.render({ ...ctx.state, customer });
  },
};

export default function AccountPage(props: PageProps<AccountPageData>) {
  const action = props.data.customer.is_subscribed ? "Manage" : "Upgrade";
  const hasResetPassword = new URL(props.url).searchParams.get(
    "has_reset_password",
  );

  return (
    <>
      <Head title="Account" />
      <Dashboard active="/dashboard/account">
        {hasResetPassword && (
          <div class={BASE_NOTICE_STYLES}>
            Your password has successfully been reset
          </div>
        )}
        <ul class="space-y-2">
          <li class="flex items-center justify-between gap-2 py-2">
            <div class="flex-1">
              <strong>Email</strong>
            </div>
            <div>{props.data.session.user.email}</div>
          </li>
          <li class="flex items-center justify-between gap-2 py-2">
            <div class="flex-1">
              <strong>Subscription</strong>
            </div>
            <a
              class="underline"
              href={`/dashboard/${action.toLowerCase()}-subscription`}
            >
              {action} subscription
            </a>
          </li>
        </ul>
      </Dashboard>
    </>
  );
}
