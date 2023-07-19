// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { RouteContext } from "$fresh/server.ts";
import { calcLastPage, calcPageNum, PAGE_LENGTH } from "@/utils/pagination.ts";
import type { State } from "./_middleware.ts";
import ItemSummary from "@/components/ItemSummary.tsx";
import PageSelector from "@/components/PageSelector.tsx";
import {
  compareScore,
  getAllItems,
  getAreVotedBySessionId,
  getItemsSince,
  getManyUsers,
  type Item,
} from "@/utils/db.ts";
import { DAY, WEEK } from "std/datetime/constants.ts";
import { getToggledStyles } from "@/utils/display.ts";
import { ACTIVE_LINK_STYLES, LINK_STYLES } from "@/utils/constants.ts";
import Head from "@/components/Head.tsx";

function calcTimeAgoFilter(url: URL) {
  return url.searchParams.get("time-ago");
}

function TimeSelector(props: { url: URL }) {
  const timeAgo = props.url.searchParams.get("time-ago");
  return (
    <div class="flex justify-center my-4 gap-8">
      {/* These links do not preserve current URL queries. E.g. if ?page=2, that'll be removed once one of these links is clicked */}
      <a
        class={getToggledStyles(
          LINK_STYLES,
          ACTIVE_LINK_STYLES,
          timeAgo === null || timeAgo === "week",
        )}
        href="/?time-ago=week"
      >
        Last Week
      </a>
      <a
        class={getToggledStyles(
          LINK_STYLES,
          ACTIVE_LINK_STYLES,
          timeAgo === "month",
        )}
        href="/?time-ago=month"
      >
        Last Month
      </a>
      <a
        class={getToggledStyles(
          LINK_STYLES,
          ACTIVE_LINK_STYLES,
          timeAgo === "all",
        )}
        href="/?time-ago=all"
      >
        All time
      </a>
    </div>
  );
}

export default async function HomePage(
  _req: Request,
  ctx: RouteContext<unknown, State>,
) {
  const pageNum = calcPageNum(ctx.url);
  const timeAgo = calcTimeAgoFilter(ctx.url);
  let allItems: Item[];
  if (timeAgo === "week" || timeAgo === null) {
    allItems = await getItemsSince(WEEK);
  } else if (timeAgo === "month") {
    allItems = await getItemsSince(30 * DAY);
  } else {
    allItems = await getAllItems();
  }

  const items = allItems
    .toSorted(compareScore)
    .slice((pageNum - 1) * PAGE_LENGTH, pageNum * PAGE_LENGTH);

  const itemsUsers = await getManyUsers(items.map((item) => item.userId));

  const areVoted = await getAreVotedBySessionId(
    items,
    ctx.state.sessionId,
  );
  const lastPage = calcLastPage(allItems.length, PAGE_LENGTH);

  return (
    <>
      <Head href={ctx.url.href} />
      <main class="flex-1 p-4">
        <TimeSelector url={ctx.url} />
        {items.map((item, index) => (
          <ItemSummary
            item={item}
            isVoted={areVoted[index]}
            user={itemsUsers[index]}
          />
        ))}
        {lastPage > 1 && (
          <PageSelector
            currentPage={calcPageNum(ctx.url)}
            lastPage={lastPage}
            timeSelector={calcTimeAgoFilter(ctx.url) ?? undefined}
          />
        )}
      </main>
    </>
  );
}
