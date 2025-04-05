import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
    async GET() {
        const kv = await Deno.openKv(
            Deno.env.get("DENO_DEPLOYMENT_ID") ? undefined : "./dev-kv.sqlite3",
        );

        for await (const entry of kv.list({ prefix: ["users"] })) {
            await kv.delete(entry.key);
        }
        for await (const entry of kv.list({ prefix: ["users_by_session"] })) {
            await kv.delete(entry.key);
        }
        for await (const entry of kv.list({ prefix: ["users_by_stripe_customer"] })) {
            await kv.delete(entry.key);
        }

        for await (const entry of kv.list({ prefix: ["products"] })) {
            await kv.delete(entry.key);
        }

        for await (const entry of kv.list({ prefix: ["brands"] })) {
            await kv.delete(entry.key);
        }

        return new Response(
            JSON.stringify({ status: "✅ Usuarios + produtos + marcas wiped from KV" }, null, 2),
            { headers: { "Content-Type": "application/json" } }
        );

    },
};
