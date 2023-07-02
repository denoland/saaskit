/// <reference types="https://raw.githubusercontent.com/apexcharts/apexcharts.js/main/types/apexcharts.d.ts" />
import { useEffect, useRef } from "preact/hooks";

export default function LineChart(
  props: { title: string; x: string[]; y: number[]; color: string },
) {
  const ref = useRef<HTMLDivElement | null>(null);
  const total = props.y.reduce(
    (value, currentValue) => currentValue + value,
    0,
  );

  useEffect(() => {
    import("apexcharts").then(({ default: ApexCharts }) => {
      const chart = new ApexCharts(ref.current, {
        chart: { type: "line" },
        series: [{
          data: props.y,
        }],
        yaxis: {
          opposite: true,
        },
      });
      chart.render();
    });
  }, []);

  return (
    <div class="py-4 resize lg:chart">
      <div class="py-4 text-center">
        <h3>{props.title}</h3>
        <p class="font-bold">{total}</p>
      </div>
      <div class="overflow-auto" ref={ref} />
    </div>
  );
}
