import type { Handlers } from "$fresh/server.ts";
import { collectValues, getItem, listCommentsByItem } from "@/utils/db.ts";
import { getCursor } from "@/utils/pagination.ts";
import { errors } from "std/http/http_errors.ts";

// Copyright 2023 the Deno authors. All rights reserved. MIT license.
export const handler: Handlers = {
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
    const comments = await collectValues(iter);
    return Response.json({ comments, cursor: iter.cursor });
  },
};
