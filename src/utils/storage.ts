const STORAGE_KEY_PREFIX = 'trail-';

/**
 * 生成带统一前缀的完整存储键名
 * @param key - 业务逻辑使用的键名
 * @returns 拼接前缀后的完整键名
 */
function getFullKey(key: string): string {
  return `${STORAGE_KEY_PREFIX}${key}`;
}

/**
 * 从 localStorage 读取并解析 JSON 数据
 * 读取失败或解析异常时返回指定的默认值
 *
 * @template T - 期望解析得到的数据类型
 * @param key - 业务键名（无需包含前缀）
 * @param defaultValue - 读取失败时返回的默认值
 * @returns 解析成功的数据，或默认值
 */
export function readStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(getFullKey(key));
    if (raw === null) {
      return defaultValue;
    }
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * 将数据序列化为 JSON 字符串后写入 localStorage
 * 写入异常时输出错误日志，但不会抛出异常
 *
 * @param key - 业务键名（无需包含前缀）
 * @param value - 需要存储的数据，必须可被 JSON 序列化
 */
export function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(getFullKey(key), JSON.stringify(value));
  } catch {
    console.error(`Failed to save "${key}" to localStorage`);
  }
}

/**
 * 从 localStorage 中删除指定键名的数据
 * 删除异常时输出错误日志，但不会抛出异常
 *
 * @param key - 业务键名（无需包含前缀）
 */
export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(getFullKey(key));
  } catch {
    console.error(`Failed to remove "${key}" from localStorage`);
  }
}
