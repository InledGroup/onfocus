import { showToastNotification } from '../common/toast';
import { getTranslation } from '../common/i18n';
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'SHOW_OVERLAY') {
        showCountdownOverlay(message.config, message.lang || 'es');
    }
    else if (message.type === 'REMOVE_OVERLAY') {
        const overlay = document.getElementById('onfocus-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 500);
        }
    }
    else if (message.type === 'SHOW_TOAST') {
        showToastNotification(message.title, message.message);
    }
});
function showCountdownOverlay(config, lang) {
    if (document.getElementById('onfocus-overlay'))
        return;
    const overlay = document.createElement('div');
    overlay.id = 'onfocus-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(30, 64, 175, 0.98)'; // Azul potente con opacidad alta
    overlay.style.zIndex = '9999999';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.fontFamily = 'Inter, sans-serif';
    overlay.style.transition = 'opacity 0.5s ease';
    const title = document.createElement('h1');
    title.innerText = getTranslation(lang, 'over_title');
    title.style.color = '#fff';
    title.style.marginBottom = '40px';
    title.style.fontSize = '2.5rem';
    overlay.appendChild(title);
    // Círculo de cuenta atrás SVG
    const circleContainer = document.createElement('div');
    circleContainer.style.position = 'relative';
    circleContainer.style.width = '200px';
    circleContainer.style.height = '200px';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '200');
    svg.setAttribute('height', '200');
    svg.style.transform = 'rotate(-90deg)';
    const circleBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circleBg.setAttribute('cx', '100');
    circleBg.setAttribute('cy', '100');
    circleBg.setAttribute('r', '90');
    circleBg.setAttribute('fill', 'transparent');
    circleBg.setAttribute('stroke', 'rgba(255,255,255,0.2)');
    circleBg.setAttribute('stroke-width', '10');
    const circleProgress = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circleProgress.setAttribute('cx', '100');
    circleProgress.setAttribute('cy', '100');
    circleProgress.setAttribute('r', '90');
    circleProgress.setAttribute('fill', 'transparent');
    circleProgress.setAttribute('stroke', '#fff');
    circleProgress.setAttribute('stroke-width', '10');
    circleProgress.setAttribute('stroke-dasharray', '565.48'); // 2 * PI * 90
    circleProgress.setAttribute('stroke-dashoffset', '0');
    circleProgress.style.transition = 'stroke-dashoffset 1s linear';
    svg.appendChild(circleBg);
    svg.appendChild(circleProgress);
    circleContainer.appendChild(svg);
    const countdownText = document.createElement('div');
    countdownText.id = 'onfocus-countdown-text';
    let timeLeft = config.countdownSeconds || 30;
    const totalTime = timeLeft;
    countdownText.innerText = `${timeLeft}`;
    countdownText.style.position = 'absolute';
    countdownText.style.top = '50%';
    countdownText.style.left = '50%';
    countdownText.style.transform = 'translate(-50%, -50%)';
    countdownText.style.fontSize = '4rem';
    countdownText.style.fontWeight = '800';
    countdownText.style.color = '#fff';
    circleContainer.appendChild(countdownText);
    overlay.appendChild(circleContainer);
    const subtext = document.createElement('p');
    subtext.innerText = getTranslation(lang, 'over_desc');
    subtext.style.color = 'rgba(255,255,255,0.8)';
    subtext.style.marginTop = '40px';
    subtext.style.fontSize = '1.2rem';
    overlay.appendChild(subtext);
    document.body.appendChild(overlay);
    const interval = setInterval(() => {
        timeLeft--;
        const textEl = document.getElementById('onfocus-countdown-text');
        if (textEl)
            textEl.innerText = `${timeLeft}`;
        // Calcular el desfase del círculo
        const offset = 565.48 * (1 - timeLeft / totalTime);
        if (circleProgress)
            circleProgress.setAttribute('stroke-dashoffset', offset.toString());
        if (timeLeft <= 0) {
            clearInterval(interval);
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 500);
        }
    }, 1000);
}
