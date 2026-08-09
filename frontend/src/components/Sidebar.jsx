import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Users, Settings, LogOut, PlusCircle, Building, Menu, ChevronRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { SidebarContext } from '../context/SidebarContext';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { isOpen, toggleSidebar } = useContext(SidebarContext);

  const baseNavItems = [
    { name: 'Explore Events', path: '/dashboard', icon: Home },
    { name: 'My Events', path: '/events', icon: Calendar },
  ];

  const organizerNavItems = user?.capabilities?.organizer ? [
    { name: 'Host an Event', path: '/host', icon: PlusCircle },
    { name: 'My Hosted Events', path: '/hosted-events', icon: Building },
  ] : [];

  const footerNavItems = [
    { name: 'Profile', path: '/profile', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const navItems = [...baseNavItems, ...organizerNavItems];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`bg-white/80 backdrop-blur-xl border-r border-gray-200 flex flex-col pt-4 pb-4 z-40 fixed top-20 left-0 h-[calc(100vh-80px)] overflow-y-auto transition-all duration-300 ${isOpen ? 'w-64' : 'w-[72px]'}`}>
      
      {/* Toggle Button */}
      <div className="px-4 mb-6 flex justify-start">
        <button 
          onClick={toggleSidebar} 
          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <Menu size={22} />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium text-[15px] group ${
                isActive
                  ? 'text-indigo-700 bg-indigo-50'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center min-w-[24px]">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* Section Divider */}
        {isOpen && (
          <div className="px-3 pt-6 pb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Account</p>
          </div>
        )}
        {!isOpen && <div className="h-4"></div>}

        {footerNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium text-[15px] group ${
                isActive
                  ? 'text-indigo-700 bg-indigo-50'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center min-w-[24px]">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
                {item.name}
              </span>
              {isOpen && <ChevronRight size={16} className="ml-auto text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 mt-auto pt-4">
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-3 px-3 py-3 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium text-[15px]"
        >
          <div className="flex items-center justify-center min-w-[24px]">
            <LogOut size={22} />
          </div>
          <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
            Logout
          </span>
        </button>
      </div>
    </div>
  );
}
