// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  BUTTON_STYLES,
  LINK_STYLES,
  NAV_STYLES,
  SITE_BAR_STYLES,
} from "@/utils/constants.ts";
import Logo from "./Logo.tsx";
import { stripe } from "@/utils/payments.ts";
import { Bell, CircleFilled } from "./Icons.tsx";

export default function Header(
  props: { sessionId?: string; hasNotifications: boolean },
) {
  return (
    <header class={SITE_BAR_STYLES + " items-start"}>
      <input
        type="checkbox"
        id="menuToggle"
        class="hidden checked:siblings:flex"
        autoComplete="off"
      />

      <a href="/" class="block shrink-0">
        <Logo height="48" class="shrink-0" />
      </a>
      <nav
        class={"flex flex-wrap gap-x-8 gap-y-4 items-center justify-between h-full sm:flex-row flex-col justify-normal w-full"}
      >
        {stripe
          ? <a href="/pricing" class={LINK_STYLES + " block"}>Pricing</a>
          : null}
        {props.sessionId
          ? <a href="/account" class={LINK_STYLES + " block"}>Account</a>
          : <a href="/signin" class={LINK_STYLES + " block"}>Sign in</a>}
        <a
          href="/account/notifications"
          class={LINK_STYLES + " relative"}
          aria-label="Notifications"
        >
          <Bell class="w-6 h-6" />
          {props.hasNotifications && (
            <CircleFilled class="absolute top-0.5 right-0.5 text-pink-700 w-2 h-2" />
          )}
        </a>
        <a href="/submit" class={BUTTON_STYLES}>Submit</a>

        <label
          tabIndex={0}
          class={`cursor-pointer`}
          for="menuToggle"
        >
          三
        </label>
      </nav>
    </header>
  );
}
