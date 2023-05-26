// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers, PageProps } from "$fresh/server.ts";
import { SITE_WIDTH_STYLES } from "@/utils/constants.ts";
import Layout from "@/components/Layout.tsx";
import Head from "@/components/Head.tsx";
import type { State } from "./_middleware.ts";
import LineChart from "@/components/LineChart.tsx";
import { getAllVisitsPerDay, getVisitsPerDay, type User } from "@/utils/db.ts";

interface StatsPageData extends State {
  visits?: number[];
  dates?: string[];
}

export const handler: Handlers<StatsPageData, State> = {
  async GET(_, ctx) {
    const daysBefore = 30;
    const { visits, dates } = await getAllVisitsPerDay({
      limit: daysBefore,
    });

    return ctx.render({ ...ctx.state, visits, dates });
  },
};

export default function HomePage(props: PageProps<StatsPageData>) {
  return (
    <>
      <Head title="Stats" href={props.url.href} />
      <Layout session={props.data.sessionId}>
        <div class={`${SITE_WIDTH_STYLES} flex-1 px-4`}>
          <div class="p-4 mx-auto max-w-screen-md">
            <LineChart
              title="Visits"
              x={props.data.dates!}
              y={props.data.visits!}
            />
          </div>
        </div>
      </Layout>
    </>
  );
}
