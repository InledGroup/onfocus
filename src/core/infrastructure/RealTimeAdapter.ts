import { TimePort } from '../ports/TimePort';

export class RealTimeAdapter implements TimePort {
  now(): number {
    return Date.now();
  }

  todayKey(): string {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  }
}
