// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { redirect } from "@/utils/http.ts";
import { defineRoute } from "$fresh/src/server/defines.ts";

export default defineRoute(() => {
  return redirect("/dashboard/stats");
});
