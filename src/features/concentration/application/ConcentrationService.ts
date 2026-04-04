import { StoragePort } from '../../../core/ports/StoragePort';
import { ConcentrationLogic } from '../domain/ConcentrationLogic';
import { ConcentrationState, SiteConfig, ConcentrationConfig } from '../domain/types';

export class ConcentrationService {
  private readonly STORAGE_KEY = 'concentration_state';

  private readonly DEFAULT_STATE: ConcentrationState = {
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

  constructor(private storage: StoragePort) {}

  async getState(): Promise<ConcentrationState> {
    const state = await this.storage.get<ConcentrationState>(this.STORAGE_KEY);
    if (!state) return this.DEFAULT_STATE;
    
    // Merge para asegurar que existen las nuevas propiedades (config, etc)
    return {
      ...this.DEFAULT_STATE,
      ...state,
      config: {
        ...this.DEFAULT_STATE.config,
        ...(state.config || {})
      }
    };
  }

  async markWizardCompleted(): Promise<void> {
    const state = await this.getState();
    await this.setConfig({ ...state.config, wizardCompleted: true });
  }

  async setConfig(config: ConcentrationConfig): Promise<void> {
    const state = await this.getState();
    await this.storage.set(this.STORAGE_KEY, { ...state, config });
  }

  async toggleActive(): Promise<boolean> {
    const state = await this.getState();
    const newState = { ...state, isActive: !state.isActive };
    await this.storage.set(this.STORAGE_KEY, newState);
    return newState.isActive;
  }

  async addToBlacklist(site: SiteConfig): Promise<void> {
    const state = await this.getState();
    const blacklist = [...state.blacklist, site];
    await this.storage.set(this.STORAGE_KEY, { ...state, blacklist });
  }

  async removeFromBlacklist(url: string): Promise<void> {
    const state = await this.getState();
    const blacklist = state.blacklist.filter(s => s.url !== url);
    await this.storage.set(this.STORAGE_KEY, { ...state, blacklist });
  }

  async checkUrl(url: string, isPomodoroBreak: boolean = false): Promise<SiteConfig | null> {
    const state = await this.getState();
    if (!state.isActive || isPomodoroBreak) return null;
    return ConcentrationLogic.isUrlBlacklisted(url, state.blacklist);
  }
}
