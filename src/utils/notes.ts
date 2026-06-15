import { readStorage, writeStorage } from './storage';

const STORAGE_KEY = 'notes';

function readNotesMap(): Record<string, string> {
  return readStorage<Record<string, string>>(STORAGE_KEY, {});
}

function writeNotesMap(notes: Record<string, string>): void {
  writeStorage(STORAGE_KEY, notes);
}

export function getNote(id: string): string {
  const notes = readNotesMap();
  return notes[id] || '';
}

export function hasNote(id: string): boolean {
  const notes = readNotesMap();
  return !!notes[id] && notes[id].trim().length > 0;
}

export function getAllNoteIds(): string[] {
  const notes = readNotesMap();
  return Object.keys(notes).filter((id) => notes[id] && notes[id].trim().length > 0);
}

export function setNote(id: string, content: string): void {
  const notes = readNotesMap();
  if (content.trim().length > 0) {
    notes[id] = content;
  } else {
    delete notes[id];
  }
  writeNotesMap(notes);
}

export function removeNote(id: string): void {
  const notes = readNotesMap();
  delete notes[id];
  writeNotesMap(notes);
}
