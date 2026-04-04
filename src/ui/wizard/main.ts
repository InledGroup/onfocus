import { SiteConfig, BlockType } from '../../features/concentration/domain/types';
import { getTranslation, Language } from '../common/i18n';

let currentStep = 1;
let currentLang: Language = 'es';
const blacklist: SiteConfig[] = [];

function showStep(step: number) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.getElementById(`step-${step}`)?.classList.add('active');
  currentStep = step;
  applyTranslations();
}

function applyTranslations() {
  // Step 1
  const welcomeTitle = document.querySelector('#step-1 h1') as HTMLElement;
  if (welcomeTitle) welcomeTitle.innerHTML = getTranslation(currentLang, 'wiz_welcome') + ' <span class="highlight">OnFocus</span>';
  const welcomeTagline = document.querySelector('#step-1 p') as HTMLElement;
  if (welcomeTagline) welcomeTagline.innerText = getTranslation(currentLang, 'wiz_tagline');
  const btnStart = document.getElementById('btn-start') as HTMLButtonElement;
  if (btnStart) btnStart.innerText = getTranslation(currentLang, 'wiz_start');

  // Step 2
  const indicator1 = document.querySelector('#step-2 .step-indicator') as HTMLElement;
  if (indicator1) indicator1.innerText = getTranslation(currentLang, 'wiz_step', { current: 1, total: 2 });
  const cyclesTitle = document.querySelector('#step-2 h2') as HTMLElement;
  if (cyclesTitle) cyclesTitle.innerText = getTranslation(currentLang, 'wiz_cycles_title');
  const cyclesDesc = document.querySelector('#step-2 p') as HTMLElement;
  if (cyclesDesc) cyclesDesc.innerText = getTranslation(currentLang, 'wiz_cycles_desc');
  const labelStudy = document.querySelector('label[for="study-time"]') as HTMLElement;
  if (labelStudy) labelStudy.innerText = getTranslation(currentLang, 'wiz_study');
  const labelBreak = document.querySelector('label[for="pomodoro-time"]') as HTMLElement;
  if (labelBreak) labelBreak.innerText = getTranslation(currentLang, 'wiz_break');
  const labelReps = document.querySelector('label[for="total-cycles"]') as HTMLElement;
  if (labelReps) labelReps.innerText = getTranslation(currentLang, 'wiz_repetitions');
  const btnBack1 = document.getElementById('btn-back-1') as HTMLButtonElement;
  if (btnBack1) btnBack1.innerText = getTranslation(currentLang, 'wiz_back');
  const btnNext2 = document.getElementById('btn-next-2') as HTMLButtonElement;
  if (btnNext2) btnNext2.innerText = getTranslation(currentLang, 'wiz_next');

  // Step 3
  const indicator2 = document.querySelector('#step-3 .step-indicator') as HTMLElement;
  if (indicator2) indicator2.innerText = getTranslation(currentLang, 'wiz_step', { current: 2, total: 2 });
  const sitesTitle = document.querySelector('#step-3 h2') as HTMLElement;
  if (sitesTitle) sitesTitle.innerText = getTranslation(currentLang, 'wiz_sites_title');
  const sitesDesc = document.querySelector('#step-3 p') as HTMLElement;
  if (sitesDesc) sitesDesc.innerText = getTranslation(currentLang, 'wiz_sites_desc');
  const btnAdd = document.getElementById('add-site') as HTMLButtonElement;
  if (btnAdd) btnAdd.innerText = getTranslation(currentLang, 'wiz_add_list');
  const btnBack2 = document.getElementById('btn-back-2') as HTMLButtonElement;
  if (btnBack2) btnBack2.innerText = getTranslation(currentLang, 'wiz_back');
  const btnFinish = document.getElementById('finish-wizard') as HTMLButtonElement;
  if (btnFinish) btnFinish.innerText = getTranslation(currentLang, 'wiz_finish');
  
  // Site list options
  const typeSelect = document.getElementById('site-type') as HTMLSelectElement;
  if (typeSelect) {
    typeSelect.options[0].text = getTranslation(currentLang, 'opt_add').replace('Añadir', 'Bloquear'); // Reuse or add keys
    // Let's be more precise
    typeSelect.options[0].text = currentLang === 'es' ? 'Bloquear' : 'Block';
    typeSelect.options[1].text = currentLang === 'es' ? 'Temporizar' : 'Countdown';
  }

  renderSiteList();
}

