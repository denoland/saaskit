// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { SITE_NAME } from "@/utils/constants.ts";

export default function Logo() {
  return (
    <img
      height="48"
      width="48"
      src="/logo.webp"
      alt={SITE_NAME + " logo"}
      class="h-12 w-12"
    />
  );
}
