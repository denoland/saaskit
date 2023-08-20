// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import { Comment } from "@/utils/db.ts";
import UserPostedAt from "@/components/UserPostedAt.tsx";

async function fetchComments(itemId: string, cursor: string) {
  let url = `/api/items/${itemId}/comments`;
  if (cursor !== "") url += "?cursor=" + cursor;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Request failed: GET ${url}`);
  return await resp.json() as { comments: Comment[]; cursor: string };
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
  const commentsSig = useSignal<Comment[]>([]);
  const cursorSig = useSignal<string>("");
  const observer = useRef<IntersectionObserver>();
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadMoreComments() {
    if (cursorSig.value === "") return;

    const { comments, cursor } = await fetchComments(
      props.itemId,
      cursorSig.value,
    );

    if (cursor === "") observer.current?.disconnect();

    commentsSig.value = [...commentsSig.value, ...comments];
    cursorSig.value = cursor;
  }

  useEffect(() => {
    fetchComments(props.itemId, cursorSig.value)
      .then(({ comments, cursor }) => {
        commentsSig.value = comments;
        cursorSig.value = cursor;
      });
  }, []);

  useEffect(() => {
    if (!observer.current) {
      observer.current = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          loadMoreComments();
        }
      });
    }

    if (cursorSig.value) {
      observer.current.observe(bottomRef.current!);
    }

    return () => {
      observer.current?.disconnect();
    };
  }, [cursorSig.value]);

  return (
    <div>
      {commentsSig.value.map((comment) => (
        <CommentSummary key={comment.id} {...comment} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
