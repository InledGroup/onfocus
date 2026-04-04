export type PomodoroStatus = 'idle' | 'work' | 'break';

export interface PomodoroState {
  status: PomodoroStatus;
  startTime: number | null;
  durationMs: number;
  currentCycle: number;
  config: PomodoroConfig;
}

export interface PomodoroConfig {
  workMinutes: number;
  breakMinutes: number;
  totalCycles: number;
}
