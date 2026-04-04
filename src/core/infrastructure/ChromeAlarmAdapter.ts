import { AlarmPort } from '../ports/AlarmPort';

export class ChromeAlarmAdapter implements AlarmPort {
  create(name: string, delayInMinutes: number): void {
    chrome.alarms.create(name, { delayInMinutes });
  }

  clear(name: string): void {
    chrome.alarms.clear(name);
  }

  onAlarm(callback: (name: string) => void): void {
    chrome.alarms.onAlarm.addListener((alarm) => {
      callback(alarm.name);
    });
  }
}
