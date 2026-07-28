import axios from 'axios';

// Single shared axios instance. `withCredentials` lets the browser send
// the httpOnly JWT cookie set by the server on every request.
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Normalize error messages so components can just read err.message
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;
