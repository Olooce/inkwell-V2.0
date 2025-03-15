import axios from 'axios'

const BASE_URL = 'https://849a-2c0f-fe38-218d-5beb-ed10-2ac2-d416-ba7.ngrok-free.app//api'

export const IMAGE_URL = 'https://849a-2c0f-fe38-218d-5beb-ed10-2ac2-d416-ba7.ngrok-free.app/'

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
            localStorage.clear()
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

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

