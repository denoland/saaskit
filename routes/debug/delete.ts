import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
    async GET() {
        const kv = await Deno.openKv(
            Deno.env.get("DENO_DEPLOYMENT_ID") ? undefined : "./dev-kv.sqlite3",
        );

        let deleted = 0;

        for await (const entry of kv.list({ prefix: [] })) {
            await kv.delete(entry.key);
            deleted++;
        }

        return new Response(
            JSON.stringify({
                status: `✅ All ${deleted} KV entries wiped clean.`,
            }, null, 2),
            { headers: { "Content-Type": "application/json" } },
        );
    },
};
