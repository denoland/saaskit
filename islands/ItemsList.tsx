// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import type { Item } from "@/utils/db.ts";
import { LINK_STYLES } from "@/utils/constants.ts";
import IconInfo from "tabler_icons_tsx/info-circle.tsx";
import ItemSummary from "@/components/ItemSummary.tsx";

async function fetchItems(endpoint: string, cursor: string) {
  let url = endpoint;
  if (cursor !== "") url += "?cursor=" + cursor;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Request failed: GET ${url}`);
  return await resp.json() as { items: Item[]; cursor: string };
}

async function fetchVotedItems() {
  const url = "/api/me/votes";
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Request failed: GET ${url}`);
  return await resp.json() as Item[];
}

function EmptyItemsList() {
  return (
    <>
      <div class="flex flex-col justify-center items-center gap-2">
        <div class="flex flex-col items-center gap-2 pt-16">
          <IconInfo class="w-10 h-10 text-gray-400 dark:text-gray-600" />
          <p class="text-center font-medium">No items found</p>
        </div>

        <a
          href="/submit"
          class="inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-primary hover:underline"
        >
          Submit your project
        </a>
      </div>
    </>
  );
}

export default function ItemsList(props: { endpoint: string }) {
  const itemsSig = useSignal<Item[]>([]);
  const votedItemsIdsSig = useSignal<string[]>([]);
  const itemsAreVotedSig = useSignal<boolean[]>([]);
  const cursorSig = useSignal("");
  const isLoadingSig = useSignal(false);

  function calcAreVotedItems() {
    itemsAreVotedSig.value = itemsSig.value
      .map((item) => votedItemsIdsSig.value.includes(item.id));
  }

  async function loadMoreItems() {
    isLoadingSig.value = true;
    try {
      const { items, cursor } = await fetchItems(
        props.endpoint,
        cursorSig.value,
      );
      itemsSig.value = [...itemsSig.value, ...items];
      cursorSig.value = cursor;
    } catch (error) {
      console.error(error.message);
    } finally {
      isLoadingSig.value = false;
    }
  }

  useEffect(() => {
    fetchVotedItems()
      .then((votedItems) =>
        votedItemsIdsSig.value = votedItems.map(({ id }) => id)
      )
      .then(() => loadMoreItems())
      .then(() => calcAreVotedItems());
  }, []);

  useEffect(() => {
    calcAreVotedItems();
  }, [cursorSig.value]);

  return (
    <div>
      {itemsSig.value.length
        ? itemsSig.value.map((item, id) => {
          return (
            <ItemSummary
              key={item.id}
              item={item}
              isVoted={itemsAreVotedSig.value[id]}
            />
          );
        })
        : <EmptyItemsList />}
      {cursorSig.value !== "" && !isLoadingSig.value && (
        <button onClick={loadMoreItems} class={LINK_STYLES}>
          Load more
        </button>
      )}
    </div>
  );
}
