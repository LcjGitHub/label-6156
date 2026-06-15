import type { Trail, ElevationPoint } from '../types/trail';
import trailsData from '../mock/trails.json';

const trails = trailsData as Trail[];

/**
 * 获取全部路线列表
 */
export function getAllTrails(): Trail[] {
  return trails;
}

/**
 * 根据 ID 获取单条路线
 */
export function getTrailById(id: string): Trail | undefined {
  return trails.find((trail) => trail.id === id);
}

/**
 * 获取所有可选的难度等级
 */
export function getAllDifficulties(): string[] {
  const difficulties = new Set(trails.map((trail) => trail.difficulty));
  return Array.from(difficulties).sort((a, b) => {
    const order = ['简单', '中等', '中等偏难', '困难', '极难'];
    return order.indexOf(a) - order.indexOf(b);
  });
}

/**
 * 获取所有可选的区域
 */
export function getAllRegions(): string[] {
  const regions = new Set(trails.map((trail) => trail.region));
  return Array.from(regions).sort();
}

/**
 * 区域分组接口
 */
export interface RegionGroup {
  province: string;
  regions: string[];
}

/**
 * 获取按省份分组的区域列表
 */
export function getGroupedRegions(): RegionGroup[] {
  const regionSet = new Set(trails.map((trail) => trail.region));
  const provinceMap = new Map<string, string[]>();

  for (const region of regionSet) {
    const match = region.match(/^(.+?[省市])/);
    const province = match ? match[1] : region;
    if (!provinceMap.has(province)) {
      provinceMap.set(province, []);
    }
    provinceMap.get(province)!.push(region);
  }

  return Array.from(provinceMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([province, regions]) => ({
      province,
      regions: regions.sort(),
    }));
}

/**
 * 过滤条件接口
 */
export interface TrailFilter {
  difficulty?: string;
  region?: string;
}

/**
 * 根据条件过滤路线
 * @param trails 路线列表
 * @param filter 过滤条件
 */
export function filterTrails(trails: Trail[], filter: TrailFilter): Trail[] {
  return trails.filter((trail) => {
    if (filter.difficulty && trail.difficulty !== filter.difficulty) {
      return false;
    }
    if (filter.region && trail.region !== filter.region) {
      return false;
    }
    return true;
  });
}

/**
 * 从海拔剖面数组中找出海拔最高点的索引
 *
 * @param profile 海拔剖面采样点数组
 * @returns 最高点在数组中的索引。若数组为空则返回 -1。
 *          若存在多个相同最高海拔的点，返回第一个出现的索引。
 *
 * @example
 * ```ts
 * const profile = [
 *   { distance: 0, elevation: 100 },
 *   { distance: 1, elevation: 300 },
 *   { distance: 2, elevation: 200 },
 * ];
 * const maxIndex = findMaxElevationIndex(profile);
 * // => 1
 * ```
 */
export function findMaxElevationIndex(profile: ElevationPoint[]): number {
  if (profile.length === 0) {
    return -1;
  }
  let maxIndex = 0;
  let maxElevation = profile[0].elevation;
  for (let i = 1; i < profile.length; i++) {
    if (profile[i].elevation > maxElevation) {
      maxElevation = profile[i].elevation;
      maxIndex = i;
    }
  }
  return maxIndex;
}
