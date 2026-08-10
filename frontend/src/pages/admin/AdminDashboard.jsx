import React, { useContext, useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { AdminContext } from '../../context/AdminContext';
import { Users, Building2, Calendar, ClipboardList, Loader2, ArrowUpRight, Activity } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { admin } = useContext(AdminContext);
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    activeOrganizers: 0,
    totalEvents: 0,
    pendingVerifications: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStatsData(data);
      } catch (error) {
        toast.error('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { name: 'Total Users', value: statsData.totalUsers, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-100' },
    { name: 'Active Organizers', value: statsData.activeOrganizers, icon: Building2, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-100' },
    { name: 'Live Events', value: statsData.totalEvents, icon: Calendar, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-100' },
    { name: 'Pending Registrations', value: statsData.pendingVerifications, icon: ClipboardList, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-100' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto animate-fade-in-up">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100/50">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Overview</h1>
            <p className="text-gray-500 font-medium text-sm">Welcome back, {admin?.name || 'Administrator'} • Here's what's happening today.</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98] focus:outline-none flex items-center gap-2">
              Export Data
            </button>
            <button className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:from-indigo-700 hover:to-blue-700 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] focus:outline-none flex items-center gap-2">
              Generate Report <ArrowUpRight size={16} />
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {isLoading ? (
             <div className="col-span-full flex justify-center py-10 bg-white rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100/50">
               <Loader2 className="animate-spin text-indigo-500" size={40} />
             </div>
          ) : stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-[32px] border border-gray-100/50 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bgColor} ${stat.color} border ${stat.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-black text-gray-900 tracking-tight mb-1">{stat.value}</p>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.name}</p>
                </div>
                <div className={`absolute -right-6 -bottom-6 w-32 h-32 ${stat.bgColor} rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-500 blur-2xl`}></div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity (Enhanced Placeholder) */}
        <div className="bg-white rounded-[32px] border border-gray-100/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden mb-10">
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Recent System Alerts</h2>
            <button className="text-sm text-indigo-600 font-bold hover:text-indigo-700 transition-colors hover:underline">View Full Log</button>
          </div>
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-50 to-emerald-50 rounded-[32px] flex items-center justify-center mb-6 border border-green-100/50 shadow-inner">
              <Activity className="text-green-500" size={40} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Systems Nominal</h3>
            <p className="text-gray-500 font-medium max-w-sm">No critical system alerts or errors reported. All services and infrastructure are running smoothly.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
