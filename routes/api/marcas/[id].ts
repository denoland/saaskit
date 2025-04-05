// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import type { Handlers } from "$fresh/server.ts";
import { getBrand } from "@/utils/db.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    const brand = await getBrand(ctx.params.id);
    if (brand === null) throw new Deno.errors.NotFound("Product not found");
    return Response.json(brand);
  },
};
