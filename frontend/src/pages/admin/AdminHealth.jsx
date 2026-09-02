import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';
import { Loader2, Activity, Server, Database, Clock, Cpu, RefreshCw, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminHealth() {
  const [healthData, setHealthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHealth = async () => {
    try {
      setIsRefreshing(true);
      const { data } = await api.get('/admin/health');
      setHealthData(data);
    } catch (error) {
      toast.error('Failed to fetch system health data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / (3600*24));
    const hours = Math.floor(seconds % (3600*24) / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto animate-fade-in-up">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100/50">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">System Health</h1>
            <p className="text-gray-500 font-medium text-sm">Monitor server metrics, database performance, and API status</p>
          </div>
          
          <button 
            onClick={fetchHealth}
            disabled={isRefreshing}
            className="px-5 py-2.5 bg-indigo-50 text-indigo-700 font-bold text-sm rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-2 border border-indigo-200 shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-[32px] border border-gray-100/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
          </div>
        ) : healthData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            
            {/* API Status */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-[16px] bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <Activity size={24} />
                </div>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">API Status</p>
                <h3 className="text-2xl font-black text-gray-900">Operational</h3>
                <p className="text-xs text-gray-400 mt-2 font-medium">Last checked: {new Date(healthData.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>

            {/* Uptime */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-[16px] bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Clock size={24} />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Server Uptime</p>
                <h3 className="text-3xl font-black text-gray-900">{formatUptime(healthData.uptime)}</h3>
                <p className="text-xs text-gray-400 mt-2 font-medium">Since last deployment/restart</p>
              </div>
            </div>

            {/* Database */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-[16px] bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <Database size={24} />
                </div>
                <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${healthData.database.status === 'Connected' ? 'text-emerald-700 bg-emerald-100/50' : 'text-red-700 bg-red-100/50'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${healthData.database.status === 'Connected' ? 'bg-emerald-500' : 'bg-red-500'}`}></span> {healthData.database.status}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">MongoDB Status</p>
                <h3 className="text-2xl font-black text-gray-900 truncate" title={healthData.database.name}>{healthData.database.name || 'campus-connect'}</h3>
                <p className="text-xs text-gray-400 mt-2 font-medium">Mongoose Connection</p>
              </div>
            </div>

            {/* Memory Usage */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-[16px] bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                  <Server size={24} />
                </div>
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded uppercase tracking-wider">
                  {healthData.cpu.cores} Cores
                </span>
              </div>
              <div>
                <div className="flex justify-between items-end mb-1">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Memory Usage</p>
                  <span className="text-xs font-black text-gray-900">{healthData.memory.usedPercentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2 border border-gray-200 overflow-hidden">
                  <div className={`h-2.5 rounded-full ${parseFloat(healthData.memory.usedPercentage) > 85 ? 'bg-red-500' : parseFloat(healthData.memory.usedPercentage) > 60 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${healthData.memory.usedPercentage}%` }}></div>
                </div>
                <p className="text-xs text-gray-400 font-medium">{healthData.memory.used} / {healthData.memory.total} Used</p>
              </div>
            </div>

            {/* CPU Load Card (Full Width) */}
            <div className="md:col-span-2 xl:col-span-4 bg-white p-8 rounded-[32px] border border-gray-100/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-[12px] bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                    <Cpu size={20} />
                 </div>
                 <h3 className="text-xl font-black text-gray-900">CPU Load Average</h3>
               </div>
               <div className="grid grid-cols-3 gap-6">
                 <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 text-center">
                   <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">1 Minute</p>
                   <p className="text-3xl font-black text-gray-900">{healthData.cpu.loadAvg[0]?.toFixed(2) || '0.00'}</p>
                 </div>
                 <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 text-center">
                   <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">5 Minutes</p>
                   <p className="text-3xl font-black text-gray-900">{healthData.cpu.loadAvg[1]?.toFixed(2) || '0.00'}</p>
                 </div>
                 <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 text-center">
                   <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">15 Minutes</p>
                   <p className="text-3xl font-black text-gray-900">{healthData.cpu.loadAvg[2]?.toFixed(2) || '0.00'}</p>
                 </div>
               </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">Failed to load health data.</div>
        )}
      </main>
    </div>
  );
}
