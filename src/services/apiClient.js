import axios from 'axios';
import { toast } from 'vue3-toastify'

const BASE_URL = import.meta.env.MODE === 'development' && import.meta.env.VITE_DEV_BASE_URL
  ? import.meta.env.VITE_DEV_BASE_URL
  : (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/api` : '/api');

export const IMAGE_URL = import.meta.env.MODE === 'development' && import.meta.env.VITE_DEV_IMAGE_URL
  ? import.meta.env.VITE_DEV_IMAGE_URL
  : (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/api` : '/api');

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
  withCredentials: true,
  timeout: 15000,
});

let isRefreshing = false;

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('user-token');
    if (token) {
      config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    console.log("Error response:", error);

    const isAuthEndpoint = [
      "/auth/refresh",
      "/auth/login",
      "/auth/validate_otp",
      "/auth/logout",
      "/auth/reset_password"
    ].some((endpoint) => originalRequest.url.includes(endpoint));

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      await handleLogout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!isRefreshing) {
        isRefreshing = true;
        const refreshResponse = await apiClient.post("/auth/refresh", {
          refreshToken: localStorage.getItem('refresh-token')
        });

        if (refreshResponse.status === 200) {
          const { access, refresh } = refreshResponse.data;
          localStorage.setItem('user-token', access);
          localStorage.setItem('refresh-token', refresh);

          originalRequest.headers.Authorization = `Bearer ${access}`;
          isRefreshing = false;
          return apiClient(originalRequest);
        }
      }
    } catch (refreshError) {
     toast.error(refreshError.message);
    } finally {
      isRefreshing = false;
    }

    await handleLogout();
    return Promise.reject(error);
  }
);

const handleLogout = async () => {
  try {
    await apiClient.post("/auth/logout");
  } catch (logoutError) {
   toast.error(logoutError.message);
  } finally {
    localStorage.clear();
    window.location.href = "/login";
  }
};

export default apiClient;
