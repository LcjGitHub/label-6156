import ReactECharts from 'echarts-for-react';
import type { EChartsOption, MarkPointComponentOption, TooltipComponentFormatterCallbackParams } from 'echarts';
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

  const markersByIndex = new Map<number, ChartMarkerPoint[]>();
  validMarkers.forEach((marker) => {
    const list = markersByIndex.get(marker.index) ?? [];
    list.push(marker);
    markersByIndex.set(marker.index, list);
  });

  const markPointData: MarkPointComponentOption['data'] = validMarkers.map((marker) => {
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
        fontWeight: 'bold',
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
      formatter: (params: TooltipComponentFormatterCallbackParams) => {
        const paramArray = Array.isArray(params) ? params : [params];
        if (paramArray.length === 0) {
          return '';
        }

        let dataIndex: number | undefined;
        for (const item of paramArray) {
          if (item.componentType === 'series' && typeof item.dataIndex === 'number') {
            dataIndex = item.dataIndex;
            break;
          }
        }

        if (dataIndex === undefined) {
          return '';
        }

        const point = data[dataIndex];
        if (!point) {
          return '';
        }

        const markersAtPoint = markersByIndex.get(dataIndex) ?? [];

        if (markersAtPoint.length > 0) {
          const labelsHtml = markersAtPoint
            .map((m) => `<b style="color:${m.color}">${m.label}</b>`)
            .join(' / ');
          return `${labelsHtml}<br/>里程：${point.distance.toFixed(1)} km<br/>海拔：${point.elevation} m`;
        }

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
