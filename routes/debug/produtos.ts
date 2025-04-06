import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
    async GET() {
        const kv = await Deno.openKv(
            Deno.env.get("DENO_DEPLOYMENT_ID") ? undefined : "./dev-kv.sqlite3",
        );

        const products = [];
        for await (const entry of kv.list({ prefix: ["products"] })) {
            products.push(entry);
        }

        return new Response(JSON.stringify(products, null, 2), {
            headers: { "Content-Type": "application/json" },
        });
    },
};
