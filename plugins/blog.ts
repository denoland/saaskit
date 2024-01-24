// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import type { Plugin } from "$fresh/server.ts";
import BlogIndex from "./routes/blog/index.tsx";
import BlogSlug from "./routes/blog/[slug].tsx";

export function blog() {
  const currentUrl = new URL(import.meta.url);
  currentUrl.pathname = currentUrl.pathname.split("/").slice(0, -2).join("/") +
    "/";
  return {
    name: "blog",
    routes: [{
      path: "/blog",
      component: BlogIndex,
    }, {
      path: "/blog/[slug]",
      component: BlogSlug,
    }],
    location: import.meta.url,
    projectLocation: currentUrl.href,
  } satisfies Plugin;
}
