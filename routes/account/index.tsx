// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { defineRoute } from "$fresh/server.ts";
import type { SignedInState } from "@/plugins/session.ts";
import { BUTTON_STYLES } from "@/utils/constants.ts";
import { isStripeEnabled } from "@/utils/stripe.ts";
import Head from "@/components/Head.tsx";
import GitHubAvatarImg from "@/components/GitHubAvatarImg.tsx";

export default defineRoute<SignedInState>((_req, ctx) => {
  const { sessionUser } = ctx.state;
  const action = sessionUser.isSubscribed ? "Manage" : "Upgrade";

  return (
    <>
      <Head title="Account" href={ctx.url.href} />
      <main class="max-w-lg m-auto w-full flex-1 p-4 flex flex-col justify-center gap-8">
        <GitHubAvatarImg
          login={sessionUser.login}
          size={240}
          class="mx-auto"
        />
        <ul class="space-y-4">
          <li>
            <p>
              <strong>Username</strong>
            </p>
            <p>
              {sessionUser.login}
            </p>
          </li>
          <li>
            <p class="flex flex-wrap justify-between">
              <span>
                <strong>Subscription</strong>
              </span>
              {isStripeEnabled() && (
                <span>
                  <a
                    class="underline"
                    href={`/account/${action.toLowerCase()}`}
                  >
                    {action}
                  </a>
                </span>
              )}
            </p>
            <p>
              {sessionUser.isSubscribed ? "Premium 🦕" : "Free"}
            </p>
          </li>
        </ul>
        <a
          href="/signout?success_url=/"
          class={`${BUTTON_STYLES} block text-center`}
        >
          Sign out
        </a>
      </main>
    </>
  );
});
