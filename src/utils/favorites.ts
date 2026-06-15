const STORAGE_KEY = 'trail-favorites';

function readFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeFavorites(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    console.error('Failed to save favorites to localStorage');
  }
}

export function getFavoriteIds(): string[] {
  return readFavorites();
}

export function isFavorite(id: string): boolean {
  return readFavorites().includes(id);
}

export function addFavorite(id: string): void {
  const favorites = readFavorites();
  if (!favorites.includes(id)) {
    favorites.push(id);
    writeFavorites(favorites);
  }
}

export function removeFavorite(id: string): void {
  const favorites = readFavorites().filter((fid) => fid !== id);
  writeFavorites(favorites);
}

export function toggleFavorite(id: string): boolean {
  if (isFavorite(id)) {
    removeFavorite(id);
    return false;
  } else {
    addFavorite(id);
    return true;
  }
}
