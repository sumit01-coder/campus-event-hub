import React, { useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { Download, Calendar, TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Mock Data for charts
const registrationData = [
  { name: 'Jan', registrations: 400 },
  { name: 'Feb', registrations: 600 },
  { name: 'Mar', registrations: 850 },
  { name: 'Apr', registrations: 1200 },
  { name: 'May', registrations: 900 },
  { name: 'Jun', registrations: 1500 },
  { name: 'Jul', registrations: 2100 }
];

const revenueData = [
  { name: 'Week 1', amount: 12000 },
  { name: 'Week 2', amount: 15000 },
  { name: 'Week 3', amount: 14000 },
  { name: 'Week 4', amount: 22000 }
];

const categoryData = [
  { name: 'Hackathons', value: 45 },
  { name: 'Workshops', value: 30 },
  { name: 'Cultural', value: 15 },
  { name: 'Sports', value: 10 }
];
const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

export default function AdminReports() {
  const [timeRange, setTimeRange] = useState('This Month');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto animate-fade-in-up">
        
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100/50">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">System Reports</h1>
            <p className="text-gray-500 font-medium text-sm">Generate and view detailed system analytics</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 rounded-xl text-sm font-bold shadow-sm outline-none focus:border-indigo-500"
            >
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
              <option>All Time</option>
            </select>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-5 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 transition-colors">
              <Download size={16} /> Export CSV
            </button>
          </div>
        </header>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-[24px] border border-gray-100/50 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-[16px] bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Users</p>
              <h3 className="text-2xl font-black text-gray-900">24,592</h3>
              <p className="text-xs font-bold text-emerald-500 mt-1 flex items-center gap-1"><TrendingUp size={12} /> +12% this month</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-[24px] border border-gray-100/50 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-[16px] bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Events Hosted</p>
              <h3 className="text-2xl font-black text-gray-900">1,204</h3>
              <p className="text-xs font-bold text-emerald-500 mt-1 flex items-center gap-1"><TrendingUp size={12} /> +5% this month</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[24px] border border-gray-100/50 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-[16px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
              <h3 className="text-2xl font-black text-gray-900">₹4.2M</h3>
              <p className="text-xs font-bold text-emerald-500 mt-1 flex items-center gap-1"><TrendingUp size={12} /> +18% this month</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[24px] border border-gray-100/50 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-[16px] bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Active Organizers</p>
              <h3 className="text-2xl font-black text-gray-900">342</h3>
              <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1"><TrendingUp size={12} className="rotate-180" /> -2% this month</p>
            </div>
          </div>
        </div>

        {/* Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-gray-100/50 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-6">User Registration Trends</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={registrationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                    itemStyle={{ color: '#4F46E5' }}
                  />
                  <Area type="monotone" dataKey="registrations" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorRegs)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary Chart */}
          <div className="bg-white rounded-[32px] p-8 border border-gray-100/50 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-6">Events by Category</h3>
            <div className="h-64 w-full flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {categoryData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-sm font-bold text-gray-700">{item.name} <span className="text-gray-400 font-medium">({item.value}%)</span></span>
                </div>
              ))}
            </div>
          </div>

          {/* Third Chart */}
          <div className="lg:col-span-3 bg-white rounded-[32px] p-8 border border-gray-100/50 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-6">Weekly Platform Revenue</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    cursor={{fill: '#F3F4F6'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="amount" fill="#10B981" radius={[8, 8, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
