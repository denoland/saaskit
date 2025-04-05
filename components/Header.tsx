// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import {SITE_NAME} from "@/utils/constants.ts";
import {isStripeEnabled} from "@/utils/stripe.ts";
import IconX from "tabler_icons_tsx/x.tsx";
import IconMenu from "tabler_icons_tsx/menu-2.tsx";
import {User} from "@/utils/db.ts";

export interface HeaderProps {
  /** Currently signed-in user */
  sessionUser?: User;
  /**
   * URL of the current page. This is used for highlighting the currently
   * active page in navigation.
   */
  url: URL;
}

export default function Header(props: HeaderProps) {
  return (
    <header class="border-2 border-solid m-8 site-bar-styles flex flex-col items-center sm:flex-row sm:justify-between">
      <input
        type="checkbox"
        id="nav-toggle"
        class="hidden peer"
      />

      <div class="flex justify-between items-center peer-checked:[&_>div>label>#IconMenu]:hidden peer-checked:[&_>div>label>#IconX]:block">
        <a href="/" class="shrink-0">
          <img
            height="48"
            width="48"
            src="/logo.webp"
            alt={SITE_NAME + " logo"}
            class="size-12"
          />
        </a>
        <div class="flex gap-4 items-center">
          <label
            tabIndex={0}
            class="sm:hidden"
            id="nav-toggle-label"
            htmlFor="nav-toggle"
          >
            <IconMenu class="size-6" id="IconMenu" />
            <IconX class="hidden size-6" id="IconX" />
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
      <nav className="hidden w-full flex-col items-center gap-y-2 divide-y divide-solid sm:flex sm:flex-row sm:justify-center sm:divide-y-0 sm:gap-x-4 peer-checked:flex">
        <div className="">
          <a
            href="/dashboard"
            class="text-center text-white rounded-[7px] transition duration-300 px-4 py-2 block hover:bg-white hover:text-black hover:dark:bg-gray-900 hover:dark:!text-white"
          >
            Dashboard
          </a>
        </div>
        {isStripeEnabled() &&
          (
            <div className="">
              <a
                href="/pricing"
                class="text-center text-white rounded-[7px] transition duration-300 px-4 py-2 block hover:bg-white hover:text-black hover:dark:bg-gray-900 hover:dark:!text-white"
              >
                Marcas
              </a>
            </div>
          )}
        {props.sessionUser
          ? (
            <div className="">
              <a
                href="/account"
                class="text-center text-white rounded-[7px] transition duration-300 px-4 py-2 block hover:bg-white hover:text-black hover:dark:bg-gray-900 hover:dark:!text-white"
              >
                Produtos
              </a>
            </div>
          )
          : (
            <a href="/signin" class="link-styles nav-item">
              Entrar
            </a>
          )}
        <div className="">
          <a
            href="/submit"
            class="text-center text-white rounded-[7px] transition duration-300 px-4 py-2 block hover:bg-white hover:text-black hover:dark:bg-gray-900 hover:dark:!text-white"
          >
            Marcas
          </a>
        </div>
      </nav>
    </header>
  );
}
