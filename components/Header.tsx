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
import { getLinkStyles } from "@/utils/display.ts";

export default function Header(
  props: { sessionId?: string; hasNotifications: boolean; url: URL },
) {
  return (
    <header class={SITE_BAR_STYLES}>
      <a href="/">
        <Logo height="48" />
      </a>
      <nav class={NAV_STYLES}>
        {stripe
          ? (
            <a
              href="/pricing"
              class={getLinkStyles(props.url.pathname === "/pricing")}
            >
              Pricing
            </a>
          )
          : null}
        {props.sessionId
          ? (
            <a
              href="/account"
              class={getLinkStyles(props.url.pathname === "/account")}
            >
              Account
            </a>
          )
          : <a href="/signin" class={LINK_STYLES}>Sign in</a>}
        <a
          href="/account/notifications"
          class={getLinkStyles(
            props.url.pathname === "/account/notifications",
          ) + " relative"}
          aria-label="Notifications"
        >
          <Bell class="w-6 h-6" />
          {props.hasNotifications && (
            <CircleFilled class="absolute top-0.5 right-0.5 text-pink-700 w-2 h-2" />
          )}
        </a>
        <a href="/submit" class={BUTTON_STYLES}>Submit</a>
      </nav>
    </header>
  );
}
