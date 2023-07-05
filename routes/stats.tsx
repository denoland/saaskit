// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers, PageProps } from "$fresh/server.ts";
import { DAY } from "std/datetime/constants.ts";
import type { State } from "./_middleware.ts";
import Chart from "@/islands/Chart.tsx";
import { getDatesSince, getManyMetrics } from "@/utils/db.ts";

interface StatsPageData extends State {
  dates: Date[];
  visitsCounts: bigint[];
  usersCounts: bigint[];
  itemsCounts: bigint[];
  votesCounts: bigint[];
}

export const handler: Handlers<StatsPageData, State> = {
  async GET(_req, ctx) {
    ctx.state.title = "Stats";

    const msAgo = 30 * DAY;
    const dates = getDatesSince(msAgo).map((date) => new Date(date));

    const [
      visitsCounts,
      usersCounts,
      itemsCounts,
      votesCounts,
    ] = await Promise.all([
      getManyMetrics("visits_count", dates),
      getManyMetrics("users_count", dates),
      getManyMetrics("items_count", dates),
      getManyMetrics("votes_count", dates),
    ]);

    return ctx.render({
      ...ctx.state,
      dates,
      visitsCounts,
      usersCounts,
      itemsCounts,
      votesCounts,
    });
  },
};

export default function StatsPage(props: PageProps<StatsPageData>) {
  const datasets = [
    {
      label: "Site visits",
      data: props.data.visitsCounts,
      borderColor: "#be185d",
    },
    {
      label: "Users created",
      data: props.data.usersCounts,
      borderColor: "#e85d04",
    },
    {
      label: "Items created",
      data: props.data.itemsCounts,
      borderColor: "#219ebc",
    },
    {
      label: "Votes",
      data: props.data.votesCounts,
      borderColor: "#4338ca",
    },
  ];

  const labels = props.data.dates.map((date) =>
    new Date(date).toLocaleDateString("en-us", {
      month: "short",
      day: "numeric",
    })
  );

  return (
    <main class="flex-1 p-4 aspect-[2/1] mx-auto relative w-full">
      <Chart
        type="line"
        options={{
          plugins: {
            title: {
              display: true,
              text: "Daily counts",
            },
          },
          interaction: {
            intersect: false,
            mode: "index",
          },
          scales: {
            x: {
              grid: { display: false },
            },
            y: {
              beginAtZero: true,
              grid: { display: false },
            },
          },
        }}
        data={{
          labels,
          datasets: datasets.map((dataset) => ({
            ...dataset,
            data: dataset.data.map((value) => Number(value)),
            pointRadius: 0,
            cubicInterpolationMode: "monotone",
          })),
        }}
      />
    </main>
  );
}
