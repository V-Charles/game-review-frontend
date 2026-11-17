document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const visitorToast = document.getElementById('visitor-toast');
    const visitorToastText = document.getElementById('visitor-toast-text');
    const closeVisitorToast = document.getElementById('close-visitor-toast');
    const gameForm = document.getElementById('game-form');
    const studioForm = document.getElementById('studio-form');
    const reviewForm = document.getElementById('review-form');
    const listForm = document.getElementById('list-form');
    const profileForm = document.getElementById('profile-form');
    const profileFeedback = document.getElementById('profile-feedback');
    const accountForm = document.getElementById('account-form');
    const accountFeedback = document.getElementById('account-feedback');
    const confirmDeleteAccountBtn = document.getElementById('confirm-delete-account');

    function showFeedbackMessage(element, message, type) {
        if (!element) {
            return;
        }
        element.textContent = message;
        element.classList.remove('hidden', 'is-error', 'is-success');
        element.classList.add(type === 'error' ? 'is-error' : 'is-success');
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

    function formatDisplayDate(isoDate) {
        if (!isoDate || !isoDate.includes('-')) {
            return 'NÃO INFORMADA';
        }
        const parts = isoDate.split('-');
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
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

    document.addEventListener('click', (event) => {
        const visitorTrigger = event.target.closest('[data-visitor-restricted]');
        if (visitorTrigger) {
            if (typeof isAuthenticated === 'function' && isAuthenticated() && visitorTrigger.dataset.authTarget) {
                window.location.href = visitorTrigger.dataset.authTarget;
                return;
            }
            const actionLabel = visitorTrigger.dataset.visitorRestricted || 'realizar esta ação';
            if (visitorToast && visitorToastText) {
                visitorToastText.textContent = `Para ${actionLabel}, entre na sua conta ou faça seu cadastro gratuito.`;
                visitorToast.classList.remove('hidden');
            }
            return;
        }

        const trigger = event.target.closest('[data-open-modal]');
        if (!trigger) {
            return;
        }

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

        if (modalId === 'delete-game-modal') {
            const deleteIdInput = document.getElementById('delete-game-id');
            const deleteNameText = document.getElementById('delete-game-name');
            if (deleteIdInput) {
                deleteIdInput.value = trigger.dataset.gameId || '';
            }
            if (deleteNameText) {
                deleteNameText.textContent = trigger.dataset.gameName || '';
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

        if (modalId === 'delete-studio-modal') {
            const deleteIdInput = document.getElementById('delete-studio-id');
            const deleteNameText = document.getElementById('delete-studio-name');
            if (deleteIdInput) {
                deleteIdInput.value = trigger.dataset.studioId || '';
            }
            if (deleteNameText) {
                deleteNameText.textContent = trigger.dataset.studioTitle || '';
            }
        }

        if (modalId === 'review-modal') {
            const modalTitle = document.getElementById('review-modal-title');
            const submitButton = reviewForm ? reviewForm.querySelector('button[type="submit"]') : null;
            if (mode === 'edit') {
                modalTitle.textContent = 'Editar Avaliação';
                if (submitButton) {
                    submitButton.textContent = 'Salvar Alterações';
                }
                document.getElementById('review-id').value = trigger.dataset.reviewId || '';
                document.getElementById('review-game').value = trigger.dataset.reviewGame || '';
                document.getElementById('review-score').value = trigger.dataset.reviewScore || '';
                document.getElementById('review-status').value = trigger.dataset.reviewStatus || 'JOGANDO';
                document.getElementById('review-comment').value = trigger.dataset.reviewComment || '';
            } else {
                modalTitle.textContent = 'Nova Avaliação';
                if (submitButton) {
                    submitButton.textContent = 'Publicar Avaliação';
                }
                if (reviewForm) {
                    reviewForm.reset();
                }
                document.getElementById('review-id').value = '';
            }
        }

        if (modalId === 'delete-review-modal') {
            const deleteIdInput = document.getElementById('delete-review-id');
            const deleteNameText = document.getElementById('delete-review-name');
            if (deleteIdInput) {
                deleteIdInput.value = trigger.dataset.reviewId || '';
            }
            if (deleteNameText) {
                deleteNameText.textContent = trigger.dataset.reviewGameTitle || '';
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

        if (modalId === 'delete-list-modal') {
            const deleteIdInput = document.getElementById('delete-list-id');
            const deleteNameText = document.getElementById('delete-list-name');
            if (deleteIdInput) {
                deleteIdInput.value = trigger.dataset.listId || '';
            }
            if (deleteNameText) {
                deleteNameText.textContent = trigger.dataset.listName || '';
            }
        }

        openModal(modalId);
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

    if (profileForm) {
        profileForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const bioInput = document.getElementById('profile-bio');
            const birthInput = document.getElementById('profile-birthdate');
            const displayBio = document.getElementById('profile-display-bio');
            const displayBirth = document.getElementById('profile-display-birthdate');

            if (displayBio && bioInput) {
                displayBio.textContent = bioInput.value.trim() || 'Nenhuma biografia informada.';
            }

            if (displayBirth && birthInput) {
                displayBirth.textContent = `NASCIMENTO: ${formatDisplayDate(birthInput.value)}`;
            }

            showFeedbackMessage(profileFeedback, 'Perfil público validado com sucesso. Pronto para integração com a API.', 'success');
        });
    }

    if (accountForm) {
        accountForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const usernameInput = document.getElementById('account-username');
            const displayUsername = document.getElementById('profile-display-username');
            const newUsername = usernameInput ? usernameInput.value.trim() : '';

            if (newUsername.length < 3) {
                showFeedbackMessage(accountFeedback, 'O nome de usuário deve ter pelo menos 3 caracteres.', 'error');
                return;
            }

            if (displayUsername) {
                displayUsername.textContent = `@${newUsername}`;
            }

            document.querySelectorAll('.user-badge-name').forEach((badge) => {
                badge.textContent = `@${newUsername}`;
            });

            showFeedbackMessage(accountFeedback, 'Dados da conta validados com sucesso. Pronto para integração com a API.', 'success');
        });
    }

    if (confirmDeleteAccountBtn) {
        confirmDeleteAccountBtn.addEventListener('click', () => {
            closeAllModals();
            window.location.href = 'index.html';
        });
    }
});