import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, Calendar as CalendarIcon, 
  ClipboardList, CreditCard, AlertCircle, BarChart3, 
  Activity, ScrollText, Settings, LogOut 
} from 'lucide-react';
import { AdminContext } from '../../context/AdminContext';

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logoutAdmin } = useContext(AdminContext);

  const mainNavItems = [
    { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Organizers', path: '/admin/organizers', icon: Building2 },
    { name: 'Events', path: '/admin/events', icon: CalendarIcon },
    { name: 'Registrations', path: '/admin/registrations', icon: ClipboardList },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
  ];

  const systemNavItems = [
    { name: 'Issues & Support', path: '/admin/issues', icon: AlertCircle },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'System Health', path: '/admin/health', icon: Activity },
    { name: 'Audit Logs', path: '/admin/audit', icon: ScrollText },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin');
  };

  return (
    <div className="w-64 bg-[#0B1120] border-r border-[#1F2937] h-screen flex flex-col pt-6 pb-4 shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-10 relative">
      <div className="px-6 mb-8">
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center text-lg font-black shadow-[0_0_15px_rgba(79,70,229,0.3)]">C</div>
          CampusEventHub
        </h2>
        <div className="mt-2 text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em] ml-12">
          Admin Portal
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-gray-700">
        <div className="mb-8">
          <p className="px-4 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-3">Management</p>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm relative ${
                    isActive
                      ? 'bg-indigo-600/10 text-indigo-400'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>}
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mb-4">
          <p className="px-4 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-3">System</p>
          <nav className="space-y-1">
            {systemNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm relative ${
                    isActive
                      ? 'bg-indigo-600/10 text-indigo-400'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>}
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="px-4 pt-4 border-t border-[#1F2937]">
        <div className="mb-4 px-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{admin?.name || 'Administrator'}</p>
            <p className="text-xs text-gray-400 font-medium truncate">{admin?.email || 'admin@campuseventhub.com'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-400 border border-red-900/30 bg-red-900/10 rounded-xl hover:bg-red-900/20 hover:text-red-300 transition-colors font-bold text-sm"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
