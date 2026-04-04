export interface AlarmPort {
  create(name: string, delayInMinutes: number): void;
  clear(name: string): void;
  onAlarm(callback: (name: string) => void): void;
}
