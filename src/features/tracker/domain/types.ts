export interface SiteSession {
  url: string;
  startTime: number;
  durationMs: number;
}

export interface DailyStats {
  [date: string]: {
    [url: string]: number; // Total duration in ms
  }
}

export interface TrackerState {
  currentSession: SiteSession | null;
  dailyStats: DailyStats;
  alerts: SiteAlert[];
}

export interface SiteAlert {
  url: string;
  limitMinutes: number;
  lastNotified?: number;
}
