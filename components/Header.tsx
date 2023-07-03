// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  BUTTON_STYLES,
  LINK_STYLES,
  NAV_STYLES,
  SITE_BAR_STYLES,
} from "@/utils/constants.ts";
import Logo from "./Logo.tsx";
import { stripe } from "@/utils/payments.ts";

export default function Header(props: { sessionId?: string }) {
  return (
    <header class={SITE_BAR_STYLES}>
      <a href="/">
        <Logo height="48" />
      </a>
      <nav class={NAV_STYLES}>
        {stripe ? <a href="/pricing" class={LINK_STYLES}>Pricing</a> : null}
        {props.sessionId
          ? <a href="/account" class={LINK_STYLES}>Account</a>
          : <a href="/signin" class={LINK_STYLES}>Sign in</a>}
        <a href="Submit" class={BUTTON_STYLES}>Submit</a>
      </nav>
    </header>
  );
}
