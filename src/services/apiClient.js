import axios from 'axios'

const BASE_URL = (import.meta.env.MODE === 'development' && import.meta.env.VITE_DEV_BASE_URL) ||
  (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/api` : '/api');

export const IMAGE_URL = (import.meta.env.MODE === 'development' && import.meta.env.VITE_DEV_IMAGE_URL) ||
  (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/api` : '/api');

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
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
    const originalRequest = error.config; // Extract config from error
    const isAuthEndpoint = originalRequest?.url.includes("/auth/refresh") ||
      originalRequest?.url.includes("/auth/login") ||
      originalRequest?.url.includes("/auth/validate_otp") ||
      originalRequest?.url.includes("/auth/logout") ||
      originalRequest?.url.includes("/auth/reset_password");

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (error.response?.status === 403 || error.response?.status === 401) {
      localStorage.removeItem('user-token');
      localStorage.removeItem('user-data');
      localStorage.clear();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);


apiClient.interceptors.response.use(
  (response) => {
    // Ensure the response is JSON
    if (response.headers["content-type"]?.includes("application/json")) {
      return response;
    } else {
      throw new Error("Unexpected HTML response from the server.");
    }
  },
  // (error) => {
  //   console.error("Error with API request:", error);
  //   return Promise.reject(error);
  // }
);

export default apiClient

