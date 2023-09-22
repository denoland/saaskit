// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { type Handlers, Status } from "$fresh/server.ts";
import { assertSignedIn, type State } from "@/plugins/session.ts";
import { createVote, deleteVote, getItem } from "@/utils/db.ts";
import { createHttpError } from "std/http/http_errors.ts";

export const handler: Handlers<undefined, State> = {
  async POST(_req, ctx) {
    assertSignedIn(ctx);

    const itemId = ctx.params.id;
    const item = await getItem(itemId);
    if (item === null) throw createHttpError(Status.NotFound, "Item not found");

    const { sessionUser } = ctx.state;
    await createVote({
      itemId,
      userLogin: sessionUser.login,
    });

    return new Response(null, { status: Status.Created });
  },
  async DELETE(_req, ctx) {
    assertSignedIn(ctx);

    const itemId = ctx.params.id;
    const item = await getItem(itemId);
    if (item === null) throw createHttpError(Status.NotFound, "Item not found");

    await deleteVote({ itemId, userLogin: ctx.state.sessionUser.login });

    return new Response(null, { status: Status.NoContent });
  },
};
