// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import type { State } from "@/routes/_middleware.ts";
import { createVote, deleteVote, getItemById } from "@/utils/db.ts";
import { getUserBySessionId } from "@/utils/db.ts";

async function sharedHandler(
  req: Request,
  ctx: HandlerContext<PageProps<undefined>, State>,
) {
  if (!ctx.state.sessionId) {
    return new Response(null, { status: 401 });
  }

  const itemId = new URL(req.url).searchParams.get("item_id");

  if (!itemId) {
    return new Response(null, { status: 400 });
  }

  const [item, user] = await Promise.all([
    getItemById(itemId),
    getUserBySessionId(ctx.state.sessionId),
  ]);

  if (item === null || user === null) {
    return new Response(null, { status: 404 });
  }

  const vote = { item, user };
  let status;
  switch (req.method) {
    case "DELETE":
      status = 204;
      await deleteVote(vote);
      break;
    case "POST":
      status = 201;
      await createVote(vote);
      break;
    default:
      return new Response(null, { status: 400 });
  }

  return new Response(null, { status });
}

export const handler: Handlers<PageProps, State> = {
  POST: sharedHandler,
  DELETE: sharedHandler,
};