// Event Listeners para navegación
document.getElementById('btn-start')?.addEventListener('click', () => showStep(2));
document.getElementById('btn-next-2')?.addEventListener('click', () => showStep(3));
document.getElementById('btn-back-1')?.addEventListener('click', () => showStep(1));
document.getElementById('btn-back-2')?.addEventListener('click', () => showStep(2));

// Selector de idioma
document.getElementById('lang-select')?.addEventListener('change', (e) => {
  currentLang = (e.target as HTMLSelectElement).value as Language;
  applyTranslations();
});

// Añadir sitios
document.getElementById('add-site')?.addEventListener('click', () => {
  const urlInput = document.getElementById('site-url') as HTMLInputElement;
  const typeSelect = document.getElementById('site-type') as HTMLSelectElement;
  const url = urlInput.value.trim().toLowerCase();

  if (url) {
    if (!blacklist.find(s => s.url === url)) {
      const site: SiteConfig = { url, type: typeSelect.value as BlockType, countdownSeconds: 30 };
      blacklist.push(site);
      renderSiteList();
    }
    urlInput.value = '';
    urlInput.focus();
  }
});

function renderSiteList() {
  const list = document.getElementById('site-list')!;
  list.innerHTML = '';
  blacklist.forEach((site, index) => {
    const li = document.createElement('li');
    li.className = 'site-item';
    const badgeText = site.type === 'block' 
      ? getTranslation(currentLang, 'wiz_block_total') 
      : getTranslation(currentLang, 'wiz_block_grace');
      
    li.innerHTML = `
      <div class="site-info">
        <span class="site-url">${site.url}</span>
        <span class="site-badge">${badgeText}</span>
      </div>
      <span class="remove-site" data-index="${index}">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
      </span>
    `;
    list.appendChild(li);
  });

  document.querySelectorAll('.remove-site').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('.remove-site') as HTMLElement;
      const index = parseInt(target.dataset.index!);
      blacklist.splice(index, 1);
      renderSiteList();
    });
  });
}

// Finalizar
document.getElementById('finish-wizard')?.addEventListener('click', async () => {
  const studyMinutes = parseInt((document.getElementById('study-time') as HTMLInputElement).value) || 25;
  const pomodoroMinutes = parseInt((document.getElementById('pomodoro-time') as HTMLInputElement).value) || 5;
  const totalCycles = parseInt((document.getElementById('total-cycles') as HTMLInputElement).value) || 1;

  const config = {
    studyMinutes,
    pomodoroMinutes,
    isPomodoroEnabled: true,
    wizardCompleted: true,
    language: currentLang
  };

  const pomodoroConfig = {
    workMinutes: studyMinutes,
    breakMinutes: pomodoroMinutes,
    totalCycles
  };

  await chrome.runtime.sendMessage({ type: 'SET_CONCENTRATION_CONFIG', config });
  await chrome.runtime.sendMessage({ type: 'UPDATE_POMODORO_CONFIG', config: pomodoroConfig });
  await chrome.runtime.sendMessage({ type: 'MARK_WIZARD_COMPLETED' });
  
  for (const site of blacklist) {
    await chrome.runtime.sendMessage({ type: 'ADD_TO_BLACKLIST', site });
  }

  const finishBtn = document.getElementById('finish-wizard') as HTMLButtonElement;
  finishBtn.innerText = getTranslation(currentLang, 'wiz_ready');
  finishBtn.style.backgroundColor = '#10b981';
  
  setTimeout(() => {
    window.close();
  }, 1000);
});

// Inicializar traducciones
applyTranslations();
