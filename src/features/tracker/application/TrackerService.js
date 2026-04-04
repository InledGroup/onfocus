export class TrackerService {
    storage;
    timeProvider;
    STORAGE_KEY = 'tracker_state';
    constructor(storage, timeProvider) {
        this.storage = storage;
        this.timeProvider = timeProvider;
    }
    async getState() {
        const state = await this.storage.get(this.STORAGE_KEY);
        return state || { currentSession: null, dailyStats: {}, alerts: [] };
    }
    async startSession(url) {
        if (url.startsWith('chrome://') || url.startsWith('edge://') || url.startsWith('about:') || url.startsWith('chrome-extension://')) {
            await this.endSession();
            return;
        }
        const state = await this.getState();
        const cleanUrl = this.getHostname(url);
        if (state.currentSession?.url === cleanUrl)
            return;
        if (state.currentSession) {
            await this.endSession();
        }
        const updatedState = await this.getState();
        const newState = {
            ...updatedState,
            currentSession: {
                url: cleanUrl,
                startTime: this.timeProvider.now(),
                durationMs: 0
            }
        };
        await this.storage.set(this.STORAGE_KEY, newState);
    }
    async endSession() {
        const state = await this.getState();
        if (!state.currentSession)
            return;
        const now = this.timeProvider.now();
        const duration = now - state.currentSession.startTime;
        const today = this.timeProvider.todayKey();
        const url = state.currentSession.url;
        const dailyStats = { ...state.dailyStats };
        if (!dailyStats[today])
            dailyStats[today] = {};
        dailyStats[today][url] = (dailyStats[today][url] || 0) + duration;
        const newState = {
            ...state,
            currentSession: null,
            dailyStats
        };
        await this.storage.set(this.STORAGE_KEY, newState);
    }
    async updateCurrentSessionDuration() {
        const state = await this.getState();
        if (!state.currentSession)
            return;
        const now = this.timeProvider.now();
        const duration = now - state.currentSession.startTime;
        const today = this.timeProvider.todayKey();
        const url = state.currentSession.url;
        const dailyStats = { ...state.dailyStats };
        if (!dailyStats[today])
            dailyStats[today] = {};
        dailyStats[today][url] = (dailyStats[today][url] || 0) + duration;
        const newState = {
            ...state,
            currentSession: {
                ...state.currentSession,
                startTime: now
            },
            dailyStats
        };
        await this.storage.set(this.STORAGE_KEY, newState);
    }
    async setAlert(url, limitMinutes, lastNotified) {
        const state = await this.getState();
        const cleanUrl = this.getHostname(url);
        const existingAlert = state.alerts.find(a => a.url === cleanUrl);
        const alerts = state.alerts.filter(a => a.url !== cleanUrl);
        if (limitMinutes > 0) {
            alerts.push({
                url: cleanUrl,
                limitMinutes,
                lastNotified: lastNotified ?? existingAlert?.lastNotified
            });
        }
        await this.storage.set(this.STORAGE_KEY, { ...state, alerts });
    }
    getHostname(url) {
        try {
            if (url.includes('://')) {
                const hostname = new URL(url).hostname;
                return hostname.startsWith('www.') ? hostname.slice(4) : hostname;
            }
            return url.startsWith('www.') ? url.slice(4) : url;
        }
        catch (e) {
            return url;
        }
    }
}
