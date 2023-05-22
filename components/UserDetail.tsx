// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { User } from "@/utils/db.ts";

export default function UserDetail(props: User) {
  return (
    <>
      <img
        src={props.avatarUrl}
        alt={props.login}
        class="h-6 w-auto rounded-full aspect-square inline-block mr-1 align-bottom"
      />
      {props.login}{" "}
      {props.isSubscribed && <span title="Deno Hunt premium user">🦕{" "}
      </span>}
    </>
  );
}
