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

function setSession(user) {
    if (!user || !user.id) {
        return;
    }
    const sessionData = {
        id: user.id,
        userName: user.userName || user.username || 'jogador',
        email: user.email || ''
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
}

function clearSession() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
}

function isAuthenticated() {
    const session = getSession();
    return Boolean(session && session.id);
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
    const headers = {
        Accept: 'application/json',
        ...(options.headers || {})
    };

    if (options.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    if (method === 'POST' && !headers['X-Idempotency-Key']) {
        headers['X-Idempotency-Key'] = generateIdempotencyKey();
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        method,
        headers
    });

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

function showAuthStatus(element, message, type) {
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
    }

    document.querySelectorAll('[data-logout]').forEach((logoutTrigger) => {
        logoutTrigger.addEventListener('click', (event) => {
            event.preventDefault();
            clearSession();
            window.location.href = 'index.html';
        });
    });
}

async function authenticateUser(credentials) {
    try {
        return await apiRequest('/usuarios/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    } catch (error) {
        if (error.status === 404) {
            return await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });
        }
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    syncHeaderSession();

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
                showAuthStatus(authFeedback, 'As senhas informadas não coincidem. Verifique e tente novamente.', 'error');
                return;
            }

            setSubmitButtonState(submitButton, true, 'Cadastrando...', 'Concluir Cadastro');

            try {
                await apiRequest('/usuarios', {
                    method: 'POST',
                    body: JSON.stringify({
                        userName,
                        email,
                        senha
                    })
                });

                showAuthStatus(authFeedback, 'Conta criada com sucesso! Redirecionando para o login...', 'success');
                registerForm.reset();

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1200);
            } catch (error) {
                showAuthStatus(authFeedback, error.message || 'Erro ao cadastrar usuário.', 'error');
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

                if (!user || !user.id) {
                    throw new Error('Resposta de autenticação inválida do servidor.');
                }

                setSession(user);
                showAuthStatus(authFeedback, `Bem-vindo, @${user.userName || 'jogador'}! Redirecionando...`, 'success');

                setTimeout(() => {
                    window.location.href = 'jogos.html';
                }, 900);
            } catch (error) {
                const message = error.status === 401 || error.status === 403
                    ? 'E-mail ou senha inválidos. Verifique suas credenciais.'
                    : (error.message || 'Não foi possível realizar o login.');
                showAuthStatus(authFeedback, message, 'error');
                setSubmitButtonState(submitButton, false, 'Entrando...', 'Acessar Plataforma');
            }
        });
    }
});