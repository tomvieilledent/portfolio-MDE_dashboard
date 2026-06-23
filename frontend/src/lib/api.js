// Client API centralisé : ajoute le token JWT, parse le JSON, normalise les erreurs.
// Toutes les pages importent `api` plutôt que de réécrire `fetch` partout.

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const TOKEN_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setTokens({ access_token, refresh_token }) {
  if (access_token) localStorage.setItem(TOKEN_KEY, access_token)
  if (refresh_token) localStorage.setItem(REFRESH_KEY, refresh_token)
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

// Erreur HTTP enrichie (status + message backend) pour pouvoir l'afficher proprement.
export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path, { method = 'GET', body, auth = true, headers = {} } = {}) {
  const finalHeaders = { 'Content-Type': 'application/json', ...headers }
  const token = getToken()
  if (auth && token) finalHeaders.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (networkErr) {
    throw new ApiError('Impossible de joindre le serveur. Est-il démarré ?', 0)
  }

  if (res.status === 204) return null

  let data = null
  try {
    data = await res.json()
  } catch (_) {
    /* réponse sans corps JSON */
  }

  if (!res.ok) {
    const message = data?.message || data?.msg || data?.error || `Erreur ${res.status}`
    throw new ApiError(message, res.status)
  }
  return data
}

export const api = {
  request,

  // --- Auth ---
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  register: (payload) =>
    request('/auth/register', { method: 'POST', body: payload, auth: false }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/users/me'),
  forgotPassword: (email) =>
    request('/auth/forgot-password', { method: 'POST', body: { email }, auth: false }),
  resetPassword: (reset_token, password) =>
    request('/auth/reset-password', { method: 'POST', body: { reset_token, password }, auth: false }),

  // --- Users ---
  getUsers: (params = '') => request(`/users${params}`),

  // --- Companies ---
  getCompanies: () => request('/companies'),
  createCompany: (payload) => request('/companies', { method: 'POST', body: payload }),
  updateCompany: (id, payload) => request(`/companies/${id}`, { method: 'PATCH', body: payload }),

  // --- Users (admin) ---
  createUser: (payload) => request('/users', { method: 'POST', body: payload }),
  deactivateUser: (id) => request(`/users/${id}/deactivate`, { method: 'PATCH' }),
  resetUserPassword: (id, password) =>
    request(`/users/${id}/reset-password`, { method: 'POST', body: { password } }),

  // --- Trainings ---
  getTrainings: () => request('/trainings'),
  createTraining: (payload) => request('/trainings', { method: 'POST', body: payload }),
  updateTraining: (id, payload) => request(`/trainings/${id}`, { method: 'PATCH', body: payload }),
  expressInterest: (id) => request(`/trainings/${id}/interest`, { method: 'POST' }),
  removeInterest: (id) => request(`/trainings/${id}/interest`, { method: 'DELETE' }),

  // --- News ---
  getNews: () => request('/news'),

  // --- Chat ---
  getConversations: () => request('/conversations'),
  getConversationMessages: (id) => request(`/conversations/${id}/messages`),
  getDirectMessages: (otherUserId) => request(`/messages/direct/${otherUserId}`),
  getUnreadCount: () => request('/messages/unread'),
}

export default api
