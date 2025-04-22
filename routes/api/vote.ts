// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import { type Handlers, HttpError } from "fresh";
import { STATUS_CODE } from "@std/http/status";
import type { SignedInState } from "@/plugins/session.ts";
import { createVote } from "@/utils/db.ts";

export const handler: Handlers<undefined, SignedInState> = {
  async POST(req, ctx) {
    const itemId = new URL(req.url).searchParams.get("item_id");
    if (itemId === null) {
      throw new HttpError(400, "`item_id` URL parameter missing");
    }

    await createVote({
      itemId,
      userLogin: ctx.state.sessionUser.login,
    });

    return new Response(null, { status: STATUS_CODE.Created });
  },
};
