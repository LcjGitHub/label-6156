import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { DifficultyDistributionItem } from '../utils/statsCalc';

interface DifficultyBarChartProps {
  data: DifficultyDistributionItem[];
}

const DIFFICULTY_COLORS: Record<string, string> = {
  '简单': '#00b578',
  '中等': '#3370ff',
  '中等偏难': '#ff8f1f',
  '困难': '#f82c55',
  '极难': '#7b2ff2',
};

export function DifficultyBarChart({ data }: DifficultyBarChartProps) {
  const labels = data.map((item) => item.difficulty);
  const values = data.map((item) => item.count);
  const colors = data.map((item) => DIFFICULTY_COLORS[item.difficulty] ?? '#3370ff');
  const maxCount = Math.max(...values, 1);

  const option: EChartsOption = {
    grid: {
      left: 80,
      right: 48,
      top: 12,
      bottom: 12,
    },
    xAxis: {
      type: 'value',
      max: maxCount,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'category',
      data: labels,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        fontSize: 14,
        color: 'rgba(0,0,0,0.75)',
      },
    },
    series: [
      {
        type: 'bar',
        data: values.map((v, i) => ({
          value: v,
          itemStyle: {
            color: colors[i],
            borderRadius: [0, 4, 4, 0],
          },
        })),
        barWidth: 22,
        label: {
          show: true,
          position: 'right',
          formatter: '{c} 条',
          fontSize: 13,
          color: 'rgba(0,0,0,0.65)',
        },
      },
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const param = Array.isArray(params) ? params[0] : params;
        const idx = (param as { dataIndex?: number }).dataIndex ?? 0;
        const item = data[idx];
        return item ? `${item.difficulty}：${item.count} 条` : '';
      },
    },
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: 200, width: '100%' }}
      notMerge
      lazyUpdate
    />
  );
}
