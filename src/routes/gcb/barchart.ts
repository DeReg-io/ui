import type { CleanTransfers } from '$lib/eth-data';
import { isDateYesterday } from '$lib/util/is-date-yesterday';
import { numToHumanText } from '$lib/util/number-to-human-readable';
import type { EChartsOption } from 'echarts';
import _ from 'lodash';

const animationDuration = 500;

function getEchartsOptions({
  symbol,
  inflow,
  outflow,
  isDarkmode
}: {
  symbol: string;
  inflow: CleanTransfers[];
  outflow: CleanTransfers[];
  isDarkmode: boolean;
}): EChartsOption {
  const allTransfers = _.flatten([inflow, outflow]);
  const minTimestamp = _.minBy(allTransfers, 'timestamp')!.timestamp;
  const maxTimestamp = _.maxBy(allTransfers, 'timestamp')!.timestamp;
  const steps = Math.min(20, Math.min(inflow.length, outflow.length));
  const spaceBetweenTimestamps = (maxTimestamp - minTimestamp) / steps;
  const buckets: number[] = [];
  for (let i = 0; i <= steps; i++) {
    buckets.push(Math.round(minTimestamp + i * spaceBetweenTimestamps));
  }

  const closestBucket = (t: CleanTransfers): number => {
    let closest = Infinity;
    let closestBucket = buckets[0];
    for (const bucket of buckets) {
      const diff = Math.abs(t.timestamp - bucket);
      if (diff < closest) {
        closest = diff;
        closestBucket = bucket;
      }
    }
    return closestBucket;
  };

  let [groupedInflow, groupedOutflow] = [inflow, outflow].map((flow) =>
    _.chain(flow)
      .groupBy(closestBucket)
      .mapValues((arr) => _.sumBy(arr, 'value'))
      .toPairs()
      .map((t) => [+t[0], t[1]])
      .sortBy((t) => t[0])
      .value()
  );

  const tvlOverTime = _.chain(allTransfers)
    .groupBy(closestBucket)
    .mapValues((arr) => _.sumBy(arr, 'tvl') / arr.length)
    .toPairs()
    .map((t) => [+t[0], t[1]])
    .sortBy((t) => t[0])
    .value();

  // tvlOverTime can have more value, will mess up drawing of line
  const missingInInflow = _.difference(
    buckets,
    groupedInflow.map((t) => t[0])
  );
  groupedInflow.push(...missingInInflow.map((ts) => [ts, 0]));
  groupedInflow = _.sortBy(groupedInflow, (t) => t[0]);

  const missingInOutflow = _.difference(
    buckets,
    groupedOutflow.map((t) => t[0])
  );
  groupedOutflow.push(...missingInOutflow.map((ts) => [ts, 0]));
  groupedOutflow = _.sortBy(groupedOutflow, (t) => t[0]);

  const minTvl = _.minBy(allTransfers, 'tvl');

  type ChartTimeRow = [number, number];

  const formatTimestamps = (series: ChartTimeRow[]) => {
    return series.map((s) => {
      const date = new Date(s[0]);
      const isYesterday = isDateYesterday(date);
      date.setSeconds(0);
      let dateStr = date.toLocaleTimeString().slice(0, -3);
      if (isYesterday) dateStr += '-1d';
      const result = [dateStr, s[1]];
      return result;
      // return [new Date(s[0]), s[1]];
    });
  };

  const xAxisStyle = {
    color: isDarkmode ? '#a6adbb' : '#1f2937'
  };

  const options: EChartsOption = {
    grid: [
      { bottom: '50%', left: '20%', right: '20%' },
      { top: '50%', left: '20%', right: '20%' }
    ],
    xAxis: [
      {
        type: 'category',
        gridIndex: 0,
        z: 10,
        zlevel: 10,
        axisLine: { lineStyle: xAxisStyle }
      },
      {
        type: 'category',
        gridIndex: 1,
        show: false,
        axisLine: { lineStyle: xAxisStyle }
      }
    ],
    yAxis: [
      {
        type: 'log',
        gridIndex: 0,
        min: 1,
        name: `Inflow ${symbol}`,

        axisLine: { lineStyle: xAxisStyle }
        // splitLine: { lineStyle: xAxisStyle }
      },
      {
        type: 'log',
        gridIndex: 1,
        inverse: true,
        min: 1,
        name: `Outflow ${symbol}`,

        axisLine: { lineStyle: xAxisStyle }
        // splitLine: { lineStyle: xAxisStyle }
      },
      {
        type: 'value',
        gridIndex: 0,
        name: `TVL in ${symbol}`,
        min: Math.floor(minTvl.tvl * (199 / 200)),
        axisLine: { lineStyle: xAxisStyle }
        // splitLine: { lineStyle: xAxisStyle }
      }
      // { type: 'log', inverse: true, splitArea: { show: false } }
    ],
    tooltip: {
      show: true,
      // formatter: (a) => {
      //   console.log('a: ', a);
      //   return a;
      // },
      valueFormatter: (val) => `${numToHumanText(val)} ${symbol}`
    },
    series: [
      {
        data: formatTimestamps(groupedInflow as ChartTimeRow[]),
        // data: groupedInflow,
        type: 'bar',
        itemStyle: {
          color: '#3abff8'
        },
        barGap: '10%',
        barWidth: '90%',
        xAxisIndex: 0,
        yAxisIndex: 0
      },
      {
        // data: groupedOutflow,
        data: formatTimestamps(groupedOutflow as ChartTimeRow[]),
        // data: groupedOutflow.map((t) => [t[0], t[1] * -1]),
        type: 'bar',
        itemStyle: {
          color: '#f87272'
        },
        barGap: '10%',
        barWidth: '90%',
        xAxisIndex: 1,
        yAxisIndex: 1
      },
      ...(minTvl.tvl > 0
        ? [
            {
              data: formatTimestamps(tvlOverTime as ChartTimeRow[]),
              type: 'line',
              itemStyle: {
                color: '#36d399'
              },
              xAxisIndex: 0,
              yAxisIndex: 2
            }
          ]
        : [])
    ]
  };
  return options;
}
export default getEchartsOptions;
