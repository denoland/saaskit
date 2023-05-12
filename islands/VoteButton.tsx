// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Item } from "@/utils/db.ts";
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";

export interface VoteButtonProps {
  item: Item;
  isVoted: boolean;
}

export default function VoteButton(props: VoteButtonProps) {
  const isVoted = useSignal(props.isVoted);
  const score = useSignal(props.item.score);

  async function onClick() {
    const url = `/api/vote?item_id=${props.item.id}`;
    const method = isVoted.value ? "DELETE" : "POST";
    const response = await fetch(url, { method, credentials: "same-origin" });

    if (response.status === 401) {
      window.location.href = "/login";
      return;
    }
    isVoted.value = !isVoted.value;
    method === "POST" ? score.value++ : score.value--;
  }

  useEffect(() => {
    let es = new EventSource(window.location.href);
    es.addEventListener("message", ({ data }) => {
      const { items } = JSON.parse(data);
      score.value = items.find((e: Item) => e.id === props.item.id)?.score;
    });

    es.addEventListener("error", async () => {
      es.close();
      const backoff = 10000 + Math.random() * 5000;
      await new Promise((resolve) => setTimeout(resolve, backoff));
      es = new EventSource(window.location.href);
    });
  }, []);

  return (
    <button
      class={isVoted.value ? "text-pink-700" : "text-inherit"}
      onClick={onClick}
      disabled={!IS_BROWSER}
    >
      <p>▲</p>
      <p>{score.value}</p>
    </button>
  );
}
