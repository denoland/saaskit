// routes/produtos/[id].tsx

import { Handlers, PageProps } from "$fresh/server.ts";
import SingleProduct from "@/components/SingleProduct.tsx";
import type { State } from "../../plugins/session.ts";

export const handler: Handlers<ProductPageProps, State> = {
    async GET(_req, ctx) {
        const { id } = ctx.params;
        return ctx.render({ id }); // sets props.data.id
    },
};

interface ProductPageProps {
    id: string;
}

export default function ProductPage(props: PageProps<ProductPageProps, State>) {
    const isSignedIn = props.state.sessionUser !== undefined;

    return (
        <main class="p-4">
            <SingleProduct productId={props.data.id} isSignedIn={isSignedIn} />
        </main>
    );
}