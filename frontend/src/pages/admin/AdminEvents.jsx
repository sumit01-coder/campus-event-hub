import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';
import { Loader2, Search, Calendar as CalendarIcon, MapPin, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await api.get('/admin/events');
        setEvents(data);
      } catch (error) {
        console.error('Events fetch error:', error.response?.data || error);
        toast.error('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    event.organizerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto animate-fade-in-up">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100/50">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Event Management</h1>
            <p className="text-gray-500 font-medium text-sm">Moderate and manage all events published on the platform</p>
          </div>
          
          <div className="relative w-full md:w-80 shadow-sm rounded-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
            <input 
              type="text" 
              placeholder="Search events by title, organizer..." 
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
          ) : filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[32px] flex items-center justify-center mb-6 shadow-inner border border-indigo-100/50">
                <CalendarIcon className="text-indigo-400" size={48} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">No Events Found</h3>
              <p className="text-gray-500 font-medium max-w-sm">There are no events matching your current search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-5 text-xs font-extrabold text-gray-500 uppercase tracking-widest">Event</th>
                    <th className="px-8 py-5 text-xs font-extrabold text-gray-500 uppercase tracking-widest">Organizer</th>
                    <th className="px-8 py-5 text-xs font-extrabold text-gray-500 uppercase tracking-widest">Status/Type</th>
                    <th className="px-8 py-5 text-xs font-extrabold text-gray-500 uppercase tracking-widest text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEvents.map((event) => (
                    <tr key={event._id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex flex-col">
                          <p className="text-sm font-black text-gray-900 mb-0.5">{event.title}</p>
                          <div className="flex items-center text-xs text-gray-500 font-medium">
                            <MapPin size={12} className="mr-1 opacity-70" /> {event.venue || 'TBA'}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-gray-800">
                        {event.organizerId?.name || 'Unknown'}
                        <div className="text-xs font-medium text-gray-500 mt-0.5">{event.organizerId?.email}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex gap-2 flex-col items-start">
                           <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase tracking-wider border border-indigo-100">
                             <Tag size={10} className="mr-1.5" /> {event.category}
                           </span>
                           <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${new Date(event.date) < new Date() ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                             {new Date(event.date) < new Date() ? 'Past' : 'Upcoming'}
                           </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right">
                        <div className="text-sm font-bold text-gray-800 mb-0.5">
                          {new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-xs font-medium text-gray-500">
                          {event.time}
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
