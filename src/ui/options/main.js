import './style.css';
import { showToastNotification } from '../common/toast';
import { getTranslation } from '../common/i18n';
import { ICONS } from '../common/icons';
let currentLang = 'es';
let lastConcentrationState = null;
// Escuchar notificaciones internas para mostrar Toasts en esta página
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'INTERNAL_NOTIFICATION') {
        showToastNotification(message.title, message.message);
    }
});
// Elementos de UI para traducción
const optTitle = document.querySelector('header h1');
const optSubtitle = document.querySelector('header p');
const langSectionTitle = document.querySelector('section:nth-of-type(1) h2');
const timeSectionTitle = document.querySelector('section:nth-of-type(2) h2');
const labelStudy = document.querySelector('label[for="study-mins"]');
const labelBreak = document.querySelector('label[for="pomodoro-mins"]');
const labelReps = document.querySelector('label[for="total-cycles"]');
const labelAutoPom = document.querySelector('label[for="enable-pomodoro"]');
const btnSave = document.getElementById('save-config');
const sitesSectionTitle = document.querySelector('section:nth-of-type(3) h2');
const btnAddSite = document.getElementById('add-btn');
const alertsSectionTitle = document.querySelector('section:nth-of-type(4) h2');
const btnAddAlert = document.getElementById('add-alert-btn');
const debugSectionTitle = document.querySelector('section:nth-of-type(5) h2');
const debugDesc = document.querySelector('section:nth-of-type(5) p');
const btnTestNotify = document.getElementById('test-notify');
const statsSectionTitle = document.querySelector('section:nth-of-type(6) h2');
function applyTranslations() {
    if (optTitle)
        optTitle.innerText = getTranslation(currentLang, 'opt_title');
    if (optSubtitle)
        optSubtitle.innerText = getTranslation(currentLang, 'opt_subtitle');
    if (langSectionTitle)
        langSectionTitle.innerText = getTranslation(currentLang, 'opt_lang');
    if (timeSectionTitle)
        timeSectionTitle.innerText = getTranslation(currentLang, 'opt_time_section');
    if (labelStudy)
        labelStudy.innerText = getTranslation(currentLang, 'opt_study_time');
    if (labelBreak)
        labelBreak.innerText = getTranslation(currentLang, 'opt_break_time');
    if (labelReps)
        labelReps.innerText = getTranslation(currentLang, 'opt_reps');
    if (labelAutoPom)
        labelAutoPom.innerText = getTranslation(currentLang, 'opt_auto_pom');
    if (btnSave)
        btnSave.innerText = getTranslation(currentLang, 'opt_save');
    if (sitesSectionTitle)
        sitesSectionTitle.innerText = getTranslation(currentLang, 'opt_sites_section');
    if (btnAddSite)
        btnAddSite.innerText = getTranslation(currentLang, 'opt_add');
    if (alertsSectionTitle)
        alertsSectionTitle.innerText = getTranslation(currentLang, 'opt_alerts_section');
    if (btnAddAlert)
        btnAddAlert.innerText = getTranslation(currentLang, 'opt_add_alert');
    if (debugSectionTitle)
        debugSectionTitle.innerText = getTranslation(currentLang, 'opt_debug_section');
    if (debugDesc)
        debugDesc.innerText = getTranslation(currentLang, 'opt_debug_desc');
    if (btnTestNotify)
        btnTestNotify.innerText = getTranslation(currentLang, 'opt_test_notif');
    if (statsSectionTitle)
        statsSectionTitle.innerText = getTranslation(currentLang, 'opt_stats_section');
    const statsSearch = document.getElementById('stats-search');
    if (statsSearch)
        statsSearch.placeholder = getTranslation(currentLang, 'opt_stats_search');
    // Inputs placeholders
    const urlInput = document.getElementById('add-url');
    if (urlInput)
        urlInput.placeholder = 'example.com';
    const alertUrlInput = document.getElementById('alert-url');
    if (alertUrlInput)
        alertUrlInput.placeholder = 'example.com';
    const alertMinsInput = document.getElementById('alert-mins');
    if (alertMinsInput)
        alertMinsInput.placeholder = getTranslation(currentLang, 'opt_alert_min');
    // Select options
    const blockTypeSelect = document.getElementById('block-type');
    if (blockTypeSelect) {
        blockTypeSelect.options[0].text = currentLang === 'es' ? 'Bloquear' : 'Block';
        blockTypeSelect.options[1].text = currentLang === 'es' ? 'Temporizar' : 'Countdown';
    }
}
// Elementos de Configuración
const langSelect = document.getElementById('lang-select');
const studyMinsInput = document.getElementById('study-mins');
const pomodoroMinsInput = document.getElementById('pomodoro-mins');
const totalCyclesInput = document.getElementById('total-cycles');
const enablePomodoroCheck = document.getElementById('enable-pomodoro');
const saveConfigBtn = document.getElementById('save-config');
// Elementos de Páginas Restringidas
const blacklistContainer = document.getElementById('blacklist-container');
const addUrlInput = document.getElementById('add-url');
const blockTypeSelect = document.getElementById('block-type');
const addBtn = document.getElementById('add-btn');
// Elementos de Alertas
const alertsContainer = document.getElementById('alerts-container');
const alertUrlInput = document.getElementById('alert-url');
const alertMinsInput = document.getElementById('alert-mins');
const addAlertBtn = document.getElementById('add-alert-btn');
// Elementos de Estadísticas
const statsContainer = document.getElementById('stats-container');
const statsSearchInput = document.getElementById('stats-search');
let cachedStats = {};
let cachedFavicons = {};
async function loadOptions() {
    const state = await chrome.runtime.sendMessage({ type: 'GET_CONCENTRATION_STATE' });
    const pomodoroState = await chrome.runtime.sendMessage({ type: 'GET_POMODORO_STATE' });
    lastConcentrationState = state;
    currentLang = state.config.language || 'es';
    langSelect.value = currentLang;
    // Cargar Configuración de Tiempo
    studyMinsInput.value = state.config.studyMinutes.toString();
    pomodoroMinsInput.value = state.config.pomodoroMinutes.toString();
    totalCyclesInput.value = (pomodoroState.config?.totalCycles || 1).toString();
    enablePomodoroCheck.checked = state.config.isPomodoroEnabled;
    // Cargar Lista Negra
    renderBlacklist(state.blacklist);
    // Cargar Alertas y Estadísticas desde el tracker
    const trackerData = await chrome.storage.local.get('tracker_state');
    const trackerState = trackerData.tracker_state;
    const alerts = trackerState?.alerts || [];
    renderAlerts(alerts);
    cachedStats = trackerState?.dailyStats || {};
    cachedFavicons = trackerState?.favicons || {};
    renderStats();
    applyTranslations();
}
function renderBlacklist(blacklist) {
    blacklistContainer.innerHTML = '';
    blacklist.forEach(site => {
        const item = document.createElement('div');
        item.className = 'blacklist-item';
        const modeText = site.type === 'block'
            ? (currentLang === 'es' ? 'Bloqueo' : 'Block')
            : (currentLang === 'es' ? 'Cuenta atrás' : 'Countdown');
        item.innerHTML = `
      <span><strong>${site.url}</strong> (${currentLang === 'es' ? 'Modo' : 'Mode'}: ${modeText})</span>
      <button class="remove-btn" data-url="${site.url}" title="${currentLang === 'es' ? 'Eliminar' : 'Remove'}">
        ${ICONS.trash2}
      </button>
    `;
        blacklistContainer.appendChild(item);
    });
    document.querySelectorAll('#blacklist-container .remove-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const btnEl = e.target.closest('.remove-btn');
            const url = btnEl?.dataset.url;
            if (url) {
                await chrome.runtime.sendMessage({ type: 'REMOVE_FROM_BLACKLIST', url });
                loadOptions();
            }
        });
    });
}
function renderAlerts(alerts) {
    alertsContainer.innerHTML = '';
    alerts.forEach(alert => {
        const item = document.createElement('div');
        item.className = 'blacklist-item';
        item.innerHTML = `
      <span><strong>${alert.url}</strong>: ${currentLang === 'es' ? 'Límite de' : 'Limit:'} ${alert.limitMinutes} ${currentLang === 'es' ? 'min/día' : 'min/day'}</span>
      <button class="remove-alert-btn remove-btn" data-url="${alert.url}" title="${currentLang === 'es' ? 'Eliminar' : 'Remove'}">
        ${ICONS.trash2}
      </button>
    `;
        alertsContainer.appendChild(item);
    });
    document.querySelectorAll('.remove-alert-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const btnEl = e.target.closest('.remove-btn');
            const url = btnEl?.dataset.url;
            if (url) {
                await chrome.runtime.sendMessage({ type: 'SET_ALERT', url, limitMinutes: 0 });
                loadOptions();
            }
        });
    });
}
function renderStats() {
    statsContainer.innerHTML = '';
    const today = new Date().toISOString().split('T')[0];
    const todayStats = cachedStats[today] || {};
    const searchTerm = statsSearchInput.value.toLowerCase();
    // Filter by: search term AND duration >= 5 minutes
    const filteredStats = Object.entries(todayStats)
        .filter(([url, durationMs]) => {
        const matchesSearch = url.toLowerCase().includes(searchTerm);
        const isEnoughTime = durationMs >= 5 * 60 * 1000;
        return matchesSearch && isEnoughTime;
    })
        .sort((a, b) => b[1] - a[1]);
    const totalFilteredMs = filteredStats.reduce((acc, [_, durationMs]) => acc + durationMs, 0);
    const totalMins = Math.floor(totalFilteredMs / 1000 / 60);
    if (filteredStats.length === 0) {
        statsContainer.innerHTML = `<p>${getTranslation(currentLang, 'opt_no_stats')}</p>`;
        return;
    }
    const summary = document.createElement('div');
    summary.className = 'stats-summary';
    summary.innerHTML = `<strong>${getTranslation(currentLang, 'opt_total_today', { min: totalMins })}</strong>`;
    statsContainer.appendChild(summary);
    filteredStats.forEach(([url, durationMs]) => {
        const totalSeconds = Math.floor(durationMs / 1000);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        // Using Chrome favicon service (requires favicon permission in manifest)
        const favicon = `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=https://${url}&size=32`;
        const item = document.createElement('div');
        item.className = 'stat-item';
        item.innerHTML = `
      <div class="stat-info">
        <img src="${favicon}" class="stat-favicon" loading="lazy" onerror="this.src='/icons/onfocus-logo.png'">
        <strong>${url}</strong>
      </div>
      <span class="stat-time">${mins}m ${secs}s</span>
    `;
        statsContainer.appendChild(item);
    });
}
statsSearchInput.addEventListener('input', () => {
    renderStats();
});
langSelect.addEventListener('change', async () => {
    currentLang = langSelect.value;
    // Guardar inmediatamente el cambio de idioma para que persista
    if (lastConcentrationState) {
        const newConfig = { ...lastConcentrationState.config, language: currentLang };
        await chrome.runtime.sendMessage({ type: 'SET_CONCENTRATION_CONFIG', config: newConfig });
    }
    applyTranslations();
    // Recargar datos para actualizar textos de las listas
    loadOptions();
});
saveConfigBtn.addEventListener('click', async () => {
    const config = {
        studyMinutes: parseInt(studyMinsInput.value) || 25,
        pomodoroMinutes: parseInt(pomodoroMinsInput.value) || 5,
        isPomodoroEnabled: enablePomodoroCheck.checked,
        language: currentLang,
        wizardCompleted: true
    };
    await chrome.runtime.sendMessage({ type: 'SET_CONCENTRATION_CONFIG', config });
    const pomodoroConfig = {
        workMinutes: config.studyMinutes,
        breakMinutes: config.pomodoroMinutes,
        totalCycles: parseInt(totalCyclesInput.value) || 1
    };
    await chrome.runtime.sendMessage({ type: 'UPDATE_POMODORO_CONFIG', config: pomodoroConfig });
    alert(getTranslation(currentLang, 'opt_saved_ok'));
});
addBtn.addEventListener('click', async () => {
    const url = addUrlInput.value.trim().toLowerCase();
    if (!url)
        return;
    const type = blockTypeSelect.value;
    const site = { url, type, countdownSeconds: 30 };
    await chrome.runtime.sendMessage({ type: 'ADD_TO_BLACKLIST', site });
    addUrlInput.value = '';
    loadOptions();
});
addAlertBtn.addEventListener('click', async () => {
    const url = alertUrlInput.value.trim().toLowerCase();
    const mins = parseInt(alertMinsInput.value);
    if (!url || isNaN(mins) || mins <= 0)
        return;
    await chrome.runtime.sendMessage({ type: 'SET_ALERT', url, limitMinutes: mins });
    alertUrlInput.value = '';
    alertMinsInput.value = '';
    loadOptions();
});
const testNotifyBtn = document.getElementById('test-notify');
testNotifyBtn?.addEventListener('click', () => {
    chrome.runtime.sendMessage({
        type: 'TEST_NOTIFICATION',
        title: currentLang === 'es' ? 'Notificación de Prueba' : 'Test Notification',
        message: currentLang === 'es'
            ? '¡Genial! Las notificaciones de OnFocus están funcionando correctamente.'
            : 'Great! OnFocus notifications are working correctly.'
    });
});
loadOptions();
// Refrescar cada 10 segundos para ver el tiempo actualizado
setInterval(loadOptions, 10000);
