// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import type { Plugin } from "$fresh/server.ts";
import BlogIndex from "./routes/blog/index.tsx";
import BlogSlug from "./routes/blog/[slug].tsx";
import Feed from "./routes/feed.ts";
import { toFileUrl } from "std/path/to_file_url.ts";

export function blog() {
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
    projectLocation: toFileUrl(Deno.cwd()).href,
  } satisfies Plugin;
}
