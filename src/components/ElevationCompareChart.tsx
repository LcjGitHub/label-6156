import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { ElevationPoint } from '../types/trail';

export interface CompareTrailData {
  name: string;
  color: string;
  data: ElevationPoint[];
}

interface ElevationCompareChartProps {
  trails: [CompareTrailData, CompareTrailData];
  height?: number;
}

function normalizeData(data: ElevationPoint[]): { xPercent: number; distance: number; elevation: number }[] {
  if (data.length === 0) return [];
  const maxDistance = data[data.length - 1].distance;
  if (maxDistance === 0) {
    return data.map((point) => ({
      xPercent: 0,
      distance: point.distance,
      elevation: point.elevation,
    }));
  }
  return data.map((point) => ({
    xPercent: (point.distance / maxDistance) * 100,
    distance: point.distance,
    elevation: point.elevation,
  }));
}

export function ElevationCompareChart({ trails, height = 360 }: ElevationCompareChartProps) {
  const [trail1, trail2] = trails;
  const normalized1 = normalizeData(trail1.data);
  const normalized2 = normalizeData(trail2.data);

  const option: EChartsOption = {
    title: {
      text: '海拔叠加对比图',
      subtext: '横轴为各路线里程百分比归一化',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
      },
      subtextStyle: {
        fontSize: 12,
        color: 'rgba(0,0,0,0.45)',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
      formatter: (params) => {
        const paramArray = Array.isArray(params) ? params : [params];
        if (paramArray.length === 0) return '';

        const lines: string[] = [];
        paramArray.forEach((item) => {
          const seriesItem = item as { componentType: string; seriesName?: string; dataIndex?: number; color?: string };
          if (seriesItem.componentType === 'series' && seriesItem.dataIndex !== undefined) {
            const dataIndex = seriesItem.dataIndex;
            let trailData: CompareTrailData | undefined;
            let normalized: { xPercent: number; distance: number; elevation: number }[] | undefined;

            if (seriesItem.seriesName === trail1.name) {
              trailData = trail1;
              normalized = normalized1;
            } else if (seriesItem.seriesName === trail2.name) {
              trailData = trail2;
              normalized = normalized2;
            }

            if (trailData && normalized && normalized[dataIndex]) {
              const point = normalized[dataIndex];
              lines.push(
                `<b style="color:${seriesItem.color}">${trailData.name}</b><br/>里程：${point.distance.toFixed(1)} km (${point.xPercent.toFixed(0)}%)<br/>海拔：${point.elevation} m`
              );
            }
          }
        });

        return lines.join('<br/><br/>');
      },
    },
    legend: {
      top: 50,
      data: [trail1.name, trail2.name],
    },
    grid: {
      left: 60,
      right: 30,
      top: 90,
      bottom: 60,
    },
    xAxis: {
      type: 'value',
      name: '里程百分比 (%)',
      nameLocation: 'middle',
      nameGap: 30,
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}%',
      },
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
        name: trail1.name,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        showSymbol: false,
        lineStyle: {
          width: 2.5,
          color: trail1.color,
        },
        itemStyle: {
          color: trail1.color,
        },
        emphasis: {
          focus: 'series',
        },
        data: normalized1.map((p) => [p.xPercent, p.elevation]),
      },
      {
        name: trail2.name,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        showSymbol: false,
        lineStyle: {
          width: 2.5,
          color: trail2.color,
        },
        itemStyle: {
          color: trail2.color,
        },
        emphasis: {
          focus: 'series',
        },
        data: normalized2.map((p) => [p.xPercent, p.elevation]),
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
