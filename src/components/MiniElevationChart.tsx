import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { ElevationPoint } from '../types/trail';

interface MiniElevationChartProps {
  data: ElevationPoint[];
  color?: string;
  height?: number;
}

export function MiniElevationChart({ data, color = '#3370ff', height = 120 }: MiniElevationChartProps) {
  const distances = data.map((point) => point.distance.toFixed(1));
  const elevations = data.map((point) => point.elevation);

  const option: EChartsOption = {
    grid: {
      left: 40,
      right: 10,
      top: 10,
      bottom: 20,
    },
    xAxis: {
      type: 'category',
      data: distances,
      boundaryGap: false,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        fontSize: 10,
        color: 'rgba(0,0,0,0.45)',
        interval: Math.floor(distances.length / 4),
      },
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        fontSize: 10,
        color: 'rgba(0,0,0,0.45)',
        formatter: '{value}',
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0,0,0,0.06)',
        },
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
      },
      formatter: (params) => {
        const paramArray = Array.isArray(params) ? params : [params];
        if (paramArray.length === 0) {
          return '';
        }
        const seriesItem = paramArray.find(
          (item) => (item as { componentType: string }).componentType === 'series'
        );
        if (seriesItem) {
          const dataIndex = (seriesItem as { dataIndex?: number }).dataIndex;
          if (typeof dataIndex === 'number') {
            const point = data[dataIndex];
            if (point) {
              return `里程：${point.distance.toFixed(1)} km<br/>海拔：${point.elevation} m`;
            }
          }
        }
        return '';
      },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${color}55` },
              { offset: 1, color: `${color}08` },
            ],
          },
        },
        data: elevations,
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ height, width: '100%' }}
      notMerge
      lazyUpdate
    />
  );
}
