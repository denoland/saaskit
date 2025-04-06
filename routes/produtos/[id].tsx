// routes/produtos/[id].tsx

import { Handlers, PageProps } from "$fresh/server.ts";
import SingleProduct from "@/components/SingleProduct.tsx";
import type { State } from "../../plugins/session.ts";
import {getProduct, Product} from "../../utils/db.ts";

export const handler: Handlers<Product | null, State> = {
    async GET(_req, ctx) {
        const id = ctx.params.id;
        const product = await getProduct(id); // kv.get(["products", id]) or similar

        if (!product) {
            return new Response("404 - Ops! Hehehehe. Voce nao era para estar aqui.", { status: 404 });
        }

        return ctx.render(product);
    },
};


export default function ProductPage(props: PageProps<Product, State>) {
    const isSignedIn = props.state.sessionUser !== undefined;

    return (
        <main class="p-4">
            <SingleProduct
                product={props.data}
                isSignedIn={isSignedIn}/>
        </main>
    );
}