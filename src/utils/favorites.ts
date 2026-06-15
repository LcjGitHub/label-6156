import { readStorage, writeStorage } from './storage';

const STORAGE_KEY = 'favorites';

/**
 * 从 localStorage 读取收藏的路线 ID 列表
 * @internal 内部工具函数
 */
function readFavorites(): string[] {
  return readStorage<string[]>(STORAGE_KEY, []);
}

/**
 * 将收藏的路线 ID 列表写入 localStorage
 * @param ids - 路线 ID 数组
 * @internal 内部工具函数
 */
function writeFavorites(ids: string[]): void {
  writeStorage(STORAGE_KEY, ids);
}

/**
 * 获取所有已收藏的路线 ID 列表
 * @returns 路线 ID 数组
 */
export function getFavoriteIds(): string[] {
  return readFavorites();
}

/**
 * 检查指定路线是否已收藏
 * @param id - 路线 ID
 * @returns 已收藏返回 true，否则返回 false
 */
export function isFavorite(id: string): boolean {
  return readFavorites().includes(id);
}

/**
 * 添加路线到收藏列表（如果已存在则不重复添加）
 * @param id - 要收藏的路线 ID
 */
export function addFavorite(id: string): void {
  const favorites = readFavorites();
  if (!favorites.includes(id)) {
    favorites.push(id);
    writeFavorites(favorites);
  }
}

/**
 * 从收藏列表移除指定路线
 * @param id - 要取消收藏的路线 ID
 */
export function removeFavorite(id: string): void {
  const favorites = readFavorites().filter((fid) => fid !== id);
  writeFavorites(favorites);
}

/**
 * 切换路线的收藏状态
 * @param id - 要切换的路线 ID
 * @returns 切换后的状态：true 表示已收藏，false 表示未收藏
 */
export function toggleFavorite(id: string): boolean {
  if (isFavorite(id)) {
    removeFavorite(id);
    return false;
  } else {
    addFavorite(id);
    return true;
  }
}
