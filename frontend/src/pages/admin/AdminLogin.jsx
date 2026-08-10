import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import { AdminContext } from '../../context/AdminContext';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [formData, setFormData] = useState({ 
    email: 'admin@campuseventhub.com', 
    password: 'Admin@1234' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const { loginAdmin } = useContext(AdminContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await loginAdmin(formData.email, formData.password);
      toast.success('Admin authentication successful');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#F8FAFC]">
      {/* Dynamic Background Effects (Light, Warm Theme) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-orange-100/60 blur-[100px]"></div>
        <div className="absolute top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-100/60 blur-[100px]"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[70%] h-[70%] rounded-full bg-blue-100/50 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md px-6 relative z-10 animate-fade-in-up">
        {/* Logo/Brand Section */}
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-6 relative">
            <div className="absolute inset-0 bg-white/20 rounded-2xl"></div>
            <ShieldCheck size={32} className="text-white relative z-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Portal</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium tracking-wide uppercase">Secure Enterprise Access</p>
        </div>

        {/* Glassmorphic Login Card (Light Theme) */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[32px] border border-white shadow-[0_8px_32px_rgba(0,0,0,0.04)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-indigo-500 to-blue-500 opacity-80"></div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm font-medium shadow-inner"
                  placeholder="admin@campuseventhub.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                  Forgot Password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm font-medium tracking-widest shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-200 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                'Secure Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Security Badge Footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
          <Lock size={12} />
          <span className="text-xs font-medium">Encrypted SSL connection</span>
        </div>
      </div>
    </div>
  );
}
