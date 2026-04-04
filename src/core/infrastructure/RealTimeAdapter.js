export class RealTimeAdapter {
    now() {
        return Date.now();
    }
    todayKey() {
        const d = new Date();
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    }
}
