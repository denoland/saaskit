// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { Chart } from "https://deno.land/x/fresh_charts@0.2.1/mod.ts";
import { ChartColors } from "https://deno.land/x/fresh_charts@0.2.1/utils.ts";

export default function LineChart(
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
