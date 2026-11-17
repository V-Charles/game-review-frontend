document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const visitorToast = document.getElementById('visitor-toast');
    const visitorToastText = document.getElementById('visitor-toast-text');
    const closeVisitorToast = document.getElementById('close-visitor-toast');
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const authFeedback = document.getElementById('auth-feedback');
    const searchGamesForm = document.getElementById('search-games-form');
    const searchGamesInput = document.getElementById('search-games-input');
    const resetGamesSearch = document.getElementById('reset-games-search');
    const gamesEmptyState = document.getElementById('games-empty-state');
    const gameForm = document.getElementById('game-form');
    const searchStudiosForm = document.getElementById('search-studios-form');
    const searchStudiosInput = document.getElementById('search-studios-input');
    const resetStudiosSearch = document.getElementById('reset-studios-search');
    const studiosEmptyState = document.getElementById('studios-empty-state');
    const studioForm = document.getElementById('studio-form');

    function showAuthFeedback(message, type) {
        if (!authFeedback) {
            return;
        }
        authFeedback.textContent = message;
        authFeedback.classList.remove('hidden', 'is-error', 'is-success');
        authFeedback.classList.add(type === 'error' ? 'is-error' : 'is-success');
    }

    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    function closeAllModals() {
        document.querySelectorAll('.modal-backdrop').forEach((modal) => {
            modal.classList.add('hidden');
        });
    }

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

    document.querySelectorAll('[data-toggle-password]').forEach((toggleBtn) => {
        toggleBtn.addEventListener('click', () => {
            const targetId = toggleBtn.dataset.togglePassword;
            const input = document.getElementById(targetId);
            if (!input) {
                return;
            }
            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';
            toggleBtn.textContent = isHidden ? 'Ocultar' : 'Mostrar';
            toggleBtn.setAttribute('aria-pressed', String(isHidden));
        });
    });

    if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;

            if (password !== confirmPassword) {
                showAuthFeedback('As senhas informadas não coincidem. Verifique e tente novamente.', 'error');
                return;
            }

            showAuthFeedback('Dados validados com sucesso. Pronto para integração com a API.', 'success');
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            showAuthFeedback('Credenciais validadas com sucesso. Pronto para integração com a API.', 'success');
        });
    }

    document.querySelectorAll('[data-open-modal]').forEach((trigger) => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.dataset.openModal;
            const mode = trigger.dataset.modalMode;

            if (modalId === 'game-modal') {
                const modalTitle = document.getElementById('game-modal-title');
                if (mode === 'edit') {
                    modalTitle.textContent = 'Editar Jogo';
                    document.getElementById('game-id').value = trigger.dataset.gameId || '';
                    document.getElementById('game-title').value = trigger.dataset.gameName || '';
                    document.getElementById('game-studio').value = trigger.dataset.gameStudio || '';
                    document.getElementById('game-release').value = trigger.dataset.gameRelease || '';
                    document.getElementById('game-igdb').value = trigger.dataset.gameIgdb || '';
                    document.getElementById('game-cover').value = trigger.dataset.gameCover || '';
                } else {
                    modalTitle.textContent = 'Cadastrar Novo Jogo';
                    if (gameForm) {
                        gameForm.reset();
                    }
                    document.getElementById('game-id').value = '';
                }
            }

            if (modalId === 'studio-modal') {
                const modalTitle = document.getElementById('studio-modal-title');
                if (mode === 'edit') {
                    modalTitle.textContent = 'Editar Estúdio';
                    document.getElementById('studio-id').value = trigger.dataset.studioId || '';
                    document.getElementById('studio-name').value = trigger.dataset.studioTitle || '';
                    document.getElementById('studio-country').value = trigger.dataset.studioCountry || '';
                } else {
                    modalTitle.textContent = 'Cadastrar Novo Estúdio';
                    if (studioForm) {
                        studioForm.reset();
                    }
                    document.getElementById('studio-id').value = '';
                }
            }

            openModal(modalId);
        });
    });

    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
        btn.addEventListener('click', closeAllModals);
    });

    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
        backdrop.addEventListener('click', (event) => {
            if (event.target === backdrop) {
                closeAllModals();
            }
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeAllModals();
        }
    });

    if (searchGamesForm && searchGamesInput) {
        searchGamesForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const query = searchGamesInput.value.trim().toLowerCase();
            const cards = document.querySelectorAll('#games-grid .game-card');
            let visibleCount = 0;

            cards.forEach((card) => {
                const title = card.dataset.gameTitle || '';
                const match = title.includes(query);
                card.classList.toggle('hidden', !match);
                if (match) {
                    visibleCount += 1;
                }
            });

            if (gamesEmptyState) {
                gamesEmptyState.classList.toggle('hidden', visibleCount > 0);
            }
        });
    }

    if (resetGamesSearch && searchGamesInput) {
        resetGamesSearch.addEventListener('click', () => {
            searchGamesInput.value = '';
            document.querySelectorAll('#games-grid .game-card').forEach((card) => {
                card.classList.remove('hidden');
            });
            if (gamesEmptyState) {
                gamesEmptyState.classList.add('hidden');
            }
        });
    }

    if (gameForm) {
        gameForm.addEventListener('submit', (event) => {
            event.preventDefault();
            closeAllModals();
        });
    }

    if (searchStudiosForm && searchStudiosInput) {
        searchStudiosForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const query = searchStudiosInput.value.trim().toLowerCase();
            const cards = document.querySelectorAll('#studios-grid .studio-card');
            let visibleCount = 0;

            cards.forEach((card) => {
                const name = card.dataset.studioName || '';
                const match = name.includes(query);
                card.classList.toggle('hidden', !match);
                if (match) {
                    visibleCount += 1;
                }
            });

            if (studiosEmptyState) {
                studiosEmptyState.classList.toggle('hidden', visibleCount > 0);
            }
        });
    }

    if (resetStudiosSearch && searchStudiosInput) {
        resetStudiosSearch.addEventListener('click', () => {
            searchStudiosInput.value = '';
            document.querySelectorAll('#studios-grid .studio-card').forEach((card) => {
                card.classList.remove('hidden');
            });
            if (studiosEmptyState) {
                studiosEmptyState.classList.add('hidden');
            }
        });
    }

    if (studioForm) {
        studioForm.addEventListener('submit', (event) => {
            event.preventDefault();
            closeAllModals();
        });
    }
});