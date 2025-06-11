// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import { define } from "@/utils/define.ts";

export const handler = define.handlers((ctx) =>
  ctx.redirect("/dashboard/stats")
);
