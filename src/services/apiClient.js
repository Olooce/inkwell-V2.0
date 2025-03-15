import axios from 'axios'

const BASE_URL = 'http://localhost:8000/api'

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('user-token')
        if (token) {
            config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403 || error.response?.status === 401) {
            localStorage.removeItem('user-token')
            localStorage.removeItem('user-data')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default apiClient

