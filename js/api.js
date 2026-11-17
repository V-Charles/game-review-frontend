const API_BASE_URL = 'https://game-review-api-zftj.onrender.com';
const SESSION_STORAGE_KEY = 'gamereview_session';

function getSession() {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
        return null;
    }
    try {
        return JSON.parse(raw);
    } catch {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
    }
}

function setSession(user, apiKey = '') {
    if (!user || !user.id) {
        return;
    }
    const existing = getSession();
    const resolvedKey = apiKey || user.apiKey || (existing && existing.id === user.id ? existing.apiKey : '');
    const sessionData = {
        id: user.id,
        userName: user.userName || user.username || 'jogador',
        email: user.email || '',
        apiKey: resolvedKey
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
}

function clearSession() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
}

function isAuthenticated() {
    const session = getSession();
    return Boolean(session && session.id && session.apiKey);
}

function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return null;
    }
    return getSession();
}

function generateIdempotencyKey() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

function escapeHtml(value) {
    if (value === null || value === undefined) {
        return '';
    }
    const entities = {
        '&': '\u0026amp;',
        '<': '\u0026lt;',
        '>': '\u0026gt;',
        '"': '\u0026quot;',
        "'": '\u0026#39;'
    };
    return String(value).replace(/[&<>"']/g, (char) => entities[char]);
}

function formatDateBr(dateValue) {
    if (!dateValue) {
        return 'Data não informada';
    }
    const raw = String(dateValue).split('T')[0];
    if (!raw.includes('-')) {
        return raw;
    }
    const parts = raw.split('-');
    if (parts.length !== 3) {
        return raw;
    }
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function extractListFromResponse(payload) {
    if (!payload) {
        return [];
    }
    if (Array.isArray(payload)) {
        return payload;
    }
    if (Array.isArray(payload.content)) {
        return payload.content;
    }
    return [];
}

function extractTotalCount(payload, list) {
    if (payload && typeof payload.totalElements === 'number') {
        return payload.totalElements;
    }
    return list.length;
}

function getReviewStatusBadgeClass(status) {
    const normalized = String(status || '').toUpperCase();
    if (normalized === 'PLATINADO') {
        return 'badge-success';
    }
    if (normalized === 'ZERADO') {
        return 'badge-violet';
    }
    if (normalized === 'JOGANDO') {
        return 'badge-warning';
    }
    return 'badge-cyan';
}

function extractApiErrorMessage(data, status) {
    if (!data) {
        return `Erro na requisição (HTTP ${status}).`;
    }
    if (typeof data === 'string') {
        return data;
    }
    if (Array.isArray(data.errors) && data.errors.length > 0) {
        const firstError = data.errors[0];
        if (typeof firstError === 'string') {
            return firstError;
        }
        if (firstError && firstError.defaultMessage) {
            return firstError.defaultMessage;
        }
    }
    if (data.message) {
        return data.message;
    }
    if (data.error) {
        return data.error;
    }
    return `Não foi possível concluir a operação (HTTP ${status}).`;
}

async function apiRequest(endpoint, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const skipAuth = Boolean(options.skipAuth);
    const session = getSession();
    const headers = {
        Accept: 'application/json',
        ...(options.headers || {})
    };

    if (options.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    if (!skipAuth && session && session.apiKey && !headers['X-API-Key']) {
        headers['X-API-Key'] = session.apiKey;
    }

    if (method === 'POST' && !headers['X-Idempotency-Key']) {
        headers['X-Idempotency-Key'] = generateIdempotencyKey();
    }

    const fetchOptions = {
        ...options,
        method,
        headers
    };
    delete fetchOptions.skipAuth;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);

    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
        ? await response.json().catch(() => null)
        : await response.text().catch(() => null);

    if (!response.ok) {
        const error = new Error(extractApiErrorMessage(data, response.status));
        error.status = response.status;
        throw error;
    }

    return data;
}

function showFeedbackBanner(element, message, type) {
    if (!element) {
        return;
    }
    element.textContent = message;
    element.classList.remove('hidden', 'is-error', 'is-success');
    element.classList.add(type === 'error' ? 'is-error' : 'is-success');
}

function setSubmitButtonState(button, isLoading, loadingText, defaultText) {
    if (!button) {
        return;
    }
    button.disabled = isLoading;
    button.textContent = isLoading ? loadingText : defaultText;
}

function bindLogoutButtons() {
    document.querySelectorAll('[data-logout]').forEach((logoutTrigger) => {
        logoutTrigger.addEventListener('click', (event) => {
            event.preventDefault();
            clearSession();
            window.location.href = 'index.html';
        });
    });
}

function syncHeaderSession() {
    const session = getSession();
    if (session) {
        const formattedId = `#${String(session.id).padStart(2, '0')}`;
        document.querySelectorAll('.user-badge-name').forEach((el) => {
            el.textContent = `@${session.userName}`;
        });
        document.querySelectorAll('.user-badge-id').forEach((el) => {
            el.textContent = formattedId;
        });

        const homeHeaderActions = document.getElementById('home-header-actions');
        const homeMobileAuth = document.getElementById('home-mobile-auth');
        const heroPrimaryCta = document.getElementById('hero-primary-cta');

        if (homeHeaderActions) {
            homeHeaderActions.innerHTML = `
                <a href="jogos.html" class="user-badge">
                    <span class="user-badge-name">@${escapeHtml(session.userName)}</span>
                    <span class="user-badge-id">${formattedId}</span>
                </a>
                <a href="jogos.html" class="btn btn-primary btn-sm">Acessar Painel</a>
                <a href="index.html" class="btn btn-ghost btn-sm" data-logout>Sair</a>
            `;
        }

        if (homeMobileAuth) {
            homeMobileAuth.innerHTML = `
                <a href="jogos.html" class="btn btn-primary btn-sm">Acessar Painel</a>
                <a href="index.html" class="btn btn-ghost btn-sm" data-logout>Sair</a>
            `;
        }

        if (heroPrimaryCta) {
            heroPrimaryCta.href = 'jogos.html';
            heroPrimaryCta.textContent = 'Acessar Catálogo Completo';
        }
    }

    bindLogoutButtons();
}

function renderHomeGames(games) {
    const grid = document.getElementById('home-games-grid');
    if (!grid) {
        return;
    }

    if (!games.length) {
        grid.innerHTML = `
            <div class="empty-state">
                <p>Nenhum jogo cadastrado no catálogo até o momento.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = games.slice(0, 4).map((game, index) => {
        const coverClass = `cover-variant-${(index % 4) + 1}`;
        const title = escapeHtml(game.titulo || game.nome || 'Jogo sem título');
        const studioName = escapeHtml(
            (game.estudio && (game.estudio.nomeEstudio || game.estudio.nome)) ||
            game.nomeEstudio ||
            'Estúdio não informado'
        );
        const igdbBadge = game.igdbId ? `IGDB #${escapeHtml(game.igdbId)}` : `ID #${escapeHtml(game.id)}`;
        const releaseDate = formatDateBr(game.dataLancamento);

        return `
            <article class="card">
                <div class="game-visual ${coverClass}">
                    <span class="badge badge-cyan">${igdbBadge}</span>
                    <span class="game-genre">CATÁLOGO OFICIAL</span>
                </div>
                <div class="card-body">
                    <div class="flex-between">
                        <span class="badge badge-violet">${studioName}</span>
                    </div>
                    <h3 class="card-title">${title}</h3>
                    <p class="card-meta">Lançamento: ${escapeHtml(releaseDate)}</p>
                </div>
                <div class="card-footer">
                    <button type="button" class="btn btn-secondary btn-sm btn-full" data-auth-target="jogos.html" data-visitor-restricted="visualizar detalhes ou avaliar jogos">Ver Detalhes</button>
                </div>
            </article>
        `;
    }).join('');
}

function renderHomeStudios(studios) {
    const grid = document.getElementById('home-studios-grid');
    if (!grid) {
        return;
    }

    if (!studios.length) {
        grid.innerHTML = `
            <div class="empty-state">
                <p>Nenhum estúdio cadastrado até o momento.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = studios.slice(0, 3).map((studio) => {
        const name = escapeHtml(studio.nomeEstudio || studio.nome || 'Estúdio');
        const country = escapeHtml(studio.paisFundacao || studio.pais || 'País não informado');
        const idFormatted = String(studio.id || 0).padStart(2, '0');

        return `
            <article class="card">
                <div class="card-body">
                    <div class="flex-between">
                        <span class="badge badge-cyan">${country}</span>
                        <span class="mono-label">ID #${escapeHtml(idFormatted)}</span>
                    </div>
                    <h3 class="card-title">${name}</h3>
                    <p class="card-description">Estúdio desenvolvedor registrado no catálogo oficial da plataforma.</p>
                </div>
            </article>
        `;
    }).join('');
}

function renderHomeReviews(reviews) {
    const grid = document.getElementById('home-reviews-grid');
    if (!grid) {
        return;
    }

    if (!reviews.length) {
        grid.innerHTML = `
            <div class="empty-state">
                <p>Nenhuma avaliação publicada até o momento.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = reviews.slice(0, 3).map((review) => {
        const status = escapeHtml(review.status || 'AVALIADO');
        const badgeClass = getReviewStatusBadgeClass(review.status);
        const score = review.nota !== null && review.nota !== undefined ? Number(review.nota).toFixed(1) : '--';
        const gameTitle = escapeHtml(
            (review.jogo && (review.jogo.titulo || review.jogo.nome)) ||
            review.jogoTitulo ||
            'Jogo avaliado'
        );
        const comment = escapeHtml(review.comentario || 'Sem comentário adicional.');
        const author = escapeHtml(
            (review.usuario && (review.usuario.userName || review.usuario.username)) ||
            review.usuarioUserName ||
            'jogador'
        );
        const dateLabel = formatDateBr(review.dataAvaliacao || review.createdAt);

        return `
            <article class="card">
                <div class="card-body">
                    <div class="flex-between">
                        <span class="badge ${badgeClass}">${status}</span>
                        <span class="score-chip">${escapeHtml(score)} / 10</span>
                    </div>
                    <h3 class="card-title">${gameTitle}</h3>
                    <p class="card-description">${comment}</p>
                </div>
                <div class="card-footer flex-between">
                    <span class="author-tag">@${author}</span>
                    <span class="mono-label">${escapeHtml(dateLabel)}</span>
                </div>
            </article>
        `;
    }).join('');
}

function renderHomeLists(lists) {
    const grid = document.getElementById('home-lists-grid');
    if (!grid) {
        return;
    }

    const publicLists = lists.filter((item) => item.isPublica !== false && item.publica !== false);

    if (!publicLists.length) {
        grid.innerHTML = `
            <div class="empty-state">
                <p>Nenhuma lista pública disponível até o momento.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = publicLists.slice(0, 2).map((list) => {
        const name = escapeHtml(list.nome || 'Lista sem nome');
        const description = escapeHtml(list.descricao || 'Coleção temática criada pela comunidade.');
        const author = escapeHtml(
            (list.usuario && (list.usuario.userName || list.usuario.username)) ||
            list.usuarioUserName ||
            'jogador'
        );
        const games = Array.isArray(list.jogos) ? list.jogos : [];
        const tagsHtml = games.length
            ? games.slice(0, 4).map((game) => `<span class="badge badge-cyan">${escapeHtml(game.titulo || game.nome || 'Jogo')}</span>`).join('')
            : '<span class="mono-label">Nenhum jogo vinculado</span>';

        return `
            <article class="card">
                <div class="card-body">
                    <div class="flex-between">
                        <span class="badge badge-success">PÚBLICA</span>
                        <span class="mono-label">POR @${author}</span>
                    </div>
                    <h3 class="card-title">${name}</h3>
                    <p class="card-description">${description}</p>
                    <div class="tag-group">${tagsHtml}</div>
                </div>
                <div class="card-footer flex-between">
                    <span class="mono-label">${games.length} JOGO(S) VINCULADO(S)</span>
                    <button type="button" class="btn btn-secondary btn-sm" data-auth-target="listas.html" data-visitor-restricted="acessar ou criar listas">Explorar Listas</button>
                </div>
            </article>
        `;
    }).join('');
}

function setHomeFallbackState(message) {
    ['stat-games', 'stat-studios', 'stat-reviews', 'stat-lists'].forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.textContent === '--') {
            el.textContent = '00';
        }
    });

    ['home-games-grid', 'home-studios-grid', 'home-reviews-grid', 'home-lists-grid'].forEach((id) => {
        const grid = document.getElementById(id);
        if (grid) {
            grid.innerHTML = `
                <div class="empty-state">
                    <p>${escapeHtml(message)}</p>
                </div>
            `;
        }
    });
}

async function loadHomePageData() {
    const gamesGrid = document.getElementById('home-games-grid');
    if (!gamesGrid) {
        return;
    }

    const endpoints = ['/jogos', '/estudios', '/avaliacoes', '/listas'];
    const results = await Promise.allSettled(
        endpoints.map((endpoint) => apiRequest(endpoint, { method: 'GET' }))
    );

    const hasUnauthorized = results.some(
        (result) => result.status === 'rejected' && (result.reason.status === 401 || result.reason.status === 403)
    );

    if (hasUnauthorized && !isAuthenticated()) {
        setHomeFallbackState('Entre na sua conta ou crie um cadastro gratuito para carregar os dados em tempo real da API.');
        return;
    }

    const [gamesRes, studiosRes, reviewsRes, listsRes] = results;

    const gamesList = gamesRes.status === 'fulfilled' ? extractListFromResponse(gamesRes.value) : [];
    const studiosList = studiosRes.status === 'fulfilled' ? extractListFromResponse(studiosRes.value) : [];
    const reviewsList = reviewsRes.status === 'fulfilled' ? extractListFromResponse(reviewsRes.value) : [];
    const listsList = listsRes.status === 'fulfilled' ? extractListFromResponse(listsRes.value) : [];

    const statGames = document.getElementById('stat-games');
    const statStudios = document.getElementById('stat-studios');
    const statReviews = document.getElementById('stat-reviews');
    const statLists = document.getElementById('stat-lists');

    if (statGames) {
        statGames.textContent = String(extractTotalCount(gamesRes.value, gamesList)).padStart(2, '0');
    }
    if (statStudios) {
        statStudios.textContent = String(extractTotalCount(studiosRes.value, studiosList)).padStart(2, '0');
    }
    if (statReviews) {
        statReviews.textContent = String(extractTotalCount(reviewsRes.value, reviewsList)).padStart(2, '0');
    }
    if (statLists) {
        statLists.textContent = String(extractTotalCount(listsRes.value, listsList)).padStart(2, '0');
    }

    renderHomeGames(gamesList);
    renderHomeStudios(studiosList);
    renderHomeReviews(reviewsList);
    renderHomeLists(listsList);
}

function resolveUserFromSearchResponse(payload, targetEmail) {
    if (!payload) {
        return null;
    }
    if (Array.isArray(payload)) {
        return payload.find((item) => item && item.email && item.email.toLowerCase() === targetEmail.toLowerCase()) || payload[0] || null;
    }
    if (Array.isArray(payload.content)) {
        return payload.content.find((item) => item && item.email && item.email.toLowerCase() === targetEmail.toLowerCase()) || payload.content[0] || null;
    }
    return payload.id ? payload : null;
}

async function authenticateUser(credentials) {
    let searchResult;
    try {
        searchResult = await apiRequest(`/usuarios/search?email=${encodeURIComponent(credentials.email)}`, {
            method: 'GET',
            skipAuth: true
        });
    } catch (error) {
        if (error.status === 404 || error.status === 400) {
            const authError = new Error('E-mail ou senha inválidos. Verifique suas credenciais.');
            authError.status = 401;
            throw authError;
        }
        throw error;
    }

    const user = resolveUserFromSearchResponse(searchResult, credentials.email);
    if (!user || !user.id) {
        const authError = new Error('E-mail ou senha inválidos. Verifique suas credenciais.');
        authError.status = 401;
        throw authError;
    }

    if (typeof user.senha === 'string' && user.senha.length > 0 && user.senha !== credentials.senha) {
        const authError = new Error('E-mail ou senha inválidos. Verifique suas credenciais.');
        authError.status = 401;
        throw authError;
    }

    const keyResponse = await apiRequest(`/api-keys/usuario/${user.id}`, {
        method: 'POST',
        skipAuth: true
    });

    const apiKey = keyResponse && keyResponse.chave ? keyResponse.chave : '';
    if (!apiKey) {
        throw new Error('Não foi possível gerar a chave de acesso da sessão.');
    }

    setSession(user, apiKey);
    return { ...user, apiKey };
}

function initStudiosPage() {
    const studiosGrid = document.getElementById('studios-grid');
    if (!studiosGrid) {
        return;
    }

    const session = requireAuth();
    if (!session) {
        return;
    }

    const studiosFeedback = document.getElementById('studios-feedback');
    const searchStudiosForm = document.getElementById('search-studios-form');
    const searchStudiosInput = document.getElementById('search-studios-input');
    const resetStudiosSearch = document.getElementById('reset-studios-search');
    const studiosEmptyState = document.getElementById('studios-empty-state');
    const studioForm = document.getElementById('studio-form');
    const confirmDeleteStudioBtn = document.getElementById('confirm-delete-studio');

    let studiosCache = [];

    function renderStudios(studios) {
        const query = searchStudiosInput ? searchStudiosInput.value.trim().toLowerCase() : '';
        const filtered = query
            ? studios.filter((studio) => {
                const name = String(studio.nomeEstudio || studio.nome || '').toLowerCase();
                const country = String(studio.paisFundacao || studio.pais || '').toLowerCase();
                return name.includes(query) || country.includes(query);
            })
            : studios;

        if (!studios.length) {
            studiosGrid.innerHTML = '';
            if (studiosEmptyState) {
                studiosEmptyState.querySelector('p').textContent = 'Nenhum estúdio cadastrado até o momento. Clique em "+ Novo Estúdio" para adicionar.';
                studiosEmptyState.classList.remove('hidden');
            }
            return;
        }

        if (!filtered.length) {
            studiosGrid.innerHTML = '';
            if (studiosEmptyState) {
                studiosEmptyState.querySelector('p').textContent = 'Nenhum estúdio encontrado para o filtro aplicado.';
                studiosEmptyState.classList.remove('hidden');
            }
            return;
        }

        if (studiosEmptyState) {
            studiosEmptyState.classList.add('hidden');
        }

        studiosGrid.innerHTML = filtered.map((studio) => {
            const id = studio.id;
            const idFormatted = String(id || 0).padStart(2, '0');
            const name = escapeHtml(studio.nomeEstudio || studio.nome || 'Estúdio');
            const country = escapeHtml(studio.paisFundacao || studio.pais || 'País não informado');

            return `
                <article class="card studio-card">
                    <div class="card-body">
                        <div class="flex-between">
                            <span class="badge badge-cyan">${country}</span>
                            <span class="mono-label">ID #${escapeHtml(idFormatted)}</span>
                        </div>
                        <h2 class="card-title">${name}</h2>
                        <p class="card-description">Desenvolvedora vinculada ao catálogo oficial de jogos da plataforma.</p>
                    </div>
                    <div class="card-footer flex-between">
                        <button
                            type="button"
                            class="btn btn-secondary btn-sm"
                            data-open-modal="studio-modal"
                            data-modal-mode="edit"
                            data-studio-id="${escapeHtml(id)}"
                            data-studio-title="${name}"
                            data-studio-country="${country}">
                            Editar
                        </button>
                        <button
                            type="button"
                            class="btn btn-danger btn-sm"
                            data-open-modal="delete-studio-modal"
                            data-studio-id="${escapeHtml(id)}"
                            data-studio-title="${name}">
                            Excluir
                        </button>
                    </div>
                </article>
            `;
        }).join('');
    }

    async function loadStudios() {
        try {
            const payload = await apiRequest('/estudios', { method: 'GET' });
            studiosCache = extractListFromResponse(payload);
            renderStudios(studiosCache);
        } catch (error) {
            if (error.status === 401 || error.status === 403) {
                clearSession();
                window.location.href = 'login.html';
                return;
            }
            studiosGrid.innerHTML = '';
            showFeedbackBanner(studiosFeedback, error.message || 'Não foi possível carregar os estúdios.', 'error');
        }
    }

    if (searchStudiosForm) {
        searchStudiosForm.addEventListener('submit', (event) => {
            event.preventDefault();
            renderStudios(studiosCache);
        });
    }

    if (resetStudiosSearch && searchStudiosInput) {
        resetStudiosSearch.addEventListener('click', () => {
            searchStudiosInput.value = '';
            renderStudios(studiosCache);
        });
    }

    if (studioForm) {
        studioForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const id = document.getElementById('studio-id').value.trim();
            const nomeEstudio = document.getElementById('studio-name').value.trim();
            const paisFundacao = document.getElementById('studio-country').value.trim();
            const submitButton = studioForm.querySelector('button[type="submit"]');

            setSubmitButtonState(submitButton, true, 'Salvando...', 'Salvar Estúdio');

            try {
                if (id) {
                    await apiRequest(`/estudios/${encodeURIComponent(id)}`, {
                        method: 'PUT',
                        body: JSON.stringify({ nomeEstudio, paisFundacao })
                    });
                    showFeedbackBanner(studiosFeedback, `Estúdio "${nomeEstudio}" atualizado com sucesso.`, 'success');
                } else {
                    await apiRequest('/estudios', {
                        method: 'POST',
                        body: JSON.stringify({ nomeEstudio, paisFundacao })
                    });
                    showFeedbackBanner(studiosFeedback, `Estúdio "${nomeEstudio}" cadastrado com sucesso.`, 'success');
                }

                document.querySelectorAll('.modal-backdrop').forEach((modal) => modal.classList.add('hidden'));
                studioForm.reset();
                await loadStudios();
            } catch (error) {
                showFeedbackBanner(studiosFeedback, error.message || 'Não foi possível salvar o estúdio.', 'error');
            } finally {
                setSubmitButtonState(submitButton, false, 'Salvando...', 'Salvar Estúdio');
            }
        });
    }

    if (confirmDeleteStudioBtn) {
        confirmDeleteStudioBtn.addEventListener('click', async () => {
            const id = document.getElementById('delete-studio-id').value.trim();
            if (!id) {
                return;
            }

            setSubmitButtonState(confirmDeleteStudioBtn, true, 'Excluindo...', 'Confirmar Exclusão');

            try {
                await apiRequest(`/estudios/${encodeURIComponent(id)}`, {
                    method: 'DELETE'
                });

                document.querySelectorAll('.modal-backdrop').forEach((modal) => modal.classList.add('hidden'));
                showFeedbackBanner(studiosFeedback, 'Estúdio removido com sucesso.', 'success');
                await loadStudios();
            } catch (error) {
                document.querySelectorAll('.modal-backdrop').forEach((modal) => modal.classList.add('hidden'));
                showFeedbackBanner(studiosFeedback, error.message || 'Não foi possível excluir o estúdio.', 'error');
            } finally {
                setSubmitButtonState(confirmDeleteStudioBtn, false, 'Excluindo...', 'Confirmar Exclusão');
            }
        });
    }

    loadStudios();
}

document.addEventListener('DOMContentLoaded', () => {
    syncHeaderSession();
    loadHomePageData();
    initStudiosPage();

    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const authFeedback = document.getElementById('auth-feedback');

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const userName = document.getElementById('register-username').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const senha = document.getElementById('register-password').value;
            const confirmarSenha = document.getElementById('register-confirm-password').value;
            const submitButton = registerForm.querySelector('button[type="submit"]');

            if (senha !== confirmarSenha) {
                showFeedbackBanner(authFeedback, 'As senhas informadas não coincidem. Verifique e tente novamente.', 'error');
                return;
            }

            setSubmitButtonState(submitButton, true, 'Cadastrando...', 'Concluir Cadastro');

            try {
                await apiRequest('/usuarios', {
                    method: 'POST',
                    skipAuth: true,
                    body: JSON.stringify({
                        userName,
                        email,
                        senha
                    })
                });

                showFeedbackBanner(authFeedback, 'Conta criada com sucesso! Redirecionando para o login...', 'success');
                registerForm.reset();

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1200);
            } catch (error) {
                showFeedbackBanner(authFeedback, error.message || 'Erro ao cadastrar usuário.', 'error');
                setSubmitButtonState(submitButton, false, 'Cadastrando...', 'Concluir Cadastro');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('login-email').value.trim();
            const senha = document.getElementById('login-password').value;
            const submitButton = loginForm.querySelector('button[type="submit"]');

            setSubmitButtonState(submitButton, true, 'Entrando...', 'Acessar Plataforma');

            try {
                const user = await authenticateUser({ email, senha });

                showFeedbackBanner(authFeedback, `Bem-vindo, @${user.userName || 'jogador'}! Redirecionando...`, 'success');

                setTimeout(() => {
                    window.location.href = 'jogos.html';
                }, 900);
            } catch (error) {
                const message = error.status === 401 || error.status === 403
                    ? 'E-mail ou senha inválidos. Verifique suas credenciais.'
                    : (error.message || 'Não foi possível realizar o login.');
                showFeedbackBanner(authFeedback, message, 'error');
                setSubmitButtonState(submitButton, false, 'Entrando...', 'Acessar Plataforma');
            }
        });
    }
});