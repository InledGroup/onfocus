export class PomodoroService {
    storage;
    alarms;
    timeProvider;
    STORAGE_KEY = 'pomodoro_state';
    ALARM_NAME = 'pomodoro_timer';
    DEFAULT_STATE = {
        status: 'idle',
        startTime: null,
        durationMs: 0,
        currentCycle: 0,
        config: { workMinutes: 25, breakMinutes: 5, totalCycles: 1 }
    };
    constructor(storage, alarms, timeProvider) {
        this.storage = storage;
        this.alarms = alarms;
        this.timeProvider = timeProvider;
    }
    async getState() {
        const state = await this.storage.get(this.STORAGE_KEY);
        if (!state)
            return this.DEFAULT_STATE;
        return {
            ...this.DEFAULT_STATE,
            ...state,
            config: {
                ...this.DEFAULT_STATE.config,
                ...(state.config || {})
            }
        };
    }
    async startWork(minutes) {
        const state = await this.getState();
        const workMinutes = minutes || state.config.workMinutes;
        const newState = {
            ...state,
            status: 'work',
            startTime: this.timeProvider.now(),
            durationMs: workMinutes * 60 * 1000,
            currentCycle: state.status === 'idle' ? 1 : state.currentCycle
        };
        await this.storage.set(this.STORAGE_KEY, newState);
        this.alarms.create(this.ALARM_NAME, workMinutes);
    }
    async startBreak(minutes) {
        const state = await this.getState();
        const breakMinutes = minutes || state.config.breakMinutes;
        const newState = {
            ...state,
            status: 'break',
            startTime: this.timeProvider.now(),
            durationMs: breakMinutes * 60 * 1000
        };
        await this.storage.set(this.STORAGE_KEY, newState);
        this.alarms.create(this.ALARM_NAME, breakMinutes);
    }
    async stop() {
        const state = await this.getState();
        const newState = {
            ...state,
            status: 'idle',
            startTime: null,
            currentCycle: 0
        };
        await this.storage.set(this.STORAGE_KEY, newState);
        this.alarms.clear(this.ALARM_NAME);
    }
    async updateConfig(config) {
        const state = await this.getState();
        const newState = {
            ...state,
            config: { ...state.config, ...config }
        };
        await this.storage.set(this.STORAGE_KEY, newState);
    }
}
