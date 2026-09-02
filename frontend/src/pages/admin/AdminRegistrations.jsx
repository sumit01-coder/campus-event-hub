import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';
import { Loader2, Search, Users as UsersIcon, Ticket, MapPin, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const { data } = await api.get('/admin/registrations');
        setRegistrations(data);
      } catch (error) {
        toast.error('Failed to load registrations');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRegistrations();
  }, []);

  const filteredRegistrations = registrations.filter(reg => 
    reg.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    reg.eventId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.teamCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto animate-fade-in-up">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100/50">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Registration Management</h1>
            <p className="text-gray-500 font-medium text-sm">View system-wide event registrations and attendance data</p>
          </div>
          
          <div className="relative w-full md:w-80 shadow-sm rounded-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by participant, event, team code..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 bg-gray-50/80 border-gray-200 py-3.5 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium placeholder-gray-400 shadow-inner"
            />
          </div>
        </header>

        <div className="bg-white rounded-[32px] border border-gray-100/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-indigo-500" size={40} />
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[32px] flex items-center justify-center mb-6 shadow-inner border border-indigo-100/50">
                <Ticket className="text-indigo-400" size={48} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">No Registrations Found</h3>
              <p className="text-gray-500 font-medium max-w-sm">There are no registrations matching your search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-5 text-xs font-extrabold text-gray-500 uppercase tracking-widest">Participant</th>
                    <th className="px-8 py-5 text-xs font-extrabold text-gray-500 uppercase tracking-widest">Event</th>
                    <th className="px-8 py-5 text-xs font-extrabold text-gray-500 uppercase tracking-widest">Type / Team</th>
                    <th className="px-8 py-5 text-xs font-extrabold text-gray-500 uppercase tracking-widest text-right">Reg Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg._id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex flex-col">
                          <p className="text-sm font-black text-gray-900 mb-0.5">{reg.userId?.name || 'Unknown'}</p>
                          <div className="text-xs text-gray-500 font-medium">
                            {reg.userId?.email || 'No email'}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-gray-800">
                        {reg.eventId?.title || 'Unknown Event'}
                        <div className="flex items-center text-[10px] font-medium text-gray-500 mt-0.5 uppercase tracking-wider">
                           <Tag size={10} className="mr-1" /> {reg.eventId?.category || 'Category'}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex gap-2 flex-col items-start">
                           <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${reg.participationType === 'group' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                             {reg.participationType === 'group' ? <><UsersIcon size={10} className="mr-1"/> Group</> : <><Ticket size={10} className="mr-1"/> Individual</>}
                           </span>
                           {reg.participationType === 'group' && (
                             <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                               Code: {reg.teamCode || reg.joinedTeamCode || 'N/A'} {reg.isTeamLeader ? '(Leader)' : ''}
                             </span>
                           )}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right">
                        <div className="text-sm font-bold text-gray-800 mb-0.5">
                          {new Date(reg.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-xs font-medium text-gray-500">
                          {new Date(reg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
