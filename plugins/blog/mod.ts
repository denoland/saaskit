// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import type { Plugin } from "$fresh/server.ts";
import BlogIndex from "./routes/blog/index.tsx";
import BlogSlug from "./routes/blog/[slug].tsx";
import Feed from "./routes/feed.ts";
import { normalize } from "@std/url";

export function blog(): Plugin & { location: string; projectLocation: string } {
  return {
    name: "blog",
    routes: [{
      path: "/blog",
      component: BlogIndex,
    }, {
      path: "/blog/[slug]",
      component: BlogSlug,
    }, {
      path: "/feed",
      component: Feed,
    }],
    location: import.meta.url,
    projectLocation: normalize(import.meta.url + "../../../").href,
  };
}
