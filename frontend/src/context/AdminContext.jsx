import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminToken');
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  const loginAdmin = async (email, password) => {
    const { data } = await api.post('/admin/auth/login', { email, password });
    localStorage.setItem('adminToken', JSON.stringify(data));
    setAdmin(data);
    return data;
  };

  const logoutAdmin = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
  };

  return (
    <AdminContext.Provider value={{ admin, loginAdmin, logoutAdmin, loading }}>
      {!loading && children}
    </AdminContext.Provider>
  );
};
