import type { State } from "@/plugins/session.ts";
import Head from "@/components/Head.tsx";
import BrandLayout from "@/islands/BrandLayout.tsx";
import { defineRoute } from "$fresh/server.ts";

export default defineRoute<State>((_req, ctx) => {
    const isSignedIn = ctx.state.sessionUser !== undefined;
    const endpoint = "/api/brands";

    return (
        <>
            <Head href={ctx.url.href}>
                <link
                    as="fetch"
                    crossOrigin="anonymous"
                    href={endpoint}
                    rel="preload"
                />
            </Head>
            <main>
                <h1 class="text-2xl font-bold mb-4">All Brands</h1>
                <BrandLayout
                    endpoint={endpoint}
                    layout="carousel"
                />
            </main>
        </>
    );
});
