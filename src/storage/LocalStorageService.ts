import { IStorageService } from './IStorageService';

/**
 * LocalStorage implementation of IStorageService.
 * Features namespacing, graceful fallback to in-memory store if localStorage is blocked,
 * and JSON serialization error handling.
 */
export class LocalStorageService<T extends { id: string }> implements IStorageService<T> {
  private key: string;
  private memoryFallback: Map<string, T> = new Map();
  private isLocalStorageAvailable: boolean;

  constructor(namespace: string) {
    this.key = `medtrack_v1:${namespace}`;
    this.isLocalStorageAvailable = this.checkAvailability();
  }

  private checkAvailability(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const testKey = '__medtrack_storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private readRaw(): T[] {
    if (!this.isLocalStorageAvailable) {
      return Array.from(this.memoryFallback.values());
    }

    try {
      const data = window.localStorage.getItem(this.key);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error(`[LocalStorageService] Error reading key "${this.key}":`, e);
      return [];
    }
  }

  private writeRaw(items: T[]): void {
    if (!this.isLocalStorageAvailable) {
      this.memoryFallback.clear();
      items.forEach((item) => this.memoryFallback.set(item.id, item));
      return;
    }

    try {
      window.localStorage.setItem(this.key, JSON.stringify(items));
    } catch (e) {
      console.error(`[LocalStorageService] Error writing key "${this.key}":`, e);
    }
  }

  async getAll(): Promise<T[]> {
    return this.readRaw();
  }

  async getById(id: string): Promise<T | null> {
    const items = this.readRaw();
    return items.find((item) => item.id === id) || null;
  }

  async save(item: T): Promise<T> {
    const items = this.readRaw();
    const existingIndex = items.findIndex((i) => i.id === item.id);

    if (existingIndex >= 0) {
      items[existingIndex] = item;
    } else {
      items.push(item);
    }

    this.writeRaw(items);
    return item;
  }

  async saveAll(newItems: T[]): Promise<T[]> {
    this.writeRaw(newItems);
    return newItems;
  }

  async remove(id: string): Promise<boolean> {
    const items = this.readRaw();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length !== items.length) {
      this.writeRaw(filtered);
      return true;
    }
    return false;
  }

  async clear(): Promise<void> {
    if (!this.isLocalStorageAvailable) {
      this.memoryFallback.clear();
      return;
    }
    try {
      window.localStorage.removeItem(this.key);
    } catch (e) {
      console.error(`[LocalStorageService] Error clearing key "${this.key}":`, e);
    }
  }
}
