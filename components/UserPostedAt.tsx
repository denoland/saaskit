// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { User } from "@/utils/db.ts";
import { pluralize } from "@/utils/display.ts";

/** @todo Replace with https://deno.land/std@0.184.0/datetime/mod.ts?s=difference */
function timeAgo(time: number | Date) {
  const between = (Date.now() - Number(time)) / 1000;
  if (between < 3600) return pluralize(~~(between / 60), "minute");
  else if (between < 86400) return pluralize(~~(between / 3600), "hour");
  else return pluralize(~~(between / 86400), "day");
}

export default function UserPostedAt(
  props: { user: User; createdAt: Date },
) {
  return (
    <p class="text-gray-500">
      {props.user.login}{" "}
      {props.user.isSubscribed && (
        <span title="Deno Hunt premium user">🦕{" "}</span>
      )}
      {timeAgo(new Date(props.createdAt))} ago
    </p>
  );
}
