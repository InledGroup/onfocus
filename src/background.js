import { ChromeStorageAdapter } from './core/infrastructure/ChromeStorageAdapter';
import { RealTimeAdapter } from './core/infrastructure/RealTimeAdapter';
import { ChromeAlarmAdapter } from './core/infrastructure/ChromeAlarmAdapter';
import { ConcentrationService } from './features/concentration/application/ConcentrationService';
import { TrackerService } from './features/tracker/application/TrackerService';
import { PomodoroService } from './features/pomodoro/application/PomodoroService';
import { getTranslation } from './ui/common/i18n';
const storage = new ChromeStorageAdapter();
const time = new RealTimeAdapter();
const alarms = new ChromeAlarmAdapter();
const concentrationService = new ConcentrationService(storage);
const trackerService = new TrackerService(storage, time);
const pomodoroService = new PomodoroService(storage, alarms, time);
// Función centralizada para notificaciones híbridas (Sistema + Toast en pestañas)
async function notifyUser(titleKey, messageKey, params = {}) {
    const state = await concentrationService.getState();
    const lang = state.config.language || 'es';
    const title = getTranslation(lang, titleKey, params);
    const message = getTranslation(lang, messageKey, params);
    const iconPath = 'icons/onfocus-logo.png';
    // 1. Notificación de Sistema (Chrome)
    try {
        chrome.notifications.create(`onfocus_${Date.now()}`, {
            type: 'basic',
            iconUrl: iconPath,
            title: title,
            message: message,
            priority: 2,
            requireInteraction: false
        }, (id) => {
            if (chrome.runtime.lastError) {
                chrome.notifications.create(`onfocus_fallback_${Date.now()}`, {
                    type: 'basic',
                    iconUrl: '',
                    title: title,
                    message: message,
                    priority: 2
                });
            }
        });
    }
    catch (e) {
        console.error('Failed to create system notification:', e);
    }
    // 2. Notificación Toast en TODAS las pestañas visibles
    try {
        const tabs = await chrome.tabs.query({ status: 'complete' });
        tabs.forEach(tab => {
            if (tab.id && tab.url && !tab.url.startsWith('chrome://')) {
                chrome.tabs.sendMessage(tab.id, {
                    type: 'SHOW_TOAST',
                    title: title,
                    message: message
                }).catch(() => { });
            }
        });
    }
    catch (e) {
        console.error('Failed to send Toast messages:', e);
    }
    // 3. Notificación interna para Opciones/Popup abiertos
    chrome.runtime.sendMessage({
        type: 'INTERNAL_NOTIFICATION',
        title,
        message
    }).catch(() => { });
}
// Función para notificar a todas las pestañas que el bloqueo debe cesar (descanso)
async function removeOverlaysFromAllTabs() {
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
        if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { type: 'REMOVE_OVERLAY' }).catch(() => { });
        }
    });
}
// Alarma para Pomodoro y Checkpoints de tiempo
alarms.onAlarm(async (name) => {
    if (name === 'pomodoro_timer') {
        const state = await concentrationService.getState();
        const pomState = await pomodoroService.getState();
        if (pomState.status === 'work') {
            if (pomState.currentCycle >= pomState.config.totalCycles) {
                await pomodoroService.stop();
                await concentrationService.toggleActive();
                await notifyUser('notif_finish_title', 'notif_finish_msg', { total: pomState.config.totalCycles });
                chrome.runtime.sendMessage({ type: 'POMODORO_SWITCHED', status: 'idle' }).catch(() => { });
                await removeOverlaysFromAllTabs();
            }
            else {
                await pomodoroService.startBreak(state.config.pomodoroMinutes);
                await notifyUser('notif_break_title', 'notif_break_msg');
                chrome.runtime.sendMessage({ type: 'POMODORO_SWITCHED', status: 'break' }).catch(() => { });
                await removeOverlaysFromAllTabs();
            }
        }
        else if (pomState.status === 'break') {
            const nextCycle = (pomState.currentCycle || 0) + 1;
            await pomodoroService.startWork(state.config.studyMinutes);
            const updatedState = await pomodoroService.getState();
            await storage.set('pomodoro_state', { ...updatedState, currentCycle: nextCycle });
            await notifyUser('notif_study_title', 'notif_study_msg', { current: nextCycle, total: pomState.config.totalCycles });
            chrome.runtime.sendMessage({ type: 'POMODORO_SWITCHED', status: 'work' }).catch(() => { });
        }
    }
    else if (name === 'tracker_checkpoint') {
        await trackerService.updateCurrentSessionDuration();
        await checkAlerts();
    }
});
// Crear alarmas de forma robusta
chrome.alarms.create('tracker_checkpoint', { periodInMinutes: 1 });
chrome.runtime.onInstalled.addListener(async (details) => {
    const state = await concentrationService.getState();
    if (details.reason === 'install' || !state.config.wizardCompleted) {
        chrome.tabs.create({ url: chrome.runtime.getURL('src/ui/wizard/index.html') });
    }
});
// Rastreo de pestañas
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab?.url) {
        await trackerService.startSession(tab.url);
        await checkAndBlock(activeInfo.tabId, tab.url);
    }
});
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if ((changeInfo.url || changeInfo.status === 'complete') && tab.active) {
        await trackerService.startSession(tab.url);
        await checkAndBlock(tabId, tab.url);
    }
});
chrome.windows.onFocusChanged.addListener(async (windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        await trackerService.endSession();
    }
    else {
        try {
            const [tab] = await chrome.tabs.query({ active: true, windowId: windowId });
            if (tab?.url) {
                await trackerService.startSession(tab.url);
            }
        }
        catch (e) { }
    }
});
// Manejo de estado inactivo
chrome.idle.onStateChanged.addListener(async (newState) => {
    if (newState === 'idle' || newState === 'locked') {
        await trackerService.endSession();
    }
    else {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.url) {
            await trackerService.startSession(tab.url);
        }
    }
});
async function checkAlerts() {
    const state = await trackerService.getState();
    if (state.currentSession) {
        const today = time.todayKey();
        const cleanUrl = state.currentSession.url;
        const currentDurationMs = state.dailyStats[today]?.[cleanUrl] || 0;
        const alert = state.alerts.find(a => a.url === cleanUrl);
        if (alert && currentDurationMs > alert.limitMinutes * 60 * 1000) {
            if (!alert.lastNotified || (Date.now() - alert.lastNotified > 5 * 60 * 1000)) {
                await notifyUser('notif_limit_title', 'notif_limit_msg', { min: alert.limitMinutes, url: cleanUrl });
                await trackerService.setAlert(cleanUrl, alert.limitMinutes, Date.now());
            }
        }
    }
}
async function checkAndBlock(tabId, url) {
    const pomState = await pomodoroService.getState();
    const isBreak = pomState.status === 'break';
    const blockConfig = await concentrationService.checkUrl(url, isBreak);
    if (blockConfig) {
        if (blockConfig.type === 'block') {
            const blockedUrl = chrome.runtime.getURL('src/ui/common/blocked.html');
            chrome.tabs.update(tabId, { url: blockedUrl });
        }
        else if (blockConfig.type === 'countdown') {
            const state = await concentrationService.getState();
            const lang = state.config.language || 'es';
            chrome.tabs.sendMessage(tabId, {
                type: 'SHOW_OVERLAY',
                config: blockConfig,
                lang: lang
            });
        }
    }
}
// Escuchar mensajes desde el popup u opciones
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_POMODORO_STATE') {
        pomodoroService.getState().then(sendResponse);
        return true;
    }
    if (message.type === 'START_WORK') {
        pomodoroService.startWork().then(sendResponse);
        return true;
    }
    if (message.type === 'STOP_POMODORO') {
        pomodoroService.stop().then(sendResponse);
        return true;
    }
    if (message.type === 'TOGGLE_FOCUS') {
        (async () => {
            const isActive = await concentrationService.toggleActive();
            const state = await concentrationService.getState();
            if (isActive && state.config.isPomodoroEnabled) {
                await pomodoroService.startWork(state.config.studyMinutes);
            }
            else {
                await pomodoroService.stop();
                await removeOverlaysFromAllTabs();
            }
            sendResponse(isActive);
        })();
        return true;
    }
    if (message.type === 'GET_CONCENTRATION_STATE') {
        concentrationService.getState().then(sendResponse);
        return true;
    }
    if (message.type === 'SET_CONCENTRATION_CONFIG') {
        concentrationService.setConfig(message.config).then(sendResponse);
        return true;
    }
    if (message.type === 'UPDATE_POMODORO_CONFIG') {
        pomodoroService.updateConfig(message.config).then(sendResponse);
        return true;
    }
    if (message.type === 'ADD_TO_BLACKLIST') {
        concentrationService.addToBlacklist(message.site).then(sendResponse);
        return true;
    }
    if (message.type === 'REMOVE_FROM_BLACKLIST') {
        concentrationService.removeFromBlacklist(message.url).then(sendResponse);
        return true;
    }
    if (message.type === 'MARK_WIZARD_COMPLETED') {
        concentrationService.markWizardCompleted().then(sendResponse);
        return true;
    }
    if (message.type === 'SET_ALERT') {
        trackerService.setAlert(message.url, message.limitMinutes).then(sendResponse);
        return true;
    }
    if (message.type === 'TEST_NOTIFICATION') {
        notifyUser('notif_study_title', 'notif_study_msg', { current: 1, total: 1 });
        return true;
    }
});
