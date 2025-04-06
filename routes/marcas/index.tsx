import type { State } from "@/plugins/session.ts";
import Head from "@/components/Head.tsx";
import BrandLayout from "@/islands/BrandLayout.tsx";
import { Handlers, PageProps, defineRoute } from "$fresh/server.ts";
import {Brand, listBrands, Product, listProducts} from "../../utils/db.ts";

export const handler: Handlers<{ brands: Brand[]; products: Product[] }, State> = {
    async GET(_req, ctx) {
        const brands = await listBrands();
        const products = await listProducts();

        if (!brands) {
            return new Response("404 - Ops! Hehehehe. Você não era para estar aqui.", { status: 404 });
        }

        return ctx.render({ brands, products });
    },
};



export default function BrandPage(props: PageProps<{ brands: Brand[]; products: Product[] }, State>) {
    const isSignedIn = props.state.sessionUser !== undefined;
    const endpoint = "/api/marcas";


    return (
        <>
        <main class="p-4">
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
                <h1 className="text-2xl font-bold">Todos os Criadores</h1>
                <BrandLayout
                    endpoint="/brands" // <-- explicitly passing endpoint
                    type="grid"
                    initialBrands={props.data.brands}
                    initialProducts={props.data.products}
                />
            </main>
        </>
)};