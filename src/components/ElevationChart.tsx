import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { ElevationPoint } from '../types/trail';

export interface ChartMarkerPoint {
  /** 标注点在数据数组中的索引 */
  index: number;
  /** 标注点标签名称 */
  label: string;
  /** 标注点颜色 */
  color: string;
}

interface ElevationChartProps {
  /** 海拔剖面采样点 */
  data: ElevationPoint[];
  /** 关键点标注配置 */
  markers?: ChartMarkerPoint[];
}

/**
 * 海拔剖面 ECharts 折线图
 */
export function ElevationChart({ data, markers = [] }: ElevationChartProps) {
  const distances = data.map((point) => point.distance);
  const elevations = data.map((point) => point.elevation);

  const markPointData = markers.map((marker) => {
    const point = data[marker.index];
    return {
      name: marker.label,
      coord: [marker.index, point.elevation],
      value: point.elevation,
      itemStyle: {
        color: marker.color,
      },
      label: {
        show: true,
        position: 'top',
        formatter: marker.label,
        color: marker.color,
        fontWeight: 'bold' as const,
        fontSize: 12,
      },
      symbolSize: 14,
      markerData: marker,
      pointData: point,
    };
  });

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
      trigger: 'item',
      formatter: (params: any) => {
        if (params.componentType === 'markPoint') {
          const point = params.data?.pointData;
          const marker = params.data?.markerData;
          if (point && marker) {
            return `<b style="color:${marker.color}">${marker.label}</b><br/>里程：${point.distance.toFixed(1)} km<br/>海拔：${point.elevation} m`;
          }
          return '';
        }
        const item = Array.isArray(params) ? params[0] : params;
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
        markPoint: {
          symbol: 'pin',
          symbolSize: 40,
          label: {
            fontSize: 11,
            fontWeight: 'bold',
          },
          data: markPointData as any,
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
