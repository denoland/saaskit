// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers, PageProps } from "$fresh/server.ts";
import { DAY } from "std/datetime/constants.ts";
import type { State } from "./_middleware.ts";
import { getDatesSince, getManyMetrics } from "@/utils/db.ts";
import { Chart } from "fresh_charts/mod.ts";

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

function LineChart(
  props: { title: string; x: string[]; y: bigint[]; color: string },
) {
  const data = props.y.map((value) => Number(value));
  const total = data.reduce((value, currentValue) => currentValue + value, 0);

  return (
    <div class="py-4 resize lg:chart">
      <div class="py-4 text-center">
        <h3>{props.title}</h3>
        <p class="font-bold">{total}</p>
      </div>
      <div class="overflow-auto">
        <Chart
          svgClass="m-auto"
          type="line"
          options={{
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
            },
            scales: {
              x: {
                grid: { display: false },
              },
              y: {
                beginAtZero: true,
                grid: { display: false },
                ticks: { stepSize: 1 },
              },
            },
          }}
          data={{
            labels: props.x,
            datasets: [{
              data: data,
              borderColor: props.color,
              pointRadius: 0,
              cubicInterpolationMode: "monotone",
            }],
          }}
        />
      </div>
    </div>
  );
}

export default function StatsPage(props: PageProps<StatsPageData>) {
  const charts = [
    {
      title: "Site visits",
      values: props.data.visitsCounts,
      color: "#be185d",
    },
    {
      title: "Users created",
      values: props.data.usersCounts,
      color: "#e85d04",
    },
    {
      title: "Items created",
      values: props.data.itemsCounts,
      color: "#219ebc",
    },
    {
      title: "Votes",
      values: props.data.votesCounts,
      color: "#4338ca",
    },
  ];

  const x = props.data.dates.map((date) =>
    new Date(date).toLocaleDateString("en-us", {
      month: "short",
      day: "numeric",
    })
  );

  return (
    <main class="flex-1 p-4">
      <div class="gap-4">
        {charts.map((chart) => (
          <LineChart
            color={chart.color}
            title={chart.title}
            x={x}
            y={chart.values}
          />
        ))}
      </div>
    </main>
  );
}
