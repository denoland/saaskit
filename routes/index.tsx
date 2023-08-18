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
  type Item,
} from "@/utils/db.ts";
import { DAY, WEEK } from "std/datetime/constants.ts";
import Head from "@/components/Head.tsx";
// import IconInfo from "tabler_icons_tsx/info-circle.tsx";
import { TabItem } from "@/components/TabsBar.tsx";

const NEEDS_SETUP = Deno.env.get("GITHUB_CLIENT_ID") === undefined ||
  Deno.env.get("GITHUB_CLIENT_SECRET") === undefined;

// // temporarily redirect from / to /docs
// return new Response("", {
//   status: 307,
//   headers: { location: "/docs" },
// });

function calcTimeAgoFilter(url: URL) {
  return url.searchParams.get("time-ago");
}

function TimeSelector(props: { url: URL }) {
  const timeAgo = props.url.searchParams.get("time-ago");
  return (
    <div class="flex justify-center my-4 gap-2">
      {/* These links do not preserve current URL queries. E.g. if ?page=2, that'll be removed once one of these links is clicked */}
      <TabItem
        path="/?time-ago=week"
        innerText="Last Week"
        active={timeAgo === null || timeAgo === "week"}
      />
      <TabItem
        path="/?time-ago=month"
        innerText="Last Month"
        active={timeAgo === "month"}
      />
      <TabItem
        path="/?time-ago=all"
        innerText="All time"
        active={timeAgo === "all"}
      />
    </div>
  );
}

function SetupInstruction() {
  return (
    <div class="bg-green-50 dark:(bg-gray-900 border border-green-800) rounded-xl max-w-screen-sm mx-auto my-8 px-6 py-5 space-y-3">
      <h1 class="text-2xl font-medium">Welcome to SaaSKit!</h1>

      <p class="text-gray-600 dark:text-gray-400">
        To enable user login, you need to configure the GitHub OAuth application
        and set environment variables.
      </p>

      <p>
        <a
          href="https://github.com/denoland/saaskit#auth-oauth"
          class="inline-flex gap-2 text-green-600 dark:text-green-400 hover:underline cursor-pointer"
        >
          See the guide ›
        </a>
      </p>

      <p class="text-gray-600 dark:text-gray-400">
        After setting up{" "}
        <span class="bg-green-100 dark:bg-gray-800 p-1 rounded">
          GITHUB_CLIENT_ID
        </span>{" "}
        and{" "}
        <span class="bg-green-100 dark:bg-gray-800 p-1 rounded">
          GITHUB_CLIENT_SECRET
        </span>, this message will disappear.
      </p>
    </div>
  );
}

export default async function HomePage(
  _req: Request,
  ctx: RouteContext<undefined, State>,
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

  const areVoted = await getAreVotedBySessionId(
    items,
    ctx.state.sessionId,
  );
  const lastPage = calcLastPage(allItems.length, PAGE_LENGTH);

  // temporarily redirect from / to /docs
  return new Response("", {
    status: 307,
    headers: { location: "/docs" },
  });

  // return (

  //   <>
  //     <Head href={ctx.url.href} />
  //     <main class="flex-1 p-4">
  //       {NEEDS_SETUP && <SetupInstruction />}
  //       <TimeSelector url={ctx.url} />
  //       {items.length === 0 && (
  //         <>
  //           <div class="flex flex-col justify-center items-center gap-2">
  //             <div class="flex flex-col items-center gap-2 pt-16">
  //               {/* <IconInfo class="w-10 h-10 text-gray-400 dark:text-gray-600" /> */}
  //               <p class="text-center font-medium">No items found</p>
  //             </div>

  //             <a
  //               href="/submit"
  //               class="inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-primary hover:underline"
  //             >
  //               Submit your project
  //             </a>
  //           </div>
  //         </>
  //       )}

  //       {items.map((item, index) => (
  //         <ItemSummary
  //           item={item}
  //           isVoted={areVoted[index]}
  //         />
  //       ))}
  //       {lastPage > 1 && (
  //         <PageSelector
  //           currentPage={calcPageNum(ctx.url)}
  //           lastPage={lastPage}
  //           timeSelector={calcTimeAgoFilter(ctx.url) ?? undefined}
  //         />
  //       )}
  //     </main>
  //   </>
  // );
}
