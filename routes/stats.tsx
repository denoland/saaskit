// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { RouteContext } from "$fresh/server.ts";
import { DAY } from "std/datetime/constants.ts";
import type { State } from "./_middleware.ts";
import Chart from "@/islands/Chart.tsx";
import { getDatesSince, getManyMetrics } from "@/utils/db.ts";
import Head from "@/components/Head.tsx";

export default async function StatsPage(
  _req: Request,
  ctx: RouteContext<unknown, State>,
) {
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

  const datasets = [
    {
      label: "Site visits",
      data: visitsCounts.map((count) => Number(count)),
      borderColor: "#be185d",
    },
    {
      label: "Users created",
      data: usersCounts.map((count) => Number(count)),
      borderColor: "#e85d04",
    },
    {
      label: "Items created",
      data: itemsCounts.map((count) => Number(count)),
      borderColor: "#219ebc",
    },
    {
      label: "Votes",
      data: votesCounts.map((count) => Number(count)),
      borderColor: "#4338ca",
    },
  ];

  const max = Math.max(...datasets.flatMap((dataset) => dataset.data));

  const labels = dates.map((date) =>
    new Date(date).toLocaleDateString("en-us", {
      month: "short",
      day: "numeric",
    })
  );

  return (
    <>
      <Head title="Stats" href={ctx.url.href} />
      <main class="flex-1 p-4 flex flex-col">
        <h1 class="text-3xl font-bold">Stats</h1>
        <div class="flex-1 relative">
          <Chart
            type="line"
            options={{
              maintainAspectRatio: false,
              interaction: {
                intersect: false,
                mode: "index",
              },
              scales: {
                x: {
                  max,
                  grid: { display: false },
                },
                y: {
                  beginAtZero: true,
                  grid: { display: false },
                  ticks: { precision: 0 },
                },
              },
            }}
            data={{
              labels,
              datasets: datasets.map((dataset) => ({
                ...dataset,
                pointRadius: 0,
                cubicInterpolationMode: "monotone",
              })),
            }}
          />
        </div>
      </main>
    </>
  );
}
