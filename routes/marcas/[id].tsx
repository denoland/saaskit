// routes/marcas/[id].tsx

import { Handlers, PageProps } from "$fresh/server.ts";
import { BrandHeader } from "@/components/BrandHeader.tsx";
import {Brand, getBrand} from "../../utils/db.ts";
import type {State} from "../../plugins/session.ts";
import SingleBrand from "../../components/SingleBrand.tsx";

export const handler: Handlers<Brand | null, State> = {
    async GET(_req, ctx) {
        const id = ctx.params.id;
        const brand = await getBrand(id);

        if (!brand) {
            return new Response("404 - Ops! Hehehehe. Voce nao era para estar aqui.", { status: 404 });
        }

        return ctx.render(brand);
    },
};

export default function BrandPage(props: PageProps<Brand, State>) {
    const isSignedIn = props.state.sessionUser !== undefined;

    return (
        <main className="p-4 space-y-8">
            <BrandHeader brand={props.data}/>

            <main className="p-4">
                <SingleBrand
                    brand={props.data}
                    isSignedIn={isSignedIn}/>
            </main>
        </main>
    )}
