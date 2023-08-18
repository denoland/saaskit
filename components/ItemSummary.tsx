// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Item } from "@/utils/db.ts";
import UserPostedAt from "./UserPostedAt.tsx";

export default function ItemSummary(props: Item) {
  return (
    <div class="py-2 space-y-1">
      <p>
        <a
          class="visited:(text-[purple] dark:text-[lightpink]) hover:underline mr-4"
          href={`/items/${props.id}`}
        >
          {props.title}
        </a>
        <a
          class="hover:underline text-gray-500"
          href={props.url}
          target="_blank"
        >
          {new URL(props.url).host} ↗
        </a>
      </p>
      <UserPostedAt
        userLogin={props.userLogin}
        createdAt={props.createdAt}
      />
    </div>
  );
}
