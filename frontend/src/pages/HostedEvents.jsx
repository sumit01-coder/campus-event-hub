import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Calendar as CalendarIcon, Users, MapPin, Clock, Edit3, Trash2, PlusCircle, Loader2, Users2, MessageSquare } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import EditEventModal from '../components/EditEventModal';
import { SidebarContext } from '../context/SidebarContext';

export default function HostedEvents() {
  const { user } = useContext(AuthContext);
  const { isOpen } = useContext(SidebarContext);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState(null);
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
  };

  return (
    <div className={`min-h-screen bg-gray-50 flex pt-20 transition-all duration-300 ${isOpen ? 'pl-64' : 'pl-[72px]'}`}>
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
                <div className="h-48 relative overflow-hidden bg-gray-200">
                  <img 
                    src={event.image?.startsWith('/') ? `http://localhost:5000${event.image}` : event.image} 
                    alt={event.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'; }}
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-gray-800 shadow-sm uppercase tracking-wider">
                    {event.category}
                  </div>
                  <div className="absolute top-4 right-4 bg-indigo-600 px-3 py-1 rounded-lg text-xs font-bold text-white shadow-md">
                    {event.price === 0 ? 'FREE' : `₹${event.price}`}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">{event.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 mt-auto mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <CalendarIcon size={16} className="text-indigo-500" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <Clock size={16} className="text-orange-500" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <MapPin size={16} className="text-green-500" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium pt-2 border-t border-gray-50 mt-2">
                      <Users size={16} className="text-blue-500" />
                      {event.capacity} Capacity
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => navigate(`/hosted-events/${event._id}/registrations`)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-sm rounded-xl transition-colors border border-blue-100/50"
                      >
                        <Users2 size={18} /> Registrations
                      </button>
                      <button 
                        onClick={() => navigate(`/hosted-events/${event._id}/queries`)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-sm rounded-xl transition-colors border border-purple-100/50"
                      >
                        <MessageSquare size={18} /> Live Queries
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setSelectedEventForEdit(event)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-sm rounded-xl transition-colors"
                      >
                        <Edit3 size={16} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(event._id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold text-sm rounded-xl transition-colors border border-transparent hover:border-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
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
    </div>
  );
}