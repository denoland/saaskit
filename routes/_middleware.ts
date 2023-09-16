// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { setSessionState } from "@/middleware/session.ts";
import { hardenHeaders } from "@/middleware/headers.ts";

export const handler = [
  setSessionState,
  hardenHeaders,
];
