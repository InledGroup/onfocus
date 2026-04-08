import { ConcentrationLogic } from '../domain/ConcentrationLogic';
export class ConcentrationService {
    storage;
    STORAGE_KEY = 'concentration_state';
    DEFAULT_STATE = {
        isActive: false,
        blacklist: [],
        config: {
            studyMinutes: 25,
            pomodoroMinutes: 5,
            isPomodoroEnabled: true,
            wizardCompleted: false,
            language: 'es'
        }
    };
    constructor(storage) {
        this.storage = storage;
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
    async setActive(isActive) {
        const state = await this.getState();
        await this.storage.set(this.STORAGE_KEY, { ...state, isActive });
    }
    async markWizardCompleted() {
        const state = await this.getState();
        await this.setConfig({ ...state.config, wizardCompleted: true });
    }
    async setConfig(config) {
        const state = await this.getState();
        await this.storage.set(this.STORAGE_KEY, { ...state, config });
    }
    async toggleActive() {
        const state = await this.getState();
        const newState = { ...state, isActive: !state.isActive };
        await this.storage.set(this.STORAGE_KEY, newState);
        return newState.isActive;
    }
    async addToBlacklist(site) {
        const state = await this.getState();
        const blacklist = [...state.blacklist, site];
        await this.storage.set(this.STORAGE_KEY, { ...state, blacklist });
    }
    async removeFromBlacklist(url) {
        const state = await this.getState();
        const blacklist = state.blacklist.filter(s => s.url !== url);
        await this.storage.set(this.STORAGE_KEY, { ...state, blacklist });
    }
    async checkUrl(url, isPomodoroBreak = false) {
        const state = await this.getState();
        if (!state.isActive || isPomodoroBreak)
            return null;
        return ConcentrationLogic.isUrlBlacklisted(url, state.blacklist);
    }
}
