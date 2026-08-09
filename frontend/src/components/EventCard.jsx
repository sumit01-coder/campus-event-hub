import React from 'react';
import { Calendar, MapPin, Users, Heart, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EventCard({ event, onViewPass }) {
  const navigate = useNavigate();
  // Graceful fallbacks for schema fields that might not be populated yet
  const dateStr = event.date ? new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA';
  const timeStr = event.date ? new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBA';
  
  // Get category color
  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'workshop': return 'text-[#2563EB]';
      case 'cultural': return 'text-[#9333EA]';
      case 'seminar': return 'text-[#10B981]';
      case 'sports': return 'text-orange-500';
      default: return 'text-[#2563EB]';
    }
  };

  return (
    <div 
      onClick={() => navigate(`/event/${event._id}`)}
      className="bg-white rounded-[28px] p-5 flex justify-between gap-5 border border-white shadow-[0_8px_32px_rgba(0,0,0,0.03)] cursor-pointer hover:shadow-[0_12px_48px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 group"
    >
      <div className="flex flex-col justify-between flex-1">
        <div>
          <span className={`${getCategoryColor(event.category)} font-extrabold text-[13px] tracking-wide uppercase`}>
            {event.category || 'Event'}
          </span>
          <h4 className="font-extrabold text-gray-900 mt-2 mb-3 text-lg leading-tight group-hover:text-[#2563EB] transition-colors">
            {event.title}
          </h4>
          <div className="flex items-center text-[13px] font-semibold text-gray-500 mb-1.5">
            <Calendar size={14} className="mr-2 text-gray-400" /> 
            {dateStr} • {timeStr}
          </div>
          <div className="flex items-center text-[13px] font-semibold text-gray-500 line-clamp-1">
            <MapPin size={14} className="mr-2 text-gray-400" /> 
            {event.venue || 'TBA'}
          </div>
        </div>
      </div>
      
      <div className="w-32 h-32 rounded-[20px] bg-gray-100 relative overflow-hidden flex-shrink-0 shadow-inner">
        {event.image ? (
          <img 
            src={event.image?.startsWith('/') ? `http://localhost:5000${event.image}` : event.image} 
            alt={event.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'; }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100"></div>
        )}
        {event.userReg ? (
          <button 
            onClick={(e) => { e.stopPropagation(); if(onViewPass) onViewPass(event); }}
            className="absolute top-2 right-2 px-3 py-1.5 bg-indigo-600/90 backdrop-blur-md border border-indigo-400 rounded-full flex items-center justify-center gap-1.5 text-white hover:bg-indigo-700 transition-colors z-10 shadow-[0_4px_12px_rgba(0,0,0,0.1)] text-xs font-bold"
          >
            <Ticket size={14} /> Pass
          </button>
        ) : (
          <button 
            onClick={(e) => { e.stopPropagation(); /* TODO: Like event */ }}
            className="absolute top-2 right-2 w-8 h-8 bg-white/40 backdrop-blur-md border border-white/60 rounded-full flex items-center justify-center text-gray-700 hover:bg-white hover:text-red-500 transition-colors z-10 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
          >
            <Heart size={14} strokeWidth={2.5} />
          </button>
        )}
        <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-md border border-white/60 px-2.5 py-1 rounded-full text-[11px] font-extrabold text-gray-900 z-10 flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <Users size={12} className="text-[#2563EB]" /> {event.registeredCount || 0}+
        </div>
      </div>
    </div>
  );
}
