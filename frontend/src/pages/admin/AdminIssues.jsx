import React, { useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { Search, AlertCircle, CheckCircle2, Clock, MessageSquare, MoreVertical, Filter, FilterIcon } from 'lucide-react';

// Mock data for Issues & Support
const initialTickets = [
  { id: 'TKT-8921', user: 'Rahul Sharma', email: 'rahul@student.edu', subject: 'Payment deducted but ticket not generated', status: 'open', priority: 'high', date: '2 hours ago', type: 'Payment' },
  { id: 'TKT-8920', user: 'Priya Patel', email: 'priya.p@student.edu', subject: 'Unable to edit team members for Hackathon', status: 'in-progress', priority: 'medium', date: '5 hours ago', type: 'Technical' },
  { id: 'TKT-8919', user: 'Ankit Kumar', email: 'ankit.k@student.edu', subject: 'Requesting refund for cancelled event', status: 'resolved', priority: 'medium', date: '1 day ago', type: 'Refund' },
  { id: 'TKT-8918', user: 'Sneha Gupta', email: 'sneha.g@student.edu', subject: 'Login issue with university email', status: 'open', priority: 'high', date: '1 day ago', type: 'Account' },
  { id: 'TKT-8917', user: 'Tech Club Admin', email: 'techclub@college.edu', subject: 'Need help setting up multi-day schedule', status: 'resolved', priority: 'low', date: '2 days ago', type: 'Organizer Support' }
];

export default function AdminIssues() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tickets, setTickets] = useState(initialTickets);
  const [filter, setFilter] = useState('all');

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.user.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && ticket.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-50 text-red-600 border-red-200';
      case 'in-progress': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'resolved': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertCircle size={14} className="text-red-500" />;
      case 'medium': return <Clock size={14} className="text-amber-500" />;
      case 'low': return <CheckCircle2 size={14} className="text-emerald-500" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto animate-fade-in-up">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100/50">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Issues & Support</h1>
            <p className="text-gray-500 font-medium text-sm">Handle user reports, disputes, and support tickets</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64 shadow-sm rounded-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
              <input 
                type="text" 
                placeholder="Search tickets..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 bg-gray-50/80 border-gray-200 py-3 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium placeholder-gray-400 shadow-inner"
              />
            </div>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-xl text-sm font-bold shadow-sm outline-none focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Ticket List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredTickets.length === 0 ? (
              <div className="bg-white rounded-[32px] p-20 text-center border border-gray-100/50 shadow-sm">
                <MessageSquare className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-900 mb-1">No Tickets Found</h3>
                <p className="text-gray-500">You're all caught up!</p>
              </div>
            ) : (
              filteredTickets.map(ticket => (
                <div key={ticket.id} className="bg-white p-6 rounded-[24px] border border-gray-100/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                        {ticket.id}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('-', ' ')}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200 flex items-center gap-1">
                        {getPriorityIcon(ticket.priority)} {ticket.priority} Priority
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-400">{ticket.date}</span>
                  </div>
                  
                  <h3 className="text-lg font-black text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{ticket.subject}</h3>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                        {ticket.user.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-none">{ticket.user}</p>
                        <p className="text-xs text-gray-500 font-medium">{ticket.email}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      {ticket.type}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar Metrics */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-6">Queue Overview</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-indigo-700/50 pb-4">
                  <span className="text-indigo-100 font-medium">Open Tickets</span>
                  <span className="text-4xl font-black">{tickets.filter(t => t.status === 'open').length}</span>
                </div>
                <div className="flex justify-between items-end border-b border-indigo-700/50 pb-4">
                  <span className="text-indigo-100 font-medium">In Progress</span>
                  <span className="text-2xl font-bold text-indigo-200">{tickets.filter(t => t.status === 'in-progress').length}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-indigo-100 font-medium">Resolved Today</span>
                  <span className="text-2xl font-bold text-emerald-400">12</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-gray-100/50 shadow-sm">
               <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">Average Resolution Time</h3>
               <div className="text-center">
                 <div className="text-4xl font-black text-indigo-600 mb-2">4.2 <span className="text-xl text-gray-400">hours</span></div>
                 <p className="text-sm text-gray-500 font-medium border border-gray-100 bg-gray-50 rounded-lg py-2 inline-block px-4">↓ 12% from last week</p>
               </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
