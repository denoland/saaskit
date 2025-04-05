import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
    async GET() {
        const kv = await Deno.openKv(
            Deno.env.get("DENO_DEPLOYMENT_ID") ? undefined : "./dev-kv.sqlite3",
        );

        const users = [];
        for await (const entry of kv.list({ prefix: ["users"] })) {
            users.push({
                key: entry.key,
                value: entry.value,
            });
        }

        return new Response(JSON.stringify(users, null, 2), {
            headers: { "Content-Type": "application/json" },
        });
    },
};
