export function showToastNotification(title, message) {
    const toastId = 'onfocus-toast';
    let toast = document.getElementById(toastId);
    if (toast)
        toast.remove();
    toast = document.createElement('div');
    toast.id = toastId;
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: '#1e293b',
        color: '#f8fafc',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
        zIndex: '99999999',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        minWidth: '300px',
        fontFamily: 'Inter, system-ui, sans-serif',
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'translateX(100px)',
        opacity: '0'
    });
    const logo = document.createElement('img');
    logo.src = chrome.runtime.getURL('icons/onfocus-logo.png');
    logo.style.width = '40px';
    logo.style.height = '40px';
    logo.style.borderRadius = '8px';
    const content = document.createElement('div');
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    const toastTitle = document.createElement('span');
    toastTitle.innerText = title;
    toastTitle.style.fontWeight = '700';
    toastTitle.style.fontSize = '14px';
    toastTitle.style.color = '#2563eb';
    const toastMessage = document.createElement('span');
    toastMessage.innerText = message;
    toastMessage.style.fontSize = '13px';
    toastMessage.style.color = '#94a3b8';
    content.appendChild(toastTitle);
    content.appendChild(toastMessage);
    toast.appendChild(logo);
    toast.appendChild(content);
    document.body.appendChild(toast);
    // Forzar reflow para animación
    toast.offsetHeight;
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
    // Sonido de notificación (intentar varias URLs por si falla una)
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {
        console.log('OnFocus: Audio playback blocked until user interacts with the page.');
    });
    setTimeout(() => {
        if (toast) {
            toast.style.transform = 'translateX(100px)';
            toast.style.opacity = '0';
            setTimeout(() => toast?.remove(), 400);
        }
    }, 5000);
}
