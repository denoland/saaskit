// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  LINK_STYLES,
  NAV_STYLES,
  SITE_BAR_STYLES,
  SITE_NAME,
} from "@/utils/constants.ts";
import { Discord, GitHub } from "./Icons.tsx";

export default function Footer() {
  return (
    <footer
      class={`${SITE_BAR_STYLES} flex-col md:flex-row mt-8`}
    >
      <p>© {SITE_NAME}</p>
      <nav class={NAV_STYLES}>
        <a href="/stats" class={LINK_STYLES}>Stats</a>
        <a href="/blog" class={LINK_STYLES}>Blog</a>
        <a href="https://discord.gg/deno" target="_blank" class={LINK_STYLES}>
          <Discord alt="Deno SaaSKit on Discord" />
        </a>
        <a
          href="https://github.com/denoland/saaskit"
          target="_blank"
          class={LINK_STYLES}
        >
          <GitHub alt="GitHub icon" />
        </a>
        <a href="https://fresh.deno.dev">
          <img
            width="197"
            height="37"
            src="https://fresh.deno.dev/fresh-badge.svg"
            alt="Made with Fresh"
          />
        </a>
      </nav>
    </footer>
  );
}
