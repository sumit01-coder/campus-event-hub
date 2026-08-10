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
    { name: 'My Tickets', path: '/events', icon: Calendar },
    { name: 'My Hosted Events', path: '/hosted-events', icon: Building },
  ];

  const organizerNavItems = user?.capabilities?.organizer ? [
    { name: 'Host an Event', path: '/host', icon: PlusCircle },
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
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[55] transition-opacity duration-300" 
          onClick={toggleSidebar}
        />
      )}
      <div className={`bg-white/95 backdrop-blur-xl border-r border-gray-200 flex flex-col pt-4 pb-4 fixed top-0 md:top-20 left-0 h-full md:h-[calc(100vh-80px)] overflow-y-auto transition-all duration-300 z-[60] md:z-40 transform ${isOpen ? 'w-64 translate-x-0' : 'w-64 md:w-[72px] -translate-x-full md:translate-x-0'}`}>
        
        {/* Mobile Header (Only visible on small screens) */}
        <div className="md:hidden px-4 mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="font-bold text-gray-900 text-lg">Menu</div>
          <button onClick={toggleSidebar} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-xl">
             <Menu size={22} />
          </button>
        </div>
        
        {/* Toggle Button (Desktop only) */}
        <div className="hidden md:flex px-4 mb-6 justify-start">
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
              className={`flex items-center ${isOpen ? 'gap-3' : 'md:gap-0 gap-3'} px-3 py-3 rounded-xl transition-all overflow-hidden font-medium text-[15px] group ${
                isActive
                  ? 'text-indigo-700 bg-indigo-50'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center min-w-[24px]">
                <Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} />
              </div>
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 max-w-[200px]' : 'md:opacity-0 md:max-w-0 opacity-100 max-w-[200px]'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* Section Divider */}
        <div className="px-3 pt-6 pb-2 relative flex items-center justify-center min-h-[48px]">
          <span className={`text-xs font-semibold text-gray-500 transition-all duration-300 whitespace-nowrap absolute left-4 ${isOpen ? 'opacity-100' : 'md:opacity-0'}`}>
            Your Account
          </span>
          <div className={`h-[1px] bg-gray-200 transition-all duration-300 ${isOpen ? 'w-0 opacity-0' : 'md:w-8 md:opacity-100 w-0 opacity-0'}`} />
        </div>

        {footerNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center ${isOpen ? 'gap-3' : 'md:gap-0 gap-3'} px-3 py-3 rounded-xl transition-all overflow-hidden font-medium text-[15px] group ${
                isActive
                  ? 'text-indigo-700 bg-indigo-50'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center min-w-[24px]">
                <Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} />
              </div>
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 max-w-[200px]' : 'md:opacity-0 md:max-w-0 opacity-100 max-w-[200px]'}`}>
                {item.name}
              </span>
              {isOpen && <ChevronRight size={16} className="ml-auto text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </Link>
          );
        })}
      </nav>

        <div className="mt-4 px-3">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${isOpen ? 'gap-3' : 'md:gap-0 gap-3'} px-3 py-3 rounded-xl transition-all overflow-hidden font-medium text-[15px] group text-red-500 hover:bg-red-50`}
          >
            <div className="flex items-center justify-center min-w-[24px]">
              <LogOut size={22} strokeWidth={1.75} />
            </div>
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 max-w-[200px]' : 'md:opacity-0 md:max-w-0 opacity-100 max-w-[200px]'}`}>
              Log Out
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
