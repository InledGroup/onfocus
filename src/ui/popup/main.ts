import { PomodoroState } from '../../features/pomodoro/domain/types';
import { getTranslation, Language } from '../common/i18n';

const statusText = document.getElementById('status-text')!;
const timerDisplay = document.getElementById('timer-display')!;
const toggleBtn = document.getElementById('toggle-focus')!;
const settingsBtn = document.getElementById('settings-btn')!;
const modeIndicator = document.getElementById('mode-indicator')!;
const body = document.getElementById('popup-body')!;
const progressBar = document.getElementById('progress-bar') as unknown as SVGCircleElement;

const CIRCLE_RADIUS = 74;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS; // 464.95

let currentLang: Language = 'es';

async function refreshState() {
  const concentrationState = await chrome.runtime.sendMessage({ type: 'GET_CONCENTRATION_STATE' });
  const pomodoroState: PomodoroState = await chrome.runtime.sendMessage({ type: 'GET_POMODORO_STATE' });

  currentLang = concentrationState.config.language || 'es';

  if (concentrationState.isActive) {
    body.classList.add('active-mode');
    timerDisplay.classList.remove('hidden');
    
    if (pomodoroState.status === 'work') {
      body.classList.remove('break-mode');
      statusText.innerText = getTranslation(currentLang, 'studying');
      modeIndicator.innerText = getTranslation(currentLang, 'mode_study');
    } else if (pomodoroState.status === 'break') {
      body.classList.add('break-mode');
      statusText.innerText = getTranslation(currentLang, 'resting');
      modeIndicator.innerText = getTranslation(currentLang, 'mode_relax');
    } else {
      body.classList.remove('break-mode');
      statusText.innerText = getTranslation(currentLang, 'focused');
      modeIndicator.innerText = getTranslation(currentLang, 'mode_active');
    }
    
    if (pomodoroState.status !== 'idle' && pomodoroState.startTime) {
      updateTimerUI(pomodoroState);
    } else {
      timerDisplay.innerText = '--:--';
      setProgress(0);
    }
  } else {
    body.classList.remove('active-mode', 'break-mode');
    statusText.innerText = getTranslation(currentLang, 'concentrate');
    timerDisplay.classList.add('hidden');
    modeIndicator.innerText = getTranslation(currentLang, 'mode_free');
    setProgress(0);
  }
}

function setProgress(percent: number) {
  const offset = CIRCLE_CIRCUMFERENCE - (percent / 100) * CIRCLE_CIRCUMFERENCE;
  if (progressBar) {
    progressBar.style.strokeDashoffset = offset.toString();
  }
}

function updateTimerUI(state: PomodoroState) {
  const now = Date.now();
  const elapsed = now - state.startTime!;
  const remaining = Math.max(0, state.durationMs - elapsed);
  
  const minutes = Math.floor(remaining / 1000 / 60);
  const seconds = Math.floor((remaining / 1000) % 60);
  
  timerDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  const progressPercent = (remaining / state.durationMs) * 100;
  setProgress(progressPercent);
}

// Escuchar cambios desde el background
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'POMODORO_SWITCHED') {
    refreshState();
  }
});

// Timer loop local para suavidad
setInterval(async () => {
  const concentrationState = await chrome.runtime.sendMessage({ type: 'GET_CONCENTRATION_STATE' });
  if (concentrationState.isActive) {
    const pomodoroState: PomodoroState = await chrome.runtime.sendMessage({ type: 'GET_POMODORO_STATE' });
    if (pomodoroState.status !== 'idle' && pomodoroState.startTime) {
      updateTimerUI(pomodoroState);
    }
  }
}, 1000);

toggleBtn.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'TOGGLE_FOCUS' });
  refreshState();
});

settingsBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

refreshState();
