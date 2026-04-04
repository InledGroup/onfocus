import { StoragePort } from '../ports/StoragePort';

export class ChromeStorageAdapter implements StoragePort {
  async get<T>(key: string): Promise<T | null> {
    const result = await chrome.storage.local.get(key);
    return (result[key] as T) || null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    await chrome.storage.local.set({ [key]: value });
  }

  onChanged<T>(callback: (changes: Record<string, T>) => void): void {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        const mappedChanges: Record<string, T> = {};
        for (const [key, change] of Object.entries(changes)) {
          mappedChanges[key] = change.newValue as T;
        }
        callback(mappedChanges);
      }
    });
  }
}
