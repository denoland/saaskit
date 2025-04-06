// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.

import { listBrands } from "@/utils/db.ts";
import type { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async GET(_req) {
    const values = await listBrands();
    return Response.json({ values });
  },
};
