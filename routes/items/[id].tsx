// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { RouteContext } from "$fresh/server.ts";
import ItemSummary from "@/components/ItemSummary.tsx";
import { BUTTON_STYLES, INPUT_STYLES } from "@/utils/constants.ts";
import { getAreVotedByUser, getItem } from "@/utils/db.ts";
import Head from "@/components/Head.tsx";
import type { State } from "@/middleware/session.ts";
import CommentsList from "@/islands/CommentsList.tsx";

function CommentInput(props: { isLoggedIn: boolean; itemId: string }) {
  return (
    <form method="post" action="/api/comments">
      <input type="hidden" name="item_id" value={props.itemId} />
      <textarea
        class={`${INPUT_STYLES} w-full`}
        disabled={!props.isLoggedIn}
        type="text"
        name="text"
        required
      />
      <button class={BUTTON_STYLES} disabled={!props.isLoggedIn} type="submit">
        {props.isLoggedIn ? "Comment" : "Sign in to comment"}
      </button>
    </form>
  );
}

export default async function ItemsItemPage(
  _req: Request,
  ctx: RouteContext<undefined, State>,
) {
  const itemId = ctx.params.id;
  const item = await getItem(itemId);
  if (item === null) return await ctx.renderNotFound();

  const isLoggedIn = ctx.state.sessionUser !== undefined;
  let isVoted = false;

  if (isLoggedIn) {
    const areVoted = await getAreVotedByUser(
      [item],
      ctx.state.sessionUser!.login,
    );
    isVoted = areVoted[0];
  }

  return (
    <>
      <Head title={item.title} href={ctx.url.href} />
      <main class="flex-1 p-4 space-y-8">
        <ItemSummary
          item={item}
          isVoted={isVoted}
        />
        <CommentInput isLoggedIn={isLoggedIn} itemId={ctx.params.id} />
        <CommentsList itemId={ctx.params.id} />
      </main>
    </>
  );
}
