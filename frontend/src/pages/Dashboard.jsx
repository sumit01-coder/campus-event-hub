import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import JoinTeamModal from '../components/JoinTeamModal';
import { Search, Filter, Loader2, Star, Target, Users, TrendingUp, Lightbulb, Grid, CalendarDays, Plus, PlusCircle, ArrowRight, CalendarX2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { SidebarContext } from '../context/SidebarContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { isOpen } = useContext(SidebarContext);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const fetchEvents = async (pageNumber = 1, isLoadMore = false) => {
    if (isLoadMore) setIsLoadingMore(true);
    else setIsLoading(true);
    
    try {
      const { data } = await api.get(`/events?page=${pageNumber}&limit=20`);
      
      if (isLoadMore) {
        setEvents(prev => [...prev, ...data.events]);
      } else {
        setEvents(data.events || []); // fallback in case data structure is old
      }
      
      setHasMore(data.page < data.pages);
      setPage(data.page);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchEvents(1);
  }, []);

  const getFilteredEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events.filter(event => {
      const eventDate = new Date(event.date);
      
      switch (activeTab) {
        case 'all':
          return eventDate >= today;
        case 'popular':
          return eventDate >= today;
        case 'upcoming':
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          return eventDate >= tomorrow;
        case 'today':
          const tomorrowDay = new Date(today);
          tomorrowDay.setDate(tomorrowDay.getDate() + 1);
          return eventDate >= today && eventDate < tomorrowDay;
        case 'weekend':
          const day = today.getDay();
          const diffToFriday = day === 0 ? -2 : (5 - day);
          const friday = new Date(today);
          friday.setDate(today.getDate() + diffToFriday);
          const nextMonday = new Date(friday);
          nextMonday.setDate(friday.getDate() + 3);
          return eventDate >= friday && eventDate < nextMonday;
        case 'completed':
          return eventDate < today;
        default:
          return true;
      }
    });
  };

  const getFilteredAndSortedEvents = () => {
    let filtered = getFilteredEvents();
    
    if (activeTab === 'popular') {
      filtered = [...filtered].sort((a, b) => {
        const popA = (a.registrationsCount || 0) + (a.likes?.length || 0);
        const popB = (b.registrationsCount || 0) + (b.likes?.length || 0);
        return popB - popA;
      });
    }
    
    return filtered;
  };

  return (
    <div className={`min-h-screen bg-[#F8FAFC] flex pt-20 transition-all duration-300 pl-0 ${isOpen ? 'md:pl-64' : 'md:pl-[72px]'}`}>
      <Navbar />
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 p-6 md:p-10 overflow-y-auto animate-fade-in-up">

          {/* Hero Banner - Soft UI Evolution */}
          <div className="relative w-full min-h-[220px] h-auto py-8 md:py-0 md:h-[220px] rounded-[32px] overflow-hidden mb-10 bg-gradient-to-br from-[#E0F2FE] via-[#F3E8FF] to-[#FCE7F3] flex flex-col md:flex-row items-center justify-between px-6 md:px-12 gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.03)] border border-white/60">
            {/* Decorative Background Shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
              <svg width="100%" height="100%" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="750" cy="80" r="120" fill="url(#grad1)" filter="blur(40px)" opacity="0.4" />
                <circle cx="100" cy="300" r="150" fill="url(#grad2)" filter="blur(50px)" opacity="0.3" />
                
                {/* Floating Diamonds matching reference */}
                <rect x="580" y="60" width="16" height="16" fill="#F472B6" transform="rotate(45 580 60)" opacity="0.7" />
                <rect x="680" y="160" width="12" height="12" fill="#60A5FA" transform="rotate(45 680 160)" opacity="0.8" />
                <rect x="500" y="240" width="14" height="14" fill="#FBBF24" transform="rotate(45 500 240)" opacity="0.8" />
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                  <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#EC4899" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Left Content */}
            <div className="relative z-10 text-gray-900 max-w-lg">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 flex items-center gap-2">
                Explore Events <span className="text-yellow-500 animate-pulse">✨</span>
              </h2>
              <p className="text-gray-600 font-medium text-lg leading-relaxed">
                Discover, register, and experience the best activities happening around your campus.
              </p>
            </div>

            {/* Right Content (Search & Filter - Glassmorphism) */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              {/* Join with Code Button */}
              <button 
                onClick={() => setIsJoinModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600/95 backdrop-blur-xl border border-indigo-500 px-6 py-3.5 rounded-full text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 whitespace-nowrap hover:-translate-y-0.5"
              >
                <Users size={18} /> Join with Code
              </button>
              
              {/* Search & Filter Combined Pill */}
              <div className="flex flex-col sm:flex-row items-center bg-white/80 backdrop-blur-2xl border border-white rounded-2xl sm:rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-1.5 w-full md:w-[380px] transition-all focus-within:ring-4 focus-within:ring-indigo-500/20 focus-within:bg-white gap-2 sm:gap-0">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search events..." 
                    className="w-full bg-transparent pl-11 pr-4 py-2.5 outline-none text-sm font-medium placeholder:text-gray-400 text-gray-800"
                  />
                </div>
                <div className="hidden sm:block w-[1px] bg-gray-200 h-6 mx-1"></div>
                <button className="w-full sm:w-auto flex justify-center items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                  <Filter size={16} /> Filters
                </button>
              </div>
            </div>
          </div>

          {/* Pill Tabs & Sort */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3 w-full md:w-auto">
              <button 
                onClick={() => setActiveTab('all')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 ${activeTab === 'all' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] -translate-y-0.5' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 hover:-translate-y-0.5 hover:shadow-sm'}`}
              >
                <Grid size={16} /> All Events
              </button>
              <button 
                onClick={() => setActiveTab('popular')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 ${activeTab === 'popular' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] -translate-y-0.5' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 hover:-translate-y-0.5 hover:shadow-sm'}`}
              >
                <TrendingUp size={16} /> Popular
              </button>
              <button 
                onClick={() => setActiveTab('upcoming')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 ${activeTab === 'upcoming' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] -translate-y-0.5' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 hover:-translate-y-0.5 hover:shadow-sm'}`}
              >
                <CalendarDays size={16} /> Upcoming
              </button>
              <button 
                onClick={() => setActiveTab('today')}
                className={`hidden lg:flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 ${activeTab === 'today' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] -translate-y-0.5' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 hover:-translate-y-0.5 hover:shadow-sm'}`}
              >
                <CalendarDays size={16} /> Today
              </button>
              <button 
                onClick={() => setActiveTab('weekend')}
                className={`hidden lg:flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 ${activeTab === 'weekend' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] -translate-y-0.5' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 hover:-translate-y-0.5 hover:shadow-sm'}`}
              >
                <CalendarDays size={16} /> This Weekend
              </button>
              <button 
                onClick={() => setActiveTab('completed')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 ${activeTab === 'completed' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] -translate-y-0.5' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 hover:-translate-y-0.5 hover:shadow-sm'}`}
              >
                <CalendarX2 size={16} /> Completed
              </button>
            </div>
            
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-100 text-gray-700 py-2.5 pl-5 pr-10 rounded-full font-bold text-[13px] focus:outline-none focus:ring-4 focus:ring-blue-500/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)] cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5">
                <option>Sort by: Latest</option>
                <option>Sort by: Popular</option>
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          {/* Empty State or Events Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="animate-spin text-[#2563EB]" size={40} />
              <p className="text-gray-500 font-medium animate-pulse">Loading amazing events...</p>
            </div>
          ) : getFilteredAndSortedEvents().length === 0 ? (
            /* Wavy Empty State */
            <div className="w-full bg-white rounded-[32px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 p-16 flex flex-col items-center justify-center text-center relative overflow-hidden mb-12">
              {/* Wavy Background SVG */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1440 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 200 C 300 0, 600 400, 900 200 C 1200 0, 1440 200, 1440 200 L 1440 400 L 0 400 Z" fill="#2563EB"/>
                </svg>
              </div>
              <div className="absolute right-20 top-20 opacity-20 hidden md:block">
                 {/* Paper airplane with dashed line matching reference */}
                 <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M120 40 L180 20 L160 80 L140 60 L120 40Z" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round" fill="none"/>
                    <path d="M140 60 L120 70" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M40 120 C 60 140, 100 120, 120 80" stroke="#3B82F6" strokeWidth="2" strokeDasharray="6 6" fill="none" strokeLinecap="round"/>
                 </svg>
              </div>
              <div className="absolute left-20 bottom-10 opacity-10 hidden md:block">
                 <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              </div>

              <div className="w-20 h-20 bg-[#EFF6FF] rounded-full flex items-center justify-center mb-6 relative z-10 text-blue-500">
                <CalendarX2 size={36} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 relative z-10 tracking-tight">No events found 🥺</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8 relative z-10 font-medium">
                Looks like there are no {activeTab} events published right now. Check back later or be the first to host one!
              </p>
              <button 
                onClick={() => navigate('/host')}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 relative z-10"
              >
                <Plus size={20} /> Host an Event
              </button>
            </div>
          ) : (
            <div className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredAndSortedEvents().map(event => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => fetchEvents(page + 1, true)}
                    disabled={isLoadingMore}
                    className="flex items-center gap-2 bg-white border border-gray-200 px-6 py-3 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-[#2563EB] transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                  >
                    {isLoadingMore ? <Loader2 className="animate-spin" size={18} /> : null}
                    {isLoadingMore ? 'Loading...' : 'Load More Events'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Recommended For You Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Star className="text-gray-400" size={20} /> Recommended For You
              </h3>
              <button className="text-[#2563EB] font-semibold text-sm flex items-center gap-1 hover:underline">
                View all <ArrowRight size={14} />
              </button>
            </div>
            
            {/* Horizontal Grid for Event Cards (using dummy cards if no events) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {/* We will rely on the real EventCard component, but I'll add one dummy card to show the horizontal layout structure in case the DB is empty */}
               {events.length === 0 && (
                 <>
                  {/* Dummy Card 1 */}
                  <div className="bg-white rounded-[24px] p-5 flex justify-between gap-4 border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] cursor-pointer hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all">
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <span className="text-[#2563EB] font-bold text-sm tracking-wide">Workshop</span>
                        <h4 className="font-extrabold text-gray-900 mt-1 mb-2 leading-tight">Web Development Bootcamp</h4>
                        <div className="text-xs font-semibold text-gray-500 mb-1">📅 15 June 2026 • 10:00 AM</div>
                        <div className="text-xs font-semibold text-gray-500">📍 Seminar Hall A</div>
                      </div>
                    </div>
                    <div className="w-28 h-28 rounded-2xl bg-gray-200 relative overflow-hidden flex-shrink-0">
                      <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=300&q=80" alt="Cover" className="w-full h-full object-cover" />
                      <button className="absolute top-2 right-2 w-7 h-7 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/50 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                      </button>
                      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-900">
                        👥 120+
                      </div>
                    </div>
                  </div>

                  {/* Dummy Card 2 */}
                  <div className="bg-white rounded-[24px] p-5 flex justify-between gap-4 border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] cursor-pointer hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all">
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <span className="text-[#9333EA] font-bold text-sm tracking-wide">Cultural</span>
                        <h4 className="font-extrabold text-gray-900 mt-1 mb-2 leading-tight">Cultural Fest 2026</h4>
                        <div className="text-xs font-semibold text-gray-500 mb-1">📅 20 June 2026 • 05:00 PM</div>
                        <div className="text-xs font-semibold text-gray-500">📍 Main Auditorium</div>
                      </div>
                    </div>
                    <div className="w-28 h-28 rounded-2xl bg-gray-200 relative overflow-hidden flex-shrink-0">
                      <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80" alt="Cover" className="w-full h-full object-cover" />
                      <button className="absolute top-2 right-2 w-7 h-7 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/50 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                      </button>
                      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-900">
                        👥 250+
                      </div>
                    </div>
                  </div>

                  {/* Dummy Card 3 */}
                  <div className="bg-white rounded-[24px] p-5 flex justify-between gap-4 border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] cursor-pointer hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all">
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <span className="text-[#10B981] font-bold text-sm tracking-wide">Seminar</span>
                        <h4 className="font-extrabold text-gray-900 mt-1 mb-2 leading-tight">AI & Future of Tech</h4>
                        <div className="text-xs font-semibold text-gray-500 mb-1">📅 25 June 2026 • 11:00 AM</div>
                        <div className="text-xs font-semibold text-gray-500">📍 Conference Room B</div>
                      </div>
                    </div>
                    <div className="w-28 h-28 rounded-2xl bg-gray-200 relative overflow-hidden flex-shrink-0">
                      <img src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=300&q=80" alt="Cover" className="w-full h-full object-cover" />
                      <button className="absolute top-2 right-2 w-7 h-7 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/50 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                      </button>
                      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-900">
                        👥 80+
                      </div>
                    </div>
                  </div>
                 </>
               )}
            </div>
          </div>

          {/* Bottom Features Row - Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="bg-white rounded-[24px] p-6 border border-white shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 flex flex-col gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#2563EB] shadow-inner">
                <Target size={28} strokeWidth={2} />
              </div>
              <div>
                <h5 className="font-extrabold text-gray-900 text-base mb-1">Discover Amazing Events</h5>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">Find events that match your interests and academic goals.</p>
              </div>
            </div>

            <div className="bg-white rounded-[24px] p-6 border border-white shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 flex flex-col gap-4">
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shadow-inner">
                <Users size={28} strokeWidth={2} />
              </div>
              <div>
                <h5 className="font-extrabold text-gray-900 text-base mb-1">Connect & Network</h5>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">Meet like-minded peers and build lasting connections.</p>
              </div>
            </div>

            <div className="bg-white rounded-[24px] p-6 border border-white shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 flex flex-col gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-inner">
                <Lightbulb size={28} strokeWidth={2} />
              </div>
              <div>
                <h5 className="font-extrabold text-gray-900 text-base mb-1">Learn & Grow</h5>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">Attend insightful sessions, bootcamps, and workshops.</p>
              </div>
            </div>

            <div className="bg-white rounded-[24px] p-6 border border-white shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 flex flex-col gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 shadow-inner">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </div>
              <div>
                <h5 className="font-extrabold text-gray-900 text-base mb-1">Create Impact</h5>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">Host your own events that inspire and bring change.</p>
              </div>
            </div>

          </div>

        </main>
      </div>

      <JoinTeamModal 
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
    </div>
  );
}
