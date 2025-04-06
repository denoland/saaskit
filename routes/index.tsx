// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import type { State } from "@/plugins/session.ts";
import Head from "@/components/Head.tsx";
import ProductLayout from "../islands/ProductLayout.tsx";
import { defineRoute } from "$fresh/server.ts";

export default defineRoute<State>((_req, ctx) => {
  const isSignedIn = ctx.state.sessionUser !== undefined;
  const endpoint = "/api/produtos";

  return (
    <>
      <Head href={ctx.url.href}>
        <link
          as="fetch"
          crossOrigin="anonymous"
          href={endpoint}
          rel="preload"
        />
        {isSignedIn && (
          <link
            as="fetch"
            crossOrigin="anonymous"
            href="/api/me/votes"
            rel="preload"
          />
        )}
      </Head>
      <main class="">
        <ProductLayout
          endpoint={endpoint}
          isSignedIn={isSignedIn}
          layout="carousel"
        />
      </main>
    </>
  );
});
