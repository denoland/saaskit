// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers, PageProps } from "$fresh/server.ts";
import { SITE_WIDTH_STYLES } from "@/utils/constants.ts";
import Layout from "@/components/Layout.tsx";
import Head from "@/components/Head.tsx";
import type { State } from "./_middleware.ts";
import { getManyAnalyticsMetricsPerDay } from "@/utils/db.ts";
import { Chart } from "fresh_charts/mod.ts";
import { ChartColors } from "fresh_charts/utils.ts";

interface AnalyticsByDay {
  metricsValue: number[];
  dates: string[];
}

interface StatsPageData extends State {
  metricsByDay: AnalyticsByDay[];
  metricsTitles: string[];
}

export const handler: Handlers<StatsPageData, State> = {
  async GET(_, ctx) {
    const daysBefore = 30;

    const metricsKeys = [
      "visits_count",
      "users_count",
      "items_count",
      "votes_count",
    ];
    const metricsTitles = ["Visits", "New Users", "New Items", "New Votes"];
    const metricsByDay = await getManyAnalyticsMetricsPerDay(metricsKeys, {
      limit: daysBefore,
    });

    return ctx.render({ ...ctx.state, metricsByDay, metricsTitles });
  },
};

function LineChart(
  props: { title: string; x: string[]; y: number[] },
) {
  return (
    <>
      <h3 class="py-4 text-2xl font-bold">{props.title}</h3>
      <Chart
        type="line"
        options={{
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: { grid: { display: false } },
            x: { grid: { display: false } },
          },
        }}
        data={{
          labels: props.x,
          datasets: [{
            label: props.title,
            data: props.y,
            borderColor: ChartColors.Blue,
            backgroundColor: ChartColors.Blue,
            borderWidth: 3,
            cubicInterpolationMode: "monotone",
            tension: 0.4,
          }],
        }}
      />
    </>
  );
}

export default function StatsPage(props: PageProps<StatsPageData>) {
  return (
    <>
      <Head title="Stats" href={props.url.href} />
      <Layout session={props.data.sessionId}>
        <div class={`${SITE_WIDTH_STYLES} flex-1 px-4`}>
          <div class="p-4 mx-auto max-w-screen-md">
            {props.data.metricsByDay.map((metric, index) => (
              <LineChart
                title={props.data.metricsTitles[index]}
                x={props.data.dates!.map((date) =>
                  new Date(date).toLocaleDateString("en-us", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                )}
                y={metric.metricsValue!}
              />
            ))}
          </div>
        </div>
      </Layout>
    </>
  );
}
