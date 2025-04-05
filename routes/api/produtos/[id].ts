// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import type { Handlers } from "$fresh/server.ts";
import { getProduct } from "@/utils/db.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    const product = await getProduct(ctx.params.id);
    if (product === null) throw new Deno.errors.NotFound("Product not found");
    return Response.json(product);
  },
};
