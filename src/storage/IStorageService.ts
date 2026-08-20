/**
 * Generic Storage Service Interface
 * 
 * Provides an asynchronous abstraction over underlying persistence layers
 * (e.g. LocalStorage, IndexedDB, SQLite via Capacitor/Tauri, or Cloud Sync)
 * to ensure that components and services are not tightly coupled to any single
 * storage mechanism.
 */

export interface IStorageService<T extends { id: string }> {
  /**
   * Retrieve all items in the collection
   */
  getAll(): Promise<T[]>;

  /**
   * Retrieve a specific item by its unique ID
   */
  getById(id: string): Promise<T | null>;

  /**
   * Save or update a single item
   */
  save(item: T): Promise<T>;

  /**
   * Save or replace multiple items at once
   */
  saveAll(items: T[]): Promise<T[]>;

  /**
   * Delete an item by its unique ID
   */
  remove(id: string): Promise<boolean>;

  /**
   * Clear all items in the collection
   */
  clear(): Promise<void>;
}
