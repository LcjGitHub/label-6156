import { readStorage, writeStorage } from './storage';

const STORAGE_KEY = 'history';
const MAX_HISTORY = 5;

export interface HistoryItem {
  id: string;
  name: string;
}

function readHistory(): HistoryItem[] {
  return readStorage<HistoryItem[]>(STORAGE_KEY, []);
}

function writeHistory(items: HistoryItem[]): void {
  writeStorage(STORAGE_KEY, items);
}

export function getHistory(): HistoryItem[] {
  return readHistory();
}

export function addHistory(id: string, name: string): void {
  const history = readHistory();
  const filtered = history.filter((item) => item.id !== id);
  filtered.unshift({ id, name });
  const trimmed = filtered.slice(0, MAX_HISTORY);
  writeHistory(trimmed);
}

export function clearHistory(): void {
  writeHistory([]);
}

/**
 * 从浏览历史中移除指定路线标识的记录
 * @param id 路线唯一标识
 */
export function removeHistory(id: string): void {
  const history = readHistory();
  const filtered = history.filter((item) => item.id !== id);
  writeHistory(filtered);
}
