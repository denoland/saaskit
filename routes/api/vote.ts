// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import type { State } from "@/routes/_middleware.ts";
import { createVote, deleteVote } from "@/utils/db.ts";

async function sharedHandler(
  req: Request,
  ctx: HandlerContext<PageProps<undefined>, State>,
) {
  if (!ctx.state.session) {
    return new Response(null, { status: 401 });
  }

  const itemId = new URL(req.url).searchParams.get("item_id");

  if (!itemId) {
    return new Response(null, { status: 400 });
  }

  const userId = ctx.state.session.user.id;
  const vote = { userId, itemId };
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

  const bc = new BroadcastChannel("/");
  bc.postMessage("" + Date.now());

  return new Response(null, { status });
}

export const handler: Handlers<PageProps, State> = {
  POST: sharedHandler,
  DELETE: sharedHandler,
};
