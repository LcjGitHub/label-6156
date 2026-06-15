const STORAGE_KEY = 'trail-history';
const MAX_HISTORY = 5;

export interface HistoryItem {
  id: string;
  name: string;
}

function readHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeHistory(items: HistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    console.error('Failed to save history to localStorage');
  }
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

export function removeHistory(id: string): void {
  const history = readHistory();
  const filtered = history.filter((item) => item.id !== id);
  writeHistory(filtered);
}
