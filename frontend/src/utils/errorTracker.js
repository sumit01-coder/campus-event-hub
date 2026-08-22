import axios from 'axios';

let isInitialized = false;

export const initErrorTracker = () => {
  if (isInitialized) return;
  isInitialized = true;

  const sendLogError = (logData) => {
    // Attempt to grab token if user/admin is logged in
    let authHeader = '';
    try {
      const admin = JSON.parse(localStorage.getItem('adminToken'));
      if (admin && admin.token) {
        authHeader = `Bearer ${admin.token}`;
      } else {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
          authHeader = `Bearer ${user.token}`;
        }
      }
    } catch (e) {
      // ignore
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    
    axios.post(`${apiUrl}/logs`, logData, {
      headers: authHeader ? { Authorization: authHeader } : {}
    }).catch(err => console.error('Failed to report UI log to server', err));
  };

  // 1. Catch synchronous uncaught errors (like a direct button click crash)
  window.addEventListener('error', (event) => {
    const error = event.error || {};
    
    const logData = {
      level: 'error',
      message: error.message || event.message || 'Uncaught UI Error',
      context: 'Frontend UI Error',
      url: window.location.href,
      details: {
        type: 'uncaughtException',
        fileName: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: error.stack || 'No stack trace available',
        errorCode: error.code || error.name || 'UNKNOWN_ERR'
      }
    };

    sendLogError(logData);
  });

  // 2. Catch asynchronous uncaught promise rejections (like a failed fetch inside an async onClick without catch)
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason || {};
    
    // Sometimes reason is just a string
    const isErrorObj = reason instanceof Error;
    const message = isErrorObj ? reason.message : (typeof reason === 'string' ? reason : JSON.stringify(reason));
    const stack = isErrorObj ? reason.stack : 'No stack trace available';
    const errorCode = isErrorObj ? (reason.code || reason.name) : 'UNHANDLED_REJECTION';

    const logData = {
      level: 'error',
      message: `Unhandled Promise Rejection: ${message}`,
      context: 'Frontend Async Error',
      url: window.location.href,
      details: {
        type: 'unhandledRejection',
        stack: stack,
        errorCode: errorCode
      }
    };

    sendLogError(logData);
  });

  console.log("Global Error Tracker Initialized");
};
