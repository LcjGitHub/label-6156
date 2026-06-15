import type { Trail } from '../types/trail';
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
