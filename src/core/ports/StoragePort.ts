export interface StoragePort {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  onChanged<T>(callback: (changes: Record<string, T>) => void): void;
}
