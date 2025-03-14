const API_BASE_URL = 'https://366a-105-161-150-104.ngrok-free.app/api';

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login/`,
        REGISTER: `${API_BASE_URL}/auth/register/`,
        LOGOUT: `${API_BASE_URL}/auth/logout/`,
    },
    ASSESSMENT: {
        START: `${API_BASE_URL}/assessment/start_assessment/`,
        SUBMIT: `${API_BASE_URL}/assessment/submit_answer/`,
        COMPLETE: `${API_BASE_URL}/assessment/complete_assessment/`
    }
};

export const getAuthHeaders = () => {
    const token = localStorage.getItem('user-token');
    return {
        'Authorization': token,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
};