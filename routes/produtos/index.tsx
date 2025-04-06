// Copyright ...
import type { State } from "@/plugins/session.ts";
import Head from "@/components/Head.tsx";
import ProductLayout from "@/islands/ProductLayout.tsx";
import { defineRoute, Handlers, PageProps } from "$fresh/server.ts";
import {listProducts, Product} from "../../utils/db.ts";


export const handler: Handlers<Product[], State> = {
    async GET(_req, _ctx) {
        const products = await listProducts();

        if (!products) {
            return new Response("404 - Ops! Hehehehe. Voce nao era para estar aqui.", { status: 404 });
        }

        return _ctx.render(products);
    },
};

export default function ProdutosPage(props: PageProps<Product[], State>) {
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
            <main className="p-4 space-y-8">
                <h1 className="text-2xl font-bold">All Products</h1>
                <ProductLayout
                    endpoint="/products" // <-- explicitly passing endpoint
                    type="grid"
                    initialProducts={props.data}
                />
            </main>
        </>
    )}

