import type { Trail } from '../types/trail';
import { getAllTrails, calculateElevationStats } from './trails';

/**
 * 路线统计汇总结果
 */
export interface TrailStatsSummary {
  /** 路线总条数 */
  totalCount: number;
  /** 总里程合计（公里） */
  totalDistance: number;
  /** 平均爬升（米） */
  avgElevationGain: number;
  /** 爬升最高的路线信息，无数据时为 null */
  maxElevationGainTrail: {
    /** 路线名称 */
    name: string;
    /** 爬升数值（米） */
    value: number;
  } | null;
}

/**
 * 计算全部路线的统计汇总数据
 *
 * @param trails 可选的路线列表，若不传入则自动读取全部路线数据
 * @returns 统计汇总结果对象，包含总条数、总里程、平均爬升、爬升最高路线
 *
 * @example
 * ```ts
 * const stats = calculateTrailStats();
 * // => { totalCount: 10, totalDistance: 110.5, avgElevationGain: 804.4, maxElevationGainTrail: {...} }
 * ```
 */
export function calculateTrailStats(trails?: Trail[]): TrailStatsSummary {
  const data = trails ?? getAllTrails();

  if (data.length === 0) {
    return {
      totalCount: 0,
      totalDistance: 0,
      avgElevationGain: 0,
      maxElevationGainTrail: null,
    };
  }

  const totalCount = data.length;
  const totalDistance = data.reduce((sum, t) => sum + t.distance, 0);
  const avgElevationGain = data.reduce((sum, t) => sum + t.elevationGain, 0) / totalCount;

  let maxTrail = data[0];
  for (let i = 1; i < data.length; i++) {
    if (data[i].elevationGain > maxTrail.elevationGain) {
      maxTrail = data[i];
    }
  }

  return {
    totalCount,
    totalDistance,
    avgElevationGain,
    maxElevationGainTrail: {
      name: maxTrail.name,
      value: maxTrail.elevationGain,
    },
  };
}

/**
 * 单项指标差值结果
 */
export interface MetricDiff {
  /** 左侧路线数值 */
  leftValue: number;
  /** 右侧路线数值 */
  rightValue: number;
  /** 差值（左侧 - 右侧） */
  diff: number;
  /** 差值格式化字符串，包含正负号 */
  diffFormatted: string;
  /** 优劣方向：'better' 表示左侧更优（数值更小），'worse' 表示左侧更差（数值更大），'equal' 表示相等 */
  direction: 'better' | 'worse' | 'equal';
  /** 建议用于显示的颜色（绿色表示左侧优，红色表示左侧差，灰色表示相等） */
  color: string;
}

/**
 * 双路线指标差值对比结果
 */
export interface TrailCompareDiff {
  /** 里程差值（公里） */
  distance: MetricDiff;
  /** 累计爬升差值（米） */
  elevationGain: MetricDiff;
  /** 最高海拔差值（米） */
  maxElevation: MetricDiff;
}

/**
 * 计算单项指标的差值与优劣
 *
 * @param leftValue 左侧路线的数值
 * @param rightValue 右侧路线的数值
 * @param unit 数值单位（用于格式化显示）
 * @param decimals 小数位数，默认 1
 * @returns 单项指标差值结果
 */
function calcMetricDiff(
  leftValue: number,
  rightValue: number,
  unit: string,
  decimals: number = 1
): MetricDiff {
  const diff = leftValue - rightValue;
  const absDiff = Math.abs(diff);
  const sign = diff > 0 ? '+' : diff < 0 ? '-' : '';
  const diffFormatted = `${sign}${absDiff.toFixed(decimals)}${unit ? ' ' + unit : ''}`;

  let direction: 'better' | 'worse' | 'equal' = 'equal';
  let color = 'rgba(0,0,0,0.45)';

  if (diff < 0) {
    direction = 'better';
    color = '#00b42a';
  } else if (diff > 0) {
    direction = 'worse';
    color = '#f53f3f';
  }

  return {
    leftValue,
    rightValue,
    diff,
    diffFormatted,
    direction,
    color,
  };
}

/**
 * 计算两条路线的核心指标差值对比数据
 *
 * 自动计算里程、累计爬升、最高海拔三项指标的差值，
 * 并基于"数值越小越优"的徒步路线通用原则判定优劣方向：
 * - 里程越短，体力消耗越少（更优）
 * - 累计爬升越少，攀登难度越低（更优）
 * - 最高海拔越低，高原风险越小（更优）
 *
 * @param leftTrail 左侧路线对象
 * @param rightTrail 右侧路线对象
 * @returns 双路线指标差值对比结果对象
 *
 * @example
 * ```ts
 * const diff = calculateTrailCompareDiff(trailA, trailB);
 * console.log(diff.distance.diffFormatted); // 如 "+2.5 km" 或 "-1.3 km"
 * console.log(diff.distance.direction); // 'better' | 'worse' | 'equal'
 * console.log(diff.distance.color); // 绿色/红色/灰色
 * ```
 */
export function calculateTrailCompareDiff(
  leftTrail: Trail,
  rightTrail: Trail
): TrailCompareDiff {
  const leftElevStats = calculateElevationStats(leftTrail.elevationProfile);
  const rightElevStats = calculateElevationStats(rightTrail.elevationProfile);

  return {
    distance: calcMetricDiff(leftTrail.distance, rightTrail.distance, 'km', 1),
    elevationGain: calcMetricDiff(leftTrail.elevationGain, rightTrail.elevationGain, 'm', 0),
    maxElevation: calcMetricDiff(
      leftElevStats.maxElevation,
      rightElevStats.maxElevation,
      'm',
      0
    ),
  };
}
