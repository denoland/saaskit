// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  ACTIVE_LINK_STYLES,
  LINK_STYLES,
  SITE_BAR_STYLES,
  SITE_NAME,
} from "@/utils/constants.ts";
import { stripe } from "@/utils/payments.ts";
import { Bars, Bell, CircleFilled, Cross } from "./Icons.tsx";
import { cx } from "@twind/core";
import type { JSX } from "preact";

interface MenuItemProps {
  name: string | JSX.Element;
  href: string;
  active?: boolean;
  class?: string;
  ariaLabel?: string;
}

function MenuItem(props: MenuItemProps) {
  return (
    <a
      href={props.href}
      class={cx(
        props.active ? ACTIVE_LINK_STYLES : LINK_STYLES,
        "relative text-gray-500 px-3 py-4 sm:py-2",
        props.class,
      )}
      aria-label={props.ariaLabel}
    >
      {props.name}
    </a>
  );
}

export default function Header(
  props: { sessionId?: string; hasNotifications: boolean; url: URL },
) {
  const menuItems: (MenuItemProps | undefined)[] = [
    stripe && { name: "Pricing", href: "/pricing" },
    props.sessionId
      ? { name: "Account", href: "/account" }
      : { name: "Sign in", href: "/signin" },
    {
      name: (
        <>
          <div class="relative">
            <Bell class="hidden sm:block w-6 h-6" />
            <span class="sm:hidden">
              Notifications
            </span>
            {props.hasNotifications && (
              <CircleFilled class="absolute -top-0.5 -right-0.5 text-primary w-2 h-2" />
            )}
          </div>
        </>
      ),
      href: "/account/notifications",
      ariaLabel: "Notifications",
    },
    { name: "Submit a project", href: "/submit", class: "sm:hidden" },
  ];

  return (
    <header
      class={cx(
        SITE_BAR_STYLES,
        "flex-col sm:flex-row",
      )}
    >
      <input
        type="checkbox"
        id="nav-toggle"
        class="hidden [:checked&+*>:last-child>*>:first-child]:hidden [:checked&+*>:last-child>*>:last-child]:block checked:siblings:last-child:flex"
      />

      <div class="flex justify-between items-center">
        <a href="/" class="shrink-0">
          <img
            height="48"
            width="48"
            src="/logo.webp"
            alt={SITE_NAME + " logo"}
            class="h-12 w-12"
          />
        </a>
        <div class="flex gap-4 items-center">
          <label
            tabIndex={0}
            class="sm:hidden"
            id="nav-toggle-label"
            htmlFor="nav-toggle"
          >
            <Bars class="w-6 h-6" />
            <Cross class="hidden w-6 h-6" />
          </label>
        </div>
      </div>
      <script>
        {`
          const navToggleLabel = document.getElementById('nav-toggle-label');
          navToggleLabel.addEventListener('keydown', () => {
            if (event.code === 'Space' || event.code === 'Enter') {
              navToggleLabel.click();
              event.preventDefault();
            }
          });
        `}
      </script>
      <nav
        class="hidden flex-col gap-x-4 divide-y divide-solid sm:(flex items-center flex-row divide-y-0)"
      >
        {menuItems.map((item) => (
          item &&
          (
            <MenuItem
              name={item.name}
              href={item.href}
              active={item.href === props.url.pathname}
              class={item.class}
              ariaLabel={item.ariaLabel}
            />
          )
        ))}

        <div class="hidden sm:block rounded-lg bg-gradient-to-tr from-secondary to-primary p-px">
          <a
            href="/submit"
            class="text-white rounded-[7px] transition duration-300 px-4 py-2 block hover:(bg-white text-black dark:(bg-gray-900 !text-white))"
          >
            Submit
          </a>
        </div>
      </nav>
    </header>
  );
}
