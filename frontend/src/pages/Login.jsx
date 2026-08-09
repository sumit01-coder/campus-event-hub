import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen bg-background bg-grid-pattern flex items-center justify-center p-4 relative">
        <div className="saas-card p-10 w-full max-w-md relative z-10 bg-white text-center shadow-xl">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[24px] flex items-center justify-center mx-auto mb-6">
            <User size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You're already logged in!</h2>
          <p className="text-gray-500 font-medium mb-8">You are currently signed in as <span className="text-gray-900 font-bold">{user.name || 'a user'}</span>. There's no need to login again.</p>
          <Link to="/dashboard" className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/20 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all hover:-translate-y-0.5">
            Go to Dashboard <ArrowRight className="ml-2" size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 lg:p-8">
      <div className="max-w-6xl w-full bg-white rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden flex">
        
        {/* Left Side - Branding (Hidden on mobile) */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-purple-700 via-indigo-600 to-blue-600 p-12 flex-col justify-between relative overflow-hidden">
          {/* Abstract background shapes */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 -left-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <Link to="/" className="inline-block">
               <img src="/logo.png" alt="Logo" className="h-16 drop-shadow-md brightness-0 invert" />
            </Link>
            <h1 className="text-4xl font-black text-white mt-16 leading-tight">
              Welcome back to <br/> CampusEventHub.
            </h1>
            <p className="text-indigo-100 mt-6 text-lg font-medium max-w-md">
              Sign in to manage your tickets, host new events, and connect with your campus community.
            </p>
          </div>
          
          <div className="relative z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <p className="text-white font-medium italic mb-4">"Managing our hackathon registrations has never been smoother. Highly recommended!"</p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-purple-400 flex items-center justify-center text-white font-bold text-sm">
                  SJ
                </div>
                <div className="ml-3">
                  <p className="text-white font-bold text-sm">Sarah Jenkins</p>
                  <p className="text-indigo-200 text-xs font-medium">Tech Club President</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-14 lg:p-16 flex flex-col justify-center bg-white relative">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
             <Link to="/">
               <img src="/logo.png" alt="Logo" className="h-12 drop-shadow-sm" />
             </Link>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500 font-medium">Please enter your details to sign in</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                name="email"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                name="password"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end pt-1 pb-2">
              <a href="#" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Forgot Password?</a>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {isLoading ? 'Signing In...' : 'Sign In'} <ArrowRight size={18} />
            </button>
            
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            <button 
              type="button"
              className="w-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>
          </form>

          <p className="mt-8 text-center text-gray-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
