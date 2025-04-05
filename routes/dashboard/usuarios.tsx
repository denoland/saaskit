// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import Head from "@/components/Head.tsx";
import TabsBar from "@/components/TabsBar.tsx";
import UsersTable from "@/islands/UsersTable.tsx";
import { defineRoute } from "$fresh/server.ts";
import { Partial } from "$fresh/runtime.ts";

export default defineRoute((_req, ctx) => {
  const endpoint = "/api/usuarios";

  return (
    <>
      <Head title="Usuarios" href={ctx.url.href}>
        <link
          as="fetch"
          crossOrigin="anonymous"
          href={endpoint}
          rel="preload"
        />
      </Head>
      <main class="flex-1 p-4 f-client-nav">
        <h1 class="heading-with-margin-styles">Dashboard</h1>
        <TabsBar
          links={[{
            path: "/dashboard/status",
            innerText: "Status",
          }, {
            path: "/dashboard/usuarios",
            innerText: "Usuarios",
          }]}
          currentPath={ctx.url.pathname}
        />
        <Partial name="usuarios">
          <UsersTable endpoint={endpoint} />
        </Partial>
      </main>
    </>
  );
});
