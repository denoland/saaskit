// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers } from "$fresh/server.ts";
import { collectValues, listUsers } from "@/utils/db.ts";
import { getCursor } from "@/utils/pagination.ts";

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const iter = listUsers({
      cursor: getCursor(url),
      limit: 10,
    });
    const users = await collectValues(iter);
    return Response.json({ users, cursor: iter.cursor });
  },
};
