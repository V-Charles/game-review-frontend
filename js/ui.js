document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const visitorToast = document.getElementById('visitor-toast');
    const visitorToastText = document.getElementById('visitor-toast-text');
    const closeVisitorToast = document.getElementById('close-visitor-toast');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('is-open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });

        navMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('is-open');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    document.querySelectorAll('[data-visitor-restricted]').forEach((trigger) => {
        trigger.addEventListener('click', () => {
            const actionLabel = trigger.dataset.visitorRestricted || 'realizar esta ação';
            if (visitorToast && visitorToastText) {
                visitorToastText.textContent = `Para ${actionLabel}, entre na sua conta ou faça seu cadastro gratuito.`;
                visitorToast.classList.remove('hidden');
            }
        });
    });

    if (closeVisitorToast && visitorToast) {
        closeVisitorToast.addEventListener('click', () => {
            visitorToast.classList.add('hidden');
        });
    }
});