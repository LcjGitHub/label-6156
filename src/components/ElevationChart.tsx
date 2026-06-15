import ReactECharts from 'echarts-for-react';
import type { EChartsOption, MarkPointComponentOption } from 'echarts';
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

  const validMarkers = markers.filter(
    (marker) => marker.index >= 0 && marker.index < data.length
  );

  const markerMap = new Map<string, ChartMarkerPoint>();
  validMarkers.forEach((marker) => {
    markerMap.set(marker.label, marker);
  });

  const markPointData: MarkPointComponentOption['data'] = validMarkers.map((marker) => {
    const point = data[marker.index];
    return {
      name: marker.label,
      coord: [marker.index, point.elevation] as [number, number],
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
      trigger: 'axis',
      axisPointer: {
        type: 'line',
      },
      formatter: (params) => {
        const paramArray = Array.isArray(params) ? params : [params];
        if (paramArray.length === 0) {
          return '';
        }

        const markPointItem = paramArray.find(
          (item) => (item as { componentType: string }).componentType === 'markPoint'
        );

        if (markPointItem) {
          const markerName = (markPointItem as { name?: string }).name;
          if (markerName) {
            const marker = markerMap.get(markerName);
            if (marker) {
              const point = data[marker.index];
              return `<b style="color:${marker.color}">${marker.label}</b><br/>里程：${point.distance.toFixed(1)} km<br/>海拔：${point.elevation} m`;
            }
          }
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
          data: markPointData,
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
