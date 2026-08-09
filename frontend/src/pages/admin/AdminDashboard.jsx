import React, { useContext, useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { AdminContext } from '../../context/AdminContext';
import { Users, Building2, Calendar, ClipboardList, Loader2 } from 'lucide-react';
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
    { name: 'Total Users', value: statsData.totalUsers, icon: Users, color: 'bg-blue-500' },
    { name: 'Active Organizers', value: statsData.activeOrganizers, icon: Building2, color: 'bg-purple-500' },
    { name: 'Live Events', value: statsData.totalEvents, icon: Calendar, color: 'bg-green-500' },
    { name: 'Pending Registrations', value: statsData.pendingVerifications, icon: ClipboardList, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto animate-fade-in-up">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-3xl shadow-sm border border-gray-100/50">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Overview</h1>
            <p className="text-gray-500 font-medium">Welcome back, {admin?.name || 'Administrator'}</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Generate Report
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {isLoading ? (
             <div className="col-span-full flex justify-center py-10">
               <Loader2 className="animate-spin text-primary" size={40} />
             </div>
          ) : stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-3xl border border-gray-100/50 p-6 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 flex items-center gap-5 relative overflow-hidden group">
                <div className={`absolute right-0 top-0 w-32 h-32 ${stat.color} opacity-5 rounded-bl-full pointer-events-none group-hover:scale-125 group-hover:opacity-10 transition-all duration-500`}></div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${stat.color} shrink-0`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.name}</p>
                  <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity (Placeholder) */}
        <div className="bg-white rounded-3xl border border-gray-100/50 shadow-sm overflow-hidden mb-10">
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-black text-gray-900 tracking-tight">Recent System Alerts</h2>
            <button className="text-sm text-indigo-600 font-bold hover:text-indigo-700 transition-colors bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg">View All &rarr;</button>
          </div>
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-green-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-green-100/50">
              <ClipboardList className="text-green-500" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Systems Nominal</h3>
            <p className="text-gray-500 font-medium">No critical system alerts found.<br/>All systems are healthy and operational.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
