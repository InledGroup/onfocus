import { StoragePort } from '../../../core/ports/StoragePort';
import { AlarmPort } from '../../../core/ports/AlarmPort';
import { TimePort } from '../../../core/ports/TimePort';
import { PomodoroState, PomodoroStatus, PomodoroConfig } from '../domain/types';

export class PomodoroService {
  private readonly STORAGE_KEY = 'pomodoro_state';
  private readonly ALARM_NAME = 'pomodoro_timer';

  private readonly DEFAULT_STATE: PomodoroState = {
    status: 'idle',
    startTime: null,
    durationMs: 0,
    currentCycle: 0,
    config: { workMinutes: 25, breakMinutes: 5, totalCycles: 1 }
  };

  constructor(
    private storage: StoragePort,
    private alarms: AlarmPort,
    private timeProvider: TimePort
  ) {}

  async getState(): Promise<PomodoroState> {
    const state = await this.storage.get<PomodoroState>(this.STORAGE_KEY);
    if (!state) return this.DEFAULT_STATE;
    
    return {
      ...this.DEFAULT_STATE,
      ...state,
      config: {
        ...this.DEFAULT_STATE.config,
        ...(state.config || {})
      }
    };
  }

  async startWork(minutes?: number): Promise<void> {
    const state = await this.getState();
    const workMinutes = minutes || state.config.workMinutes;
    const newState: PomodoroState = {
      ...state,
      status: 'work',
      startTime: this.timeProvider.now(),
      durationMs: workMinutes * 60 * 1000,
      currentCycle: state.status === 'idle' ? 1 : state.currentCycle
    };
    await this.storage.set(this.STORAGE_KEY, newState);
    this.alarms.create(this.ALARM_NAME, workMinutes);
  }

  async startBreak(minutes?: number): Promise<void> {
    const state = await this.getState();
    const breakMinutes = minutes || state.config.breakMinutes;
    const newState: PomodoroState = {
      ...state,
      status: 'break',
      startTime: this.timeProvider.now(),
      durationMs: breakMinutes * 60 * 1000
    };
    await this.storage.set(this.STORAGE_KEY, newState);
    this.alarms.create(this.ALARM_NAME, breakMinutes);
  }

  async stop(): Promise<void> {
    const state = await this.getState();
    const newState: PomodoroState = { 
      ...state, 
      status: 'idle', 
      startTime: null,
      currentCycle: 0 
    };
    await this.storage.set(this.STORAGE_KEY, newState);
    this.alarms.clear(this.ALARM_NAME);
  }

  async updateConfig(config: Partial<PomodoroConfig>): Promise<void> {
    const state = await this.getState();
    const newState: PomodoroState = {
      ...state,
      config: { ...state.config, ...config }
    };
    await this.storage.set(this.STORAGE_KEY, newState);
  }
}
