import type { State } from "@/plugins/session.ts";
import Head from "@/components/Head.tsx";
import ProductLayout from "@/islands/ProductLayout.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import {listProducts, Product} from "../utils/db.ts";


export const handler: Handlers<Product[], State> = {
    async GET(_req, _ctx) {
        const products = await listProducts();

        if (!products) {
            return new Response("404 - Ops! Hehehehe. Voce nao era para estar aqui.", { status: 404 });
        }

        return _ctx.render(products);
    },
};

export default function Home(props: PageProps<Product[], State>) {
    const isSignedIn = props.state.sessionUser !== undefined;
    const endpoint = "/api/produtos";

    return (
        <>
            <Head href={props.url.href}>
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
                    initialProducts={props.data}
                    type="carousel"
                />
            </main>
        </>
    )}
