export type BlockType = 'block' | 'countdown';

export interface SiteConfig {
  url: string;
  type: BlockType;
  countdownSeconds?: number;
}

import { Language } from '../../../ui/common/i18n';

export interface ConcentrationConfig {
  studyMinutes: number;
  pomodoroMinutes: number;
  isPomodoroEnabled: boolean;
  wizardCompleted: boolean;
  language: Language;
}

export interface ConcentrationState {
  isActive: boolean;
  blacklist: SiteConfig[];
  config: ConcentrationConfig;
}

export interface ConcentrationDomain {
  isUrlBlacklisted(url: string, blacklist: SiteConfig[]): SiteConfig | null;
}
