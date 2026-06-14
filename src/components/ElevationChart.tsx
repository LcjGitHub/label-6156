import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { ElevationPoint } from '../types/trail';

interface ElevationChartProps {
  /** 海拔剖面采样点 */
  data: ElevationPoint[];
}

/**
 * 海拔剖面 ECharts 折线图
 */
export function ElevationChart({ data }: ElevationChartProps) {
  const distances = data.map((point) => point.distance);
  const elevations = data.map((point) => point.elevation);

  const option: EChartsOption = {
    title: {
      text: '海拔剖面图',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const items = Array.isArray(params) ? params : [params];
        const item = items[0];
        if (!item || typeof item.dataIndex !== 'number') {
          return '';
        }
        const point = data[item.dataIndex];
        return `里程：${point.distance.toFixed(1)} km<br/>海拔：${point.elevation} m`;
      },
    },
    grid: {
      left: 60,
      right: 30,
      top: 60,
      bottom: 50,
    },
    xAxis: {
      type: 'category',
      name: '里程 (km)',
      nameLocation: 'middle',
      nameGap: 30,
      data: distances.map((d) => d.toFixed(1)),
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      name: '海拔 (m)',
      nameLocation: 'middle',
      nameGap: 45,
      scale: true,
    },
    series: [
      {
        name: '海拔',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 2,
          color: '#3370ff',
        },
        itemStyle: {
          color: '#3370ff',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(51, 112, 255, 0.35)' },
              { offset: 1, color: 'rgba(51, 112, 255, 0.05)' },
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
      style={{ height: 400, width: '100%' }}
      notMerge
      lazyUpdate
    />
  );
}
