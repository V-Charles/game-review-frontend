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
    const filterReviewsForm = document.getElementById('filter-reviews-form');
    const filterReviewsGame = document.getElementById('filter-reviews-game');
    const resetReviewsFilter = document.getElementById('reset-reviews-filter');
    const reviewsEmptyState = document.getElementById('reviews-empty-state');
    const reviewForm = document.getElementById('review-form');
    const listFilterButtons = document.querySelectorAll('[data-list-filter]');
    const listsEmptyState = document.getElementById('lists-empty-state');
    const listForm = document.getElementById('list-form');

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

            if (modalId === 'review-modal') {
                const modalTitle = document.getElementById('review-modal-title');
                if (mode === 'edit') {
                    modalTitle.textContent = 'Editar Avaliação';
                    document.getElementById('review-id').value = trigger.dataset.reviewId || '';
                    document.getElementById('review-game').value = trigger.dataset.reviewGame || '';
                    document.getElementById('review-score').value = trigger.dataset.reviewScore || '';
                    document.getElementById('review-status').value = trigger.dataset.reviewStatus || 'JOGANDO';
                    document.getElementById('review-comment').value = trigger.dataset.reviewComment || '';
                } else {
                    modalTitle.textContent = 'Nova Avaliação';
                    if (reviewForm) {
                        reviewForm.reset();
                    }
                    document.getElementById('review-id').value = '';
                }
            }

            if (modalId === 'list-modal') {
                const modalTitle = document.getElementById('list-modal-title');
                const gameCheckboxes = document.querySelectorAll('#list-games-checklist input[name="listGames"]');

                if (mode === 'edit') {
                    modalTitle.textContent = 'Editar Lista';
                    document.getElementById('list-id').value = trigger.dataset.listId || '';
                    document.getElementById('list-name').value = trigger.dataset.listName || '';
                    document.getElementById('list-description').value = trigger.dataset.listDesc || '';
                    document.getElementById('list-public').checked = trigger.dataset.listPublic === 'true';

                    const selectedIds = new Set((trigger.dataset.listGames || '').split(',').filter(Boolean));
                    gameCheckboxes.forEach((checkbox) => {
                        checkbox.checked = selectedIds.has(checkbox.value);
                    });
                } else {
                    modalTitle.textContent = 'Nova Lista de Jogos';
                    if (listForm) {
                        listForm.reset();
                    }
                    document.getElementById('list-id').value = '';
                    document.getElementById('list-public').checked = true;
                    gameCheckboxes.forEach((checkbox) => {
                        checkbox.checked = false;
                    });
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

    if (filterReviewsForm && filterReviewsGame) {
        filterReviewsForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const selectedGameId = filterReviewsGame.value;
            const cards = document.querySelectorAll('#reviews-grid .review-card');
            let visibleCount = 0;

            cards.forEach((card) => {
                const cardGameId = card.dataset.gameId || '';
                const match = !selectedGameId || cardGameId === selectedGameId;
                card.classList.toggle('hidden', !match);
                if (match) {
                    visibleCount += 1;
                }
            });

            if (reviewsEmptyState) {
                reviewsEmptyState.classList.toggle('hidden', visibleCount > 0);
            }
        });
    }

    if (resetReviewsFilter && filterReviewsGame) {
        resetReviewsFilter.addEventListener('click', () => {
            filterReviewsGame.value = '';
            document.querySelectorAll('#reviews-grid .review-card').forEach((card) => {
                card.classList.remove('hidden');
            });
            if (reviewsEmptyState) {
                reviewsEmptyState.classList.add('hidden');
            }
        });
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', (event) => {
            event.preventDefault();
            closeAllModals();
        });
    }

    listFilterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const filter = button.dataset.listFilter || 'all';
            listFilterButtons.forEach((btn) => {
                btn.classList.toggle('active', btn === button);
            });

            const cards = document.querySelectorAll('#lists-grid .list-card');
            let visibleCount = 0;

            cards.forEach((card) => {
                const isPublic = card.dataset.listPublic === 'true';
                const isOwner = card.dataset.listOwner === 'true';
                let match = true;

                if (filter === 'public') {
                    match = isPublic;
                } else if (filter === 'mine') {
                    match = isOwner;
                }

                card.classList.toggle('hidden', !match);
                if (match) {
                    visibleCount += 1;
                }
            });

            if (listsEmptyState) {
                listsEmptyState.classList.toggle('hidden', visibleCount > 0);
            }
        });
    });

    if (listForm) {
        listForm.addEventListener('submit', (event) => {
            event.preventDefault();
            closeAllModals();
        });
    }
});