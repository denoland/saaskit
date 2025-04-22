// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import Header from "@/components/Header.tsx";
import Footer from "@/components/Footer.tsx";
import type { State } from "@/plugins/session.ts";
import { PageProps } from "fresh";

export default (ctx: PageProps<undefined, State>) => {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/styles.css" />

        {/* HTML Meta Tags */}
        <title>{ctx.state.title}</title>
        <meta name="description" content={ctx.state.description} />

        {/* Google / Search Engine Tags */}
        <meta itemProp="name" content={ctx.state.title} />
        <meta itemProp="description" content={ctx.state.description} />
        {ctx.state.imageUrl && (
          <meta itemProp="image" content={ctx.state.imageUrl} />
        )}

        {/* Facebook Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={ctx.state.title} />
        <meta property="og:locale" content="en" />
        <meta property="og:title" content={ctx.state.title} />
        <meta property="og:description" content={ctx.state.description} />
        <meta property="og:url" content={ctx.url.href} />
        <meta property="og:image" content={ctx.state.imageUrl} />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ctx.state.title} />
        <meta name="twitter:description" content={ctx.state.description} />
        <meta name="twitter:image" content={ctx.state.imageUrl} />

        {/* Homepage reload links */}
        {ctx.url.pathname === "/" && (
          <link
            as="fetch"
            crossOrigin="anonymous"
            href="/api/items"
            rel="preload"
          />
        )}
        {ctx.url.pathname === "/" && ctx.state.sessionUser && (
          <link
            as="fetch"
            crossOrigin="anonymous"
            href="/api/me/votes"
            rel="preload"
          />
        )}
      </head>
      <body>
        <div class="dark:bg-gray-900">
          <div class="flex flex-col min-h-screen mx-auto max-w-7xl w-full dark:text-white">
            <Header
              url={ctx.url}
              sessionUser={ctx.state?.sessionUser}
            />
            <ctx.Component />
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
};
