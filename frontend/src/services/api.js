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

// Interceptor to catch and log errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Avoid infinite loop if the log request itself fails
    if (error.config && error.config.url !== '/logs') {
      const logData = {
        level: 'error',
        message: error.response?.data?.message || error.message || 'Unknown API Error',
        context: 'Frontend API',
        url: error.config?.url,
        details: {
          status: error.response?.status,
          method: error.config?.method,
          data: error.config?.data,
        }
      };
      
      const authHeader = error.config?.headers?.Authorization;
      // Fire and forget
      axios.post('http://localhost:5000/api/logs', logData, {
        headers: authHeader ? { Authorization: authHeader } : {}
      }).catch(err => console.error('Failed to report log to server', err));
    }
    
    return Promise.reject(error);
  }
);

export default api;
