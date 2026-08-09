import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Calendar as CalendarIcon, Loader2, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';
import api from '../services/api';
import toast from 'react-hot-toast';
import { SidebarContext } from '../context/SidebarContext';
import { AuthContext } from '../context/AuthContext';
import GeneratePassModal from '../components/GeneratePassModal';

export default function MyEvents() {
  const { user } = useContext(AuthContext);
  const { isOpen } = useContext(SidebarContext);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPassEvent, setSelectedPassEvent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // In the future, this should fetch registered events.
    // For now, we simulate fetching registered events (which is currently empty)
    const fetchRegisteredEvents = async () => {
      try {
        const { data } = await api.get('/registrations/my-registrations');
        setEvents(data);
      } catch (error) {
        toast.error('Failed to load registered events');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRegisteredEvents();
  }, []);

  return (
    <div className={`min-h-screen bg-[#F8FAFC] flex pt-20 transition-all duration-300 ${isOpen ? 'pl-64' : 'pl-[72px]'}`}>
      <Navbar />
      <Sidebar />
      <main className="flex-1 w-full p-6 lg:p-8 overflow-y-auto animate-fade-in-up">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">My Registered Events</h1>
          <p className="text-lg text-gray-500 font-medium">Keep track of the activities you are attending.</p>
        </header>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white p-16 rounded-[2rem] border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-blue-100">
              <CalendarIcon className="text-blue-500" size={40} />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-3">No Upcoming Events</h3>
            <p className="text-gray-500 mb-8 max-w-md font-medium text-lg">You haven't registered for any events yet. Discover what's happening on campus!</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-full shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-[0.98]"
            >
              <Compass size={20} />
              Explore Events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((event) => (
              <EventCard key={event._id} event={event} onViewPass={(e) => setSelectedPassEvent(e)} />
            ))}
          </div>
        )}
      </main>

      {selectedPassEvent && (
        <GeneratePassModal 
          isOpen={true} 
          onClose={() => setSelectedPassEvent(null)} 
          userReg={selectedPassEvent.userReg} 
          event={selectedPassEvent} 
        />
      )}
    </div>
  );
}