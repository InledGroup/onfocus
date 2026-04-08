import { StoragePort } from '../../../core/ports/StoragePort';
import { TimePort } from '../../../core/ports/TimePort';
import { TrackerState, SiteSession, SiteAlert, DailyStats } from '../domain/types';

export class TrackerService {
  private readonly STORAGE_KEY = 'tracker_state';

  constructor(
    private storage: StoragePort,
    private timeProvider: TimePort
  ) {}

  async getState(): Promise<TrackerState> {
    const state = await this.storage.get<TrackerState>(this.STORAGE_KEY);
    const defaultState: TrackerState = { currentSession: null, dailyStats: {}, alerts: [], favicons: {} };
    if (!state) return defaultState;
    
    // Ensure all fields exist
    const currentState: TrackerState = {
      ...defaultState,
      ...state
    };
    
    // Strict Cleanup: keep ONLY today
    const today = this.timeProvider.todayKey();
    if (Object.keys(currentState.dailyStats).length !== 1 || !currentState.dailyStats[today]) {
      const newState: TrackerState = {
        ...currentState,
        dailyStats: currentState.dailyStats[today] ? { [today]: currentState.dailyStats[today] } : {},
        favicons: currentState.dailyStats[today] ? currentState.favicons : {} // Keep favicons only if we kept today's stats
      };
      
      // If we cleared favicons, it's a new day, we start fresh
      if (!currentState.dailyStats[today]) {
        newState.favicons = {};
      }

      await this.storage.set(this.STORAGE_KEY, newState);
      return newState;
    }

    return currentState;
  }

  async setFavicon(url: string, faviconUrl: string): Promise<void> {
    const state = await this.getState();
    const cleanUrl = this.getHostname(url);
    
    // Don't update if already set to something valid (not chrome-extension fallback)
    if (state.favicons[cleanUrl] && !state.favicons[cleanUrl].startsWith('chrome-extension://')) return;
    if (!faviconUrl) return;

    const newState: TrackerState = {
      ...state,
      favicons: {
        ...state.favicons,
        [cleanUrl]: faviconUrl
      }
    };
    await this.storage.set(this.STORAGE_KEY, newState);
  }

  async startSession(url: string): Promise<void> {
    if (url.startsWith('chrome://') || url.startsWith('edge://') || url.startsWith('about:') || url.startsWith('chrome-extension://')) {
      await this.endSession();
      return;
    }

    const state = await this.getState();
    const cleanUrl = this.getHostname(url);
    
    if (state.currentSession?.url === cleanUrl) return;

    if (state.currentSession) {
      await this.endSession();
    }

    const updatedState = await this.getState();
    const newState: TrackerState = {
      ...updatedState,
      currentSession: {
        url: cleanUrl,
        startTime: this.timeProvider.now(),
        durationMs: 0
      }
    };
    await this.storage.set(this.STORAGE_KEY, newState);
  }

  async endSession(): Promise<void> {
    const state = await this.getState();
    if (!state.currentSession) return;

    const now = this.timeProvider.now();
    const duration = now - state.currentSession.startTime;
    const today = this.timeProvider.todayKey();
    const url = state.currentSession.url;

    const dailyStats = { ...state.dailyStats };
    if (!dailyStats[today]) dailyStats[today] = {};
    dailyStats[today][url] = (dailyStats[today][url] || 0) + duration;

    const newState: TrackerState = {
      ...state,
      currentSession: null,
      dailyStats
    };
    await this.storage.set(this.STORAGE_KEY, newState);
  }

  async updateCurrentSessionDuration(): Promise<void> {
    const state = await this.getState();
    if (!state.currentSession) return;

    const now = this.timeProvider.now();
    const duration = now - state.currentSession.startTime;
    const today = this.timeProvider.todayKey();
    const url = state.currentSession.url;

    const dailyStats = { ...state.dailyStats };
    if (!dailyStats[today]) dailyStats[today] = {};
    dailyStats[today][url] = (dailyStats[today][url] || 0) + duration;

    const newState: TrackerState = {
      ...state,
      currentSession: {
        ...state.currentSession,
        startTime: now
      },
      dailyStats
    };
    await this.storage.set(this.STORAGE_KEY, newState);
  }

  async setAlert(url: string, limitMinutes: number, lastNotified?: number): Promise<void> {
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

  private getHostname(url: string): string {
    try {
      if (url.includes('://')) {
        const hostname = new URL(url).hostname;
        return hostname.startsWith('www.') ? hostname.slice(4) : hostname;
      }
      return url.startsWith('www.') ? url.slice(4) : url;
    } catch (e) {
      return url;
    }
  }
}
