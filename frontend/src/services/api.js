import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust if backend port changes
});

// Interceptor to add JWT to every request
api.interceptors.request.use(
  (config) => {
    // If it's an admin request, prioritize admin token
    if (config.url && config.url.includes('/admin')) {
      const admin = JSON.parse(localStorage.getItem('adminToken'));
      if (admin && admin.token) {
        config.headers.Authorization = `Bearer ${admin.token}`;
        return config;
      }
    }

    // Otherwise, use user token
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
