// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers } from "$fresh/server.ts";
import { errors } from "std/http/http_errors.ts";
import { getCursor } from "@/utils/http.ts";
import {
  collectValues,
  createComment,
  createNotification,
  getItem,
  listCommentsByItem,
  newCommentProps,
} from "@/utils/db.ts";
import { redirect } from "@/utils/http.ts";
import { assertSignedIn, State } from "@/middleware/session.ts";
import { monotonicUlid } from "std/ulid/mod.ts";

export const handler: Handlers<undefined, State> = {
  async GET(req, ctx) {
    const itemId = ctx.params.id;
    const item = await getItem(itemId);
    if (item === null) throw new errors.NotFound("Item not found");

    const url = new URL(req.url);
    const iter = listCommentsByItem(itemId, {
      cursor: getCursor(url),
      limit: 10,
      // Newest to oldest
      reverse: true,
    });
    const values = await collectValues(iter);
    return Response.json({ values, cursor: iter.cursor });
  },
  async POST(req, ctx) {
    assertSignedIn(ctx);

    const form = await req.formData();
    const text = form.get("text");

    if (typeof text !== "string") {
      throw new errors.BadRequest("Text must be a string");
    }

    const itemId = ctx.params.id;
    const item = await getItem(itemId);
    if (item === null) throw new errors.NotFound("Item not found");

    const { sessionUser } = ctx.state;
    await createComment({
      userLogin: sessionUser.login,
      itemId: itemId,
      text,
      ...newCommentProps(),
    });

    if (item.userLogin !== sessionUser.login) {
      await createNotification({
        id: monotonicUlid(),
        userLogin: item.userLogin,
        type: "comment",
        text: `${sessionUser.login} commented on your post: ${item.title}`,
        originUrl: `/items/${itemId}`,
      });
    }

    return redirect("/items/" + itemId);
  },
};
