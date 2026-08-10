import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, Calendar as CalendarIcon, 
  ClipboardList, CreditCard, AlertCircle, BarChart3, 
  Activity, ScrollText, Settings, LogOut, Terminal 
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
    { name: 'System Logs', path: '/admin/logs', icon: Terminal },
  ];

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col pt-6 pb-4 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 relative">
      <div className="px-6 mb-8">
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center text-lg font-black shadow-[0_0_15px_rgba(79,70,229,0.3)]">C</div>
          CampusEventHub
        </h2>
        <div className="mt-2 text-[10px] text-indigo-500 font-bold uppercase tracking-[0.2em] ml-12">
          Admin Portal
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        <div className="mb-8">
          <p className="px-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Management</p>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm relative overflow-hidden group ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                  }`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>}
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-500 transition-colors'} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mb-4">
          <p className="px-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">System</p>
          <nav className="space-y-1">
            {systemNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm relative overflow-hidden group ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                  }`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>}
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-500 transition-colors'} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="px-4 pt-4 border-t border-gray-100 bg-gray-50/50 mt-2 rounded-t-3xl mx-2">
        <div className="mb-4 px-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-gray-900 truncate">{admin?.name || 'Administrator'}</p>
            <p className="text-xs text-gray-500 font-medium truncate">{admin?.email || 'admin@campuseventhub.com'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 border border-red-100 bg-red-50 rounded-xl hover:bg-red-100 hover:text-red-700 transition-colors font-bold text-sm"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
