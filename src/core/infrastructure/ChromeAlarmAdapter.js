export class ChromeAlarmAdapter {
    create(name, delayInMinutes) {
        chrome.alarms.create(name, { delayInMinutes });
    }
    clear(name) {
        chrome.alarms.clear(name);
    }
    onAlarm(callback) {
        chrome.alarms.onAlarm.addListener((alarm) => {
            callback(alarm.name);
        });
    }
}
