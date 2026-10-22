import axios from 'axios';

const API = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to attach JWT token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('ehb_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for global auth handling
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear token on 401 Unauthorized
            localStorage.removeItem('ehb_token');
            localStorage.removeItem('ehb_user');
            if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
                window.location.href = '/login?session=expired';
            }
        }
        return Promise.reject(error);
    }
);

export default API;
