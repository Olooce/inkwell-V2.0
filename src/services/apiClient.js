import axios from 'axios'

const origin = typeof window !== 'undefined' ? window.location.origin : ''
const isDev = import.meta.env.MODE === 'development'

// In production the backend is reverse-proxied under /api.
export const BASE_URL = (isDev && import.meta.env.VITE_DEV_BASE_URL) || `${origin}/api`

export const IMAGE_URL = (isDev && import.meta.env.VITE_DEV_IMAGE_URL) || `${BASE_URL}/static`

const ACCESS_KEY = 'user-token'
const REFRESH_KEY = 'refresh-token'

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set(access, refresh) {
    localStorage.setItem(ACCESS_KEY, access.startsWith('Bearer ') ? access : `Bearer ${access}`)
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

export const assetUrl = (path) => {
  if (!path) return ''
  if (/^https?:\/\//.test(path)) return path
  return `${IMAGE_URL}/${path.replace(/^\/+/, '')}`
}

/** Extracts a human-readable message from an axios/fetch error. Backend errors are `{ error }`. */
export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!error) return fallback
  if (error.code === 'ERR_NETWORK') return 'Can’t reach the server. Check your connection and try again.'
  if (error.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.'
  const data = error.response?.data
  if (data && typeof data === 'object' && typeof data.error === 'string') return data.error
  return error.isUserFacing ? error.message : fallback
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess()
  if (token) config.headers.Authorization = token
  return config
})

// A single in-flight refresh shared by every request that hit a 401 at the same time.
let refreshPromise = null

export const refreshAccessToken = () => {
  if (!refreshPromise) {
    const refreshToken = tokenStorage.getRefresh()
    refreshPromise = (
      refreshToken
        ? axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken })
        : Promise.reject(new Error('No refresh token'))
    )
      .then(({ data }) => {
        tokenStorage.set(data.access, data.refresh)
        return tokenStorage.getAccess()
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

export const expireSession = () => {
  tokenStorage.clear()
  localStorage.removeItem('user-data')
  const here = window.location.pathname + window.location.search
  if (!window.location.pathname.startsWith('/login')) {
    window.location.assign(`/login?expired=1&redirect=${encodeURIComponent(here)}`)
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const isAuthCall = original?.url?.startsWith('/auth/')
    if (error.response?.status !== 401 || !original || isAuthCall || original._retry) {
      return Promise.reject(error)
    }

    original._retry = true
    try {
      original.headers.Authorization = await refreshAccessToken()
      return apiClient(original)
    } catch {
      expireSession()
      return Promise.reject(error)
    }
  },
)

export const authFetch = async (path, init = {}) => {
  const send = () =>
    fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { ...init.headers, Authorization: tokenStorage.getAccess() || '' },
    })

  let response = await send()
  if (response.status === 401) {
    try {
      await refreshAccessToken()
    } catch {
      expireSession()
      return response
    }
    response = await send()
  }
  return response
}

export default apiClient
