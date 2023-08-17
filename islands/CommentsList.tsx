// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import { Comment } from "@/utils/db.ts";
import CommentSummary from "@/components/CommentSummary.tsx";

async function fetchComments(itemId: string, cursor: string) {
  let url = `/api/items/${itemId}/comments`;
  if (cursor !== "") url += "?cursor=" + cursor;

  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Request failed: GET ${url}`);
  return await resp.json() as { comments: Comment[]; cursor: string };
}

export default function CommentsList(props: { itemId: string }) {
  const commentsSig = useSignal<Comment[]>([]);
  const cursorSig = useSignal("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        fetchComments(props.itemId, cursorSig.value)
          .then(({ comments, cursor }) => {
            if (cursor === "") observer.unobserve(entry.target);
            commentsSig.value = [...commentsSig.value, ...comments];
            cursorSig.value = cursor;
          });
      }
    });

    observer.observe(bottomRef.current!);
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      {commentsSig.value.map((comment) => (
        <CommentSummary key={comment.id} {...comment} />
      ))}
      <div ref={bottomRef}></div>
    </div>
  );
}
