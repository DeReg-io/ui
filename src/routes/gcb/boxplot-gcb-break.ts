import { numToHumanText } from '$lib/util/number-to-human-readable';
import type { EChartsOption } from 'echarts';

const animationDuration = 500;

function getEchartsOptions({
  symbol,
  maxValue,
  currentValue,
  isDarkmode
}: {
  symbol: string;
  maxValue: number;
  currentValue: number;
  isDarkmode: boolean;
}): EChartsOption {
  const maxOutflowExceeded = currentValue > maxValue;

  const options: EChartsOption = {
    backgroundColor: 'transparent', // Make background transparent
    //   tooltip: {
    //     trigger: 'item',
    //     axisPointer: {
    //       type: 'shadow'
    //     }
    //   },
    grid: {
      left: '20%',
      right: '20%'
    },
    yAxis: {
      type: 'category',
      splitArea: {
        show: false
      },
      splitLine: {
        show: false // Remove grid lines
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      }
    },
    xAxis: {
      type: 'value',
      scale: true,
      splitArea: {
        show: false
      },
      splitLine: {
        show: false // Remove grid lines
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      },
      min: 0,
      max: maxOutflowExceeded ? currentValue : maxValue
    },
    series: [
      {
        name: 'boxplot',
        type: 'boxplot',
        // data: [[], [0, 0, 0, currentValue, maxValue], []],
        data: [[0, 0, 0, currentValue, maxValue]],
        itemStyle: {
          color: '#3bbff7',
          borderWidth: 2,
          borderColor: '#3bbff7'
        },
        boxWidth: [25, 25],
        markLine: {
          // symbol: ['none', 'none'], // this removes the symbol at the ends of the line
          label: {
            show: true,
            formatter: `${numToHumanText(maxValue)} ${symbol}`,
            position: 'middle',
            fontSize: 16,
            color: isDarkmode ? '#a6adbb' : '#1f2838' // color of the markLine
          },
          lineStyle: {
            color: isDarkmode ? '#a6adbb' : '#1f2838', // color of the markLine
            width: 2 // width of the markLine
          },
          data: [
            [
              { xAxis: 0, yAxis: 2, y: 53 },
              { xAxis: maxValue, yAxis: 2, y: 53 }
            ]
          ],
          animationDuration
        },
        ...(maxOutflowExceeded
          ? {
              markArea: {
                silent: true,
                itemStyle: {
                  color: '#f97272' // semi-transparent red
                },
                data: [
                  [
                    {
                      yAxis: 0,
                      y: 81,
                      xAxis: maxValue
                    },
                    {
                      yAxis: 2, // change this to match the median of your data
                      y: 109,
                      xAxis: currentValue + currentValue * 0.0025
                    }
                  ]
                ]
              }
            }
          : {}),
        z: 0
      },
      ...(maxOutflowExceeded
        ? []
        : [
            {
              name: 'line',
              type: 'line',
              markLine: {
                symbol: ['circle', 'arrow'], // this removes the symbol at the ends of the line
                label: {
                  show: true,
                  formatter: `${Math.round(
                    (currentValue / maxValue) * 100
                  )}% outflow\n${numToHumanText(currentValue)} ${symbol}`,
                  position: 'middle',
                  distance: -40,
                  fontSize: 16,
                  color: isDarkmode ? '#a6adbb' : '#1f2838' // color of the markLine
                },
                lineStyle: {
                  color: isDarkmode ? '#a6adbb' : '#1f2838', // color of the markLine
                  width: 2 // width of the markLine
                },
                data: [
                  [
                    { xAxis: 0, yAxis: 0, y: 135 },
                    { xAxis: currentValue, yAxis: 0, y: 135 }
                  ]
                ],
                animationDuration
              },
              data: [] // no data for this series
            }
          ]),
      {
        name: 'line',
        type: 'line',
        markLine: {
          symbol: ['none', 'triangle'], // this removes the symbol at the ends of the line
          symbolSize: 20,
          label: {
            show: true,
            formatter: maxOutflowExceeded
              ? `Exceeded by ${Math.round(
                  ((currentValue - maxValue) * 100) / maxValue
                )}%\n ${numToHumanText(
                  Math.round(currentValue - maxValue)
                )} ${symbol}`
              : `${Math.round(
                  ((maxValue - currentValue) * 100) / maxValue
                )}% left\n${numToHumanText(
                  Math.round(maxValue - currentValue)
                )} ${symbol}`,
            position: 'middle',
            distance: -40,
            fontSize: 16,
            color: isDarkmode ? '#a6adbb' : '#1f2838' // color of the markLine
          },
          lineStyle: {
            color: '#f97272', // color of the markLine
            width: 3, // width of the markLine
            type: 'solid'
          },
          data: [
            [
              {
                xAxis: maxOutflowExceeded ? maxValue : currentValue,
                yAxis: 0,
                y: 135
              },
              {
                xAxis: maxOutflowExceeded
                  ? currentValue - currentValue * 0.01
                  : maxValue - maxValue * 0.01,
                yAxis: 0,
                y: 135
              }
            ]
          ],
          animationDuration
        },
        data: [] // no data for this series
      },
      {
        name: 'line',
        type: 'line',
        markLine: {
          symbol: ['none', 'none'], // this removes the symbol at the ends of the line
          symbolSize: 20,
          lineStyle: {
            color: '#f97272',
            width: 3, // width of the markLine
            type: 'dashed'
          },
          label: {
            show: true,
            formatter: 'Circuit Breaker\nThreshold',
            position: 'start',
            fontSize: 16,
            color: isDarkmode ? '#a6adbb' : '#1f2838' // color of the markLine
          },
          data: [
            [
              {
                xAxis: maxValue,
                yAxis: 2,
                y: 36
              },
              {
                xAxis: maxValue,
                yAxis: 2,
                y: 125
              }
            ]
          ],
          animationDuration
        },
        data: [] // no data for this series
      }
    ]
  };
  return options;
}
export default getEchartsOptions;
