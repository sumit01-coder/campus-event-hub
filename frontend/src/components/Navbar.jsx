import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SidebarContext } from '../context/SidebarContext';
import { LogOut, User, Bell, ChevronDown, Menu, Megaphone, X } from 'lucide-react';
import api from '../services/api';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { toggleSidebar } = useContext(SidebarContext);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    
    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/notifications');
        setNotifications(data);
      } catch (err) {
        console.error('Failed to fetch notifications');
      }
    };
    fetchNotifications();

    // Connect to socket with auth token
    const userObj = JSON.parse(localStorage.getItem('user'));
    const token = userObj?.token || '';
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token }
    });
    socket.on('connect', () => {
      socket.emit('join_user', user._id);
    });

    socket.on('new_notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
      
      // Play notification sound
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 1.0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => console.log('Audio autoplay blocked by browser', e));
        }
      } catch (err) {
        console.log('Audio playback failed', err);
      }

      // Show toast if it's an announcement
      if (notif.title && notif.title.includes('Announcement:')) {
        const eventTitle = notif.title.replace('Announcement: ', '');
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-gradient-to-br from-indigo-600 to-indigo-800 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden border border-indigo-400/30 transform transition-all`}>
            <div className="p-5 flex-1 w-0">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shadow-inner backdrop-blur-sm border border-white/10">
                    <Megaphone size={24} />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-xs font-black text-indigo-200 uppercase tracking-widest mb-1">
                    Live Broadcast
                  </p>
                  <p className="text-base font-bold text-white leading-tight mb-2">
                    {eventTitle}
                  </p>
                  <p className="text-sm text-indigo-50 font-medium leading-relaxed bg-white/10 p-3 rounded-lg border border-white/5">
                    {notif.message}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-indigo-400/20 bg-indigo-900/20">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-bold text-indigo-200 hover:text-white hover:bg-indigo-700/50 focus:outline-none transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        ), { duration: 10000, position: 'top-right' });
      }
    });

    return () => socket.close();
  }, [user]);

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark notifications as read');
    }
  };

  const clearAllNotifications = async () => {
    try {
      await api.delete('/notifications/clear-all');
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications');
      toast.error('Failed to clear notifications');
    }
  };

  const handleNotificationClick = (notif) => {
    if (notif.link) {
      navigate(notif.link);
      setIsNotificationsOpen(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-white shadow-[0_4px_32px_rgba(0,0,0,0.04)] transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Mobile Menu Toggle & Logo */}
          <div className="flex items-center md:w-1/4 gap-3">
            <button 
              onClick={toggleSidebar} 
              className="md:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="CampusConnect Hub Logo" className="h-16 md:h-20 w-auto object-contain -ml-2 drop-shadow-md" onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }} />
              <div style={{ display: 'none' }} className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                C
              </div>
            </Link>
          </div>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center justify-center gap-8 w-2/4">
          <Link to="/" className="px-4 py-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 font-bold text-[14px] transition-all duration-300">
            Home
          </Link>
            <Link to="/dashboard" className="px-4 py-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 font-bold text-[14px] transition-all duration-300">
              Explore Events
            </Link>
            <Link to="/features" className="px-4 py-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 font-bold text-[14px] transition-all duration-300">
              Features
            </Link>
            <Link to="/pricing" className="px-4 py-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 font-bold text-[14px] transition-all duration-300">
              Pricing
            </Link>
            <div className="relative group">
              <div className="px-4 py-2 rounded-full flex items-center gap-1.5 cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 font-bold text-[14px] transition-all duration-300">
                Resources <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
              </div>
              
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-56 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 origin-top">
                <Link to="/help" className="block px-5 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-bold transition-colors">Help Center</Link>
                <Link to="/blog" className="block px-5 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-bold transition-colors">Blog</Link>
                <Link to="/guidelines" className="block px-5 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-bold transition-colors">Community Guidelines</Link>
                <Link to="/api" className="block px-5 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-bold transition-colors">API Documentation</Link>
              </div>
            </div>
            
          </div>

          {/* Auth Actions */}
          <div className="flex items-center justify-end w-1/4 gap-5">
            {user ? (
              <>
                {/* Notifications Dropdown */}
                <div className="relative" ref={notificationsRef}>
                  <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className={`relative w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${isNotificationsOpen ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100/80 text-gray-500 hover:text-gray-900'}`}
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                  </button>

                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-100 py-3 z-50 animate-fade-in-up origin-top-right">
                      <div className="px-4 pb-3 border-b border-gray-50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900">Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{unreadCount} New</span>
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <button onClick={clearAllNotifications} className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors">
                            Clear All
                          </button>
                        )}
                      </div>
                      
                      <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-sm text-gray-500">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map(notif => (
                            <div 
                              key={notif._id} 
                              onClick={() => handleNotificationClick(notif)}
                              className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50/50 ${!notif.isRead ? 'bg-indigo-50/30' : 'opacity-70'}`}
                            >
                              <p className="text-sm text-gray-800 font-medium line-clamp-2">
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', month: 'short', day: 'numeric'})}
                              </p>
                            </div>
                          ))
                        )}
                      </div>

                      {unreadCount > 0 && (
                        <div className="px-4 pt-3 border-t border-gray-50 text-center">
                          <button onClick={markAllAsRead} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Mark all as read</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                
                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-full transition-all duration-300 ${isDropdownOpen ? 'bg-gray-100' : 'hover:bg-gray-100/80'}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-white shadow-sm overflow-hidden flex items-center justify-center">
                       <User size={16} className="text-gray-500" />
                    </div>
                    <span className="text-[14px] font-bold text-gray-700">{user.name || 'User'}</span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-gray-100 py-2 z-50 animate-fade-in-up origin-top-right">
                      <div className="px-4 py-3 border-b border-gray-50 mb-2">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      
                      <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                        <User size={16} /> My Profile
                      </Link>
                      
                      <Link to="/settings" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        Settings
                      </Link>
                      
                      <div className="h-px bg-gray-100 my-2 mx-4"></div>
                      
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} /> Log out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden md:block text-gray-600 hover:text-gray-900 font-bold text-[14px] transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="bg-[#2563EB] hover:bg-blue-700 text-white px-4 md:px-7 py-2 md:py-2.5 rounded-full font-bold text-xs md:text-[14px] transition-all duration-300 shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.4)] hover:-translate-y-0.5">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
