// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { Signal, useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { Comment } from "@/utils/db.ts";
import CommentSummary from "@/components/CommentSummary.tsx";

async function getComments(itemId: string, cursor: string) {
  let url = `/api/items/${itemId}/comments`;
  if (cursor !== "") url += "?cursor=" + cursor;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Request failed: GET ${url}`);
  return await resp.json() as { comments: Comment[]; cursor: string };
}

export default function CommentsList(props: { itemId: string }) {
  const commentsSig: Signal<Comment[]> = useSignal([]);
  const cursorSig = useSignal("");

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        getComments(props.itemId, cursorSig.value)
          .then(({ comments, cursor }) => {
            if (cursor === "") observer.unobserve(entry.target);
            commentsSig.value = [...commentsSig.value, ...comments];
            cursorSig.value = cursor;
          });
      }
    });

    observer.observe(document.querySelector("#bottom")!);
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      {commentsSig.value.map((comment) => <CommentSummary {...comment} />)}
      <div id="bottom"></div>
    </div>
  );
}
