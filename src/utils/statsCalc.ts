import type { Trail } from '../types/trail';
import { getAllTrails } from './trails';

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
