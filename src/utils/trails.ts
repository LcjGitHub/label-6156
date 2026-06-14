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
