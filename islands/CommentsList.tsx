// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { useSignal } from "@preact/signals";
import { useCallback, useEffect, useRef } from "preact/hooks";
import { Ref } from "preact";
import { Comment } from "@/utils/db.ts";
import UserPostedAt from "@/components/UserPostedAt.tsx";

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
  const observer = useRef<IntersectionObserver>();
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (!cursorSig.value) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(async ([entry]) => {
      if (entry.isIntersecting) {
        const { comments, cursor } = await fetchComments(
          props.itemId,
          cursorSig.value,
        );

        if (cursor === "") observer.current?.unobserve(entry.target);

        commentsSig.value = [...commentsSig.value, ...comments];
        cursorSig.value = cursor;
      }
    });

    if (node) observer.current.observe(node);
  }, [cursorSig.value]);

  useEffect(() => {
    fetchComments(props.itemId, cursorSig.value).then(
      ({ comments, cursor }) => {
        commentsSig.value = comments;
        cursorSig.value = cursor;
      },
    );
  }, []);

  return (
    <div>
      {commentsSig.value.map((comment) => {
        const isLast =
          comment.id === commentsSig.value[commentsSig.value.length - 1].id;
        const props = {
          class: "py-4",
          key: comment.id,
          ref: isLast ? lastElementRef as Ref<HTMLDivElement> : null,
        };

        return (
          <div {...props}>
            <UserPostedAt {...comment} />
            <p>{comment.text}</p>
          </div>
        );
      })}
    </div>
  );
}
