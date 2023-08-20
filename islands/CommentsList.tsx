// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { Comment } from "@/utils/db.ts";
import UserPostedAt from "@/components/UserPostedAt.tsx";
import { LINK_STYLES } from "@/utils/constants.ts";

async function fetchComments(itemId: string, cursor: string) {
  let url = `/api/items/${itemId}/comments`;
  if (cursor !== "" && cursor !== undefined) url += "?cursor=" + cursor;

  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Request failed: GET ${url}`);
  return await resp.json() as { newComments: Comment[]; newCursor: string };
}

function CommentSummary(props: Comment) {
  return (
    <div class="py-4">
      <UserPostedAt {...props} />
      <p>{props.text}</p>
    </div>
  );
}

export default function CommentsList(props: { itemId: string }) {
  const comments = useSignal<Comment[]>([]);
  const cursor = useSignal("");
  const isLoading = useSignal(false);

  function loadMoreComments() {
    isLoading.value = true;
    fetchComments(props.itemId, cursor.value)
      .then(({ newComments, newCursor }) => {
        comments.value = [...comments.value, ...newComments];
        cursor.value = newCursor;
        isLoading.value = false;
      });
  }

  useEffect(loadMoreComments, []);

  return (
    <div>
      {comments.value.map((comment) => (
        <CommentSummary key={comment.id} {...comment} />
      ))}
      {cursor.value !== "" && !isLoading.value && (
        <button onClick={loadMoreComments} class={LINK_STYLES}>
          Load more
        </button>
      )}
    </div>
  );
}
