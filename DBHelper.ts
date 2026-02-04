import * as FileSystem from 'expo-file-system/legacy';

const FILE_PATH = ((FileSystem as any).documentDirectory || '') + 'glucose.json';

export type Reading = {
  id: string;
  time: string;
  glucose: number;
  note: string;
  punctureSpot: string;
};

async function ensureFile(): Promise<void> {
  try {
    // `getInfoAsync` is deprecated; attempt to read the file and create it if it doesn't exist.
    await FileSystem.readAsStringAsync(FILE_PATH);
  } catch (e) {
    try {
      await FileSystem.writeAsStringAsync(FILE_PATH, JSON.stringify([]));
    } catch (err) {
      console.warn('ensureFile failed to create file', err);
      throw err;
    }
  }
}

async function readAll(): Promise<Reading[]> {
  try {
    await ensureFile();
    const str = await FileSystem.readAsStringAsync(FILE_PATH);
    const parsed = str ? JSON.parse(str) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('readAll failed', e);
    return [];
  }
}

async function writeAll(items: Reading[]): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(FILE_PATH, JSON.stringify(items));
  } catch (e) {
    console.warn('writeAll failed', e);
    throw e;
  }
}

export async function initDB(): Promise<void> {
  await ensureFile();
}

export async function addReading(r: Reading): Promise<void> {
  const items = await readAll();
  items.unshift(r);
  await writeAll(items);
}

export async function getReadings(): Promise<Reading[]> {
  return await readAll();
}

export async function getReadingsPage(page = 1, pageSize = 5): Promise<{ items: Reading[]; total: number }> {
  const all = await readAll();
  const total = all.length;
  const start = (page - 1) * pageSize;
  const items = all.slice(start, start + pageSize);
  return { items, total };
}

export async function deleteReading(id: string): Promise<void> {
  const items = await readAll();
  const filtered = items.filter(i => i.id !== id);
  await writeAll(filtered);
}

export async function clearAll(): Promise<void> {
  await writeAll([]);
}