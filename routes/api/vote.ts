// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import { HttpError } from "fresh";
import { STATUS_CODE } from "@std/http/status";
import type { SignedInState } from "@/middlewares/session.ts";
import { createVote } from "@/utils/db.ts";
import { define } from "@/utils/define.ts";

export const handler = define.handlers<unknown, SignedInState>({
  async POST(ctx) {
    const req = ctx.req;
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
});
