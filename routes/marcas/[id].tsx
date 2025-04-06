// routes/marcas/[id].tsx

import { Handlers, PageProps } from "$fresh/server.ts";
import { BrandHeader } from "@/components/BrandHeader.tsx";
import ProductLayout from "@/islands/ProductLayout.tsx";
import { defineRoute } from "$fresh/server.ts";


export const handler: Handlers = {
    async GET(req, ctx) {
        const { id } = ctx.params;
        return ctx.render({ brandId: id });
    },
};

interface BrandPageProps {
    brandId: string;
}

export default defineRoute<BrandPageProps>((_req, ctx) => {
    const { brandId } = ctx.params;

    return (
        <main className="p-4 space-y-8">
            <BrandHeader brandId={brandId}/>

            <h2 className="text-xl font-semibold">
                Products for brand {brandId}
            </h2>

        </main>
    );
})
