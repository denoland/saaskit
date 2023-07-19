// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { RouteContext } from "$fresh/server.ts";
import type { AccountState } from "./_middleware.ts";
import { BUTTON_STYLES } from "@/utils/constants.ts";
import { ComponentChild } from "preact";
import { stripe } from "@/utils/payments.ts";
import Head from "@/components/Head.tsx";

interface RowProps {
  title: string;
  children?: ComponentChild;
  text: string;
}

function Row(props: RowProps) {
  return (
    <li class="py-4">
      <div class="flex flex-wrap justify-between">
        <span>
          <strong>{props.title}</strong>
        </span>
        {props.children && <span>{props.children}</span>}
      </div>
      <p>
        {props.text}
      </p>
    </li>
  );
}

/** @todo Remove ignore if route components introduce support for sync route components. */
// deno-lint-ignore require-await
export default async function AccountPage(
  _req: Request,
  ctx: RouteContext<unknown, AccountState>,
) {
  const { user } = ctx.state;
  const action = user.isSubscribed ? "Manage" : "Upgrade";

  return (
    <>
      <Head title="Account" href={ctx.url.href} />
      <main class="max-w-lg m-auto w-full flex-1 p-4 flex flex-col justify-center">
        <img
          src={user?.avatarUrl}
          alt="User Avatar"
          crossOrigin="anonymous"
          class="max-w-[50%] self-center rounded-full aspect-square mb-4 md:mb-6"
        />
        <ul>
          <Row
            title="Username"
            text={user.login}
          />
          <Row
            title="Subscription"
            text={user.isSubscribed ? "Premium 🦕" : "Free"}
          >
            {stripe && (
              <a
                class="underline"
                href={`/account/${action.toLowerCase()}`}
              >
                {action}
              </a>
            )}
          </Row>
        </ul>
        <a
          href="/signout"
          class={`${BUTTON_STYLES} block text-center mt-8`}
        >
          Sign out
        </a>
      </main>
    </>
  );
}
