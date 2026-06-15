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
  keyword?: string;
}

/**
 * 根据条件过滤路线
 * @param trails 路线列表
 * @param filter 过滤条件
 */
export function filterTrails(trails: Trail[], filter: TrailFilter): Trail[] {
  const trimmedKeyword = filter.keyword?.trim();
  return trails.filter((trail) => {
    if (filter.difficulty && trail.difficulty !== filter.difficulty) {
      return false;
    }
    if (filter.region && trail.region !== filter.region) {
      return false;
    }
    if (trimmedKeyword && !fuzzyMatchKeyword(trail, trimmedKeyword)) {
      return false;
    }
    return true;
  });
}

/**
 * 模糊匹配关键词（匹配路线名称或区域）
 * @param trail 路线对象
 * @param keyword 搜索关键词
 * @returns 是否匹配
 */
export function fuzzyMatchKeyword(trail: Trail, keyword: string): boolean {
  const lowerKeyword = keyword.trim().toLowerCase();
  if (!lowerKeyword) {
    return true;
  }
  return (
    trail.name.toLowerCase().includes(lowerKeyword) ||
    trail.region.toLowerCase().includes(lowerKeyword)
  );
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

/**
 * 海拔统计结果接口
 */
export interface ElevationStats {
  /** 是否为有效数据（海拔剖面数组非空） */
  isValid: boolean;
  /** 最高海拔（米） */
  maxElevation: number;
  /** 最低海拔（米） */
  minElevation: number;
  /** 海拔落差（米） */
  elevationDrop: number;
}

/**
 * 根据海拔剖面数组计算海拔统计数据
 *
 * @param profile 海拔剖面采样点数组
 * @returns 海拔统计结果对象。若数组为空则 isValid 为 false，数值字段为 0。
 *
 * @example
 * ```ts
 * const profile = [
 *   { distance: 0, elevation: 100 },
 *   { distance: 1, elevation: 300 },
 *   { distance: 2, elevation: 200 },
 * ];
 * const stats = calculateElevationStats(profile);
 * // => { isValid: true, maxElevation: 300, minElevation: 100, elevationDrop: 200 }
 * ```
 */
export function calculateElevationStats(profile: ElevationPoint[]): ElevationStats {
  if (profile.length === 0) {
    return {
      isValid: false,
      maxElevation: 0,
      minElevation: 0,
      elevationDrop: 0,
    };
  }

  let maxElevation = profile[0].elevation;
  let minElevation = profile[0].elevation;

  for (let i = 1; i < profile.length; i++) {
    const elevation = profile[i].elevation;
    if (elevation > maxElevation) {
      maxElevation = elevation;
    }
    if (elevation < minElevation) {
      minElevation = elevation;
    }
  }

  return {
    isValid: true,
    maxElevation,
    minElevation,
    elevationDrop: maxElevation - minElevation,
  };
}

/**
 * 排序方向
 */
export type SortDirection = 'asc' | 'desc' | null;

/**
 * 按字段对数组进行排序（通用函数）
 * @param list 待排序数组
 * @param field 排序字段名
 * @param direction 排序方向：'asc' 升序，'desc' 降序，null 不排序
 * @returns 排序后的新数组（不修改原数组）
 */
export function sortByField<T extends Record<string, any>>(
  list: T[],
  field: keyof T | null,
  direction: SortDirection
): T[] {
  if (!field || !direction) {
    return [...list];
  }
  const sortedList = [...list].sort((a, b) => {
    const valueA = a[field];
    const valueB = b[field];
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return direction === 'asc' ? valueA - valueB : valueB - valueA;
    }
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return direction === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    return 0;
  });
  return sortedList;
}

/**
 * 循环切换排序状态：无排序 → 升序 → 降序 → 无排序
 * @param currentField 当前排序字段
 * @param currentDirection 当前排序方向
 * @param targetField 目标排序字段
 * @returns 新的排序字段和方向
 */
export interface RecommendFilter {
  difficulty?: string;
  minDistance?: number;
  maxDistance?: number;
}

export function recommendTrails(
  trails: Trail[],
  filter: RecommendFilter,
  favoriteIds: string[]
): Trail[] {
  return trails
    .filter((trail) => {
      if (filter.difficulty && trail.difficulty !== filter.difficulty) {
        return false;
      }
      if (filter.minDistance !== undefined && trail.distance < filter.minDistance) {
        return false;
      }
      if (filter.maxDistance !== undefined && trail.distance > filter.maxDistance) {
        return false;
      }
      if (favoriteIds.includes(trail.id)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => a.elevationGain - b.elevationGain);
}

export function toggleSortState(
  currentField: string | null,
  currentDirection: SortDirection,
  targetField: string
): { field: string | null; direction: SortDirection } {
  if (currentField !== targetField) {
    return { field: targetField, direction: 'asc' };
  }
  if (currentDirection === 'asc') {
    return { field: targetField, direction: 'desc' };
  }
  if (currentDirection === 'desc') {
    return { field: null, direction: null };
  }
  return { field: targetField, direction: 'asc' };
}
