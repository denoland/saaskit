// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import type { Handlers } from "fresh";
import { getUser } from "@/utils/db.ts";

export const handler: Handlers = {
  async GET(ctx) {
    const user = await getUser(ctx.params.login);
    if (user === null) throw new Deno.errors.NotFound("User not found");
    return Response.json(user);
  },
};
