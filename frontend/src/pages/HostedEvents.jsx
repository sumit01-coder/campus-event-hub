import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Calendar as CalendarIcon, Users, MapPin, Clock, Edit3, Trash2, PlusCircle, Loader2, Users2, MessageSquare, Bookmark, ChevronRight, Tag } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import EditEventModal from '../components/EditEventModal';
import ManageCoordinatorsModal from '../components/ManageCoordinatorsModal';
import { SidebarContext } from '../context/SidebarContext';

export default function HostedEvents() {
  const { user } = useContext(AuthContext);
  const { isOpen } = useContext(SidebarContext);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState(null);
  const [selectedEventForCoordinators, setSelectedEventForCoordinators] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        if (!user?._id) return;
        const { data } = await api.get(`/events?organizerId=${user._id}`);
        setEvents(data);
      } catch (error) {
        toast.error('Failed to load your hosted events.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyEvents();
  }, [user]);

  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      try {
        await api.delete(`/events/${eventId}`);
        setEvents(events.filter(e => e._id !== eventId));
        toast.success("Event deleted successfully");
      } catch (error) {
        toast.error("Failed to delete event");
      }
    }
  };

  const handleEventUpdated = (updatedEvent) => {
    setEvents(events.map(e => e._id === updatedEvent._id ? updatedEvent : e));
    
    if (selectedEventForCoordinators && selectedEventForCoordinators._id === updatedEvent._id) {
      setSelectedEventForCoordinators(updatedEvent);
    }
    if (selectedEventForEdit && selectedEventForEdit._id === updatedEvent._id) {
      setSelectedEventForEdit(updatedEvent);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 flex pt-20 transition-all duration-300 pl-0 ${isOpen ? 'md:pl-64' : 'md:pl-[72px]'}`}>
      <Navbar />
      <Sidebar />
      <main className="flex-1 w-full p-6 lg:p-8 overflow-y-auto animate-fade-in-up">
        
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">My Hosted Events</h1>
            <p className="text-lg text-gray-500 font-medium">Manage events you have created for the campus.</p>
          </div>
          <button 
            onClick={() => navigate('/host')}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <PlusCircle size={20} />
            Create New Event
          </button>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-blue-100">
              <CalendarIcon className="text-blue-500" size={40} />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-3">No Events Hosted Yet</h3>
            <p className="text-gray-500 mb-8 max-w-md">You haven't created any events. Start hosting and bring your campus community together!</p>
            <button 
              onClick={() => navigate('/host')}
              className="px-8 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors"
            >
              Host Your First Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden flex flex-col group hover:-translate-y-1">
                {/* Image Section */}
                <div className="h-48 relative overflow-hidden bg-gray-200 rounded-t-2xl">
                  <img 
                    src={event.image?.startsWith('/') ? `http://localhost:5000${event.image}` : event.image} 
                    alt={event.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'; }}
                  />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-bold text-white border border-white/10 uppercase tracking-widest flex items-center gap-1.5 shadow-xl">
                    <Tag size={12} />
                    {event.category}
                  </div>
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-1.5 rounded-xl text-sm font-bold text-white shadow-lg">
                    {event.price === 0 ? 'FREE' : `₹${event.price}`}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col bg-white">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">{event.title}</h3>
                    <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors border border-gray-100 shrink-0">
                      <Bookmark size={20} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed">{event.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                          <CalendarIcon size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date</p>
                          <p className="text-sm font-bold text-gray-900">{new Date(event.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl">
                          <Clock size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Time</p>
                          <p className="text-sm font-bold text-gray-900">{event.time}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl border border-gray-100 group/venue hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2.5 bg-green-50 text-green-600 rounded-xl shrink-0">
                          <MapPin size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Venue</p>
                          <p className="text-sm font-bold text-gray-900 truncate">{event.venue}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 group-hover/venue:text-gray-600 shrink-0" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl border border-gray-100 group/cap hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl shrink-0">
                          <Users size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Capacity</p>
                          <p className="text-sm font-bold text-gray-900">{event.capacity} Capacity</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 group-hover/cap:text-gray-600 shrink-0" />
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <button 
                        onClick={() => navigate(`/hosted-events/${event._id}/registrations`)}
                        className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <Users2 size={18} />
                          <span>Registrations</span>
                        </div>
                        <ChevronRight size={16} className="opacity-80" />
                      </button>
                      <button 
                        onClick={() => navigate(`/hosted-events/${event._id}/queries`)}
                        className="flex items-center justify-between px-4 py-3.5 bg-purple-50 text-purple-700 font-bold text-sm rounded-xl hover:bg-purple-100 transition-colors border border-purple-100"
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare size={18} />
                          <span>Live Queries</span>
                        </div>
                        <ChevronRight size={16} className="opacity-80" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between gap-3">
                      {event.organizerId === user._id || event.organizerId?._id === user._id ? (
                        <>
                          <button 
                            onClick={() => setSelectedEventForCoordinators(event)}
                            className="flex-1 flex items-center justify-between px-4 py-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-sm rounded-xl transition-colors border border-emerald-100"
                          >
                            <div className="flex items-center gap-2">
                              <Users size={18} />
                              <span>Manage Volunteers</span>
                            </div>
                            <ChevronRight size={16} className="opacity-80" />
                          </button>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setSelectedEventForEdit(event)}
                              className="p-3 text-gray-400 hover:text-indigo-600 bg-white border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 rounded-xl transition-colors shadow-sm"
                              title="Edit Event"
                            >
                              <Edit3 size={20} />
                            </button>
                            <button 
                              onClick={() => handleDelete(event._id)}
                              className="p-3 text-red-400 hover:text-red-600 bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 rounded-xl transition-colors shadow-sm"
                              title="Delete Event"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="w-full text-center py-3 text-sm font-bold text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-100">
                          Assigned as Coordinator
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <EditEventModal 
        isOpen={!!selectedEventForEdit}
        onClose={() => setSelectedEventForEdit(null)}
        event={selectedEventForEdit}
        onEventUpdated={handleEventUpdated}
      />

      <ManageCoordinatorsModal
        isOpen={!!selectedEventForCoordinators}
        onClose={() => setSelectedEventForCoordinators(null)}
        event={selectedEventForCoordinators}
        onEventUpdated={handleEventUpdated}
      />
    </div>
  );
}