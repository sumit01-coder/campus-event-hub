import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShieldCheck, Calendar, Zap, Heart, CheckCircle2, MapPin, Users, Target, ThumbsUp, ArrowRight, Play, Star, TrendingUp, Music, ArrowUpRight, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Home() {
  const [stats, setStats] = useState({
    eventsHosted: '0',
    activeUsers: '0',
    campuses: '0',
    satisfactionRate: '0%'
  });
  const [featuredEvents, setFeaturedEvents] = useState([]);

  useEffect(() => {
    const fetchStatsAndEvents = async () => {
      try {
        const { data } = await api.get('/public/stats');
        setStats({
          eventsHosted: data.eventsHosted || '0',
          activeUsers: data.activeUsers || '0',
          campuses: data.campuses ? data.campuses + '+' : '0',
          satisfactionRate: data.satisfactionRate ? data.satisfactionRate + '%' : '0%'
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
      
      try {
        const { data } = await api.get('/events');
        setFeaturedEvents(data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };
    fetchStatsAndEvents();
  }, []);

  const defaultCards = [
    { title: "Music Fest", date: "24 May 2026", image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=150&q=80", attendees: 200, className: "absolute top-[10%] left-0 z-20 bg-white rounded-2xl p-3 flex gap-4 items-center shadow-xl shadow-gray-200/50 w-64 animate-[float_4s_ease-in-out_infinite]", colorClass: "bg-purple-100" },
    { title: "Tech Talk", date: "18 May 2026", image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=150&q=80", attendees: 120, className: "absolute top-[5%] right-[5%] z-20 bg-white rounded-2xl p-3 flex gap-4 items-center shadow-xl shadow-gray-200/50 w-64 animate-[float_5s_ease-in-out_infinite_reverse]", colorClass: "bg-blue-100" },
    { title: "Art Workshop", date: "22 May 2026", image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=150&q=80", attendees: 80, className: "absolute bottom-[20%] right-[-5%] z-20 bg-white rounded-2xl p-3 flex gap-4 items-center shadow-xl shadow-gray-200/50 w-64 animate-[float_4.5s_ease-in-out_infinite]", colorClass: "bg-orange-100" }
  ];

  const displayCards = featuredEvents.map((event, idx) => {
    const card = defaultCards[idx];
    if (!card) return null;
    return {
      ...card,
      title: event.title,
      date: new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      image: (event.images && event.images.length > 0 ? event.images[0] : event.image) || event.bannerUrl || card.image,
      attendees: event.registeredCount ?? event.registrations?.length ?? 0,
      capacity: event.capacity ?? null
    };
  }).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans overflow-x-hidden text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      
      {/* Hero Section */}
      <main className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[800px] h-[800px] bg-purple-50 rounded-full blur-3xl opacity-50 pointer-events-none z-0"></div>
        <div className="absolute top-1/2 left-0 -ml-32 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none z-0"></div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
            
            {/* Left Content */}
            <div className="flex-1 w-full max-w-2xl lg:max-w-none text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-semibold text-sm mb-8 shadow-sm">
                <ShieldCheck size={16} className="text-blue-600" />
                Trusted by 5000+ campuses
              </div>

              <h1 className="text-[3rem] sm:text-[4rem] lg:text-[4.5rem] font-extrabold leading-[1.1] tracking-tight text-gray-900 mb-6">
                The all-in-one platform for <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">campus experiences.</span>
              </h1>

              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Replace disjointed forms and spreadsheets with a unified event management system. Built for organizers, loved by students.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-16">
                <Link to="/dashboard" className="w-full sm:w-auto bg-[#2563EB] hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all hover:scale-105">
                  Explore Events <ArrowRight size={18} />
                </Link>
                <Link to="/host" className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 font-semibold py-4 px-8 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all">
                  <Calendar size={18} className="text-gray-500" /> Host an Event <ArrowRight size={18} className="text-gray-500" />
                </Link>
              </div>

              {/* Features Mini Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto lg:mx-0 text-left">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600 shadow-sm">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Easy to Use</h4>
                    <p className="text-sm text-gray-500 mt-1">Intuitive & clean interface</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0 text-green-600 shadow-sm">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Powerful Tools</h4>
                    <p className="text-sm text-gray-500 mt-1">Everything you need</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 text-orange-500 shadow-sm">
                    <Heart size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Loved by Students</h4>
                    <p className="text-sm text-gray-500 mt-1">Great campus experience</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content (Hero Composition) */}
            <div className="flex-1 w-full max-w-2xl lg:max-w-none relative h-[500px] sm:h-[600px] lg:h-[700px] mt-10 lg:mt-0">
              {/* Large Purple Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-[#F3E8FF] rounded-full z-0"></div>
              
              {/* Abstract decorative elements */}
              <svg className="absolute top-1/4 left-10 z-0 text-purple-300 w-12 h-12 animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
              <svg className="absolute bottom-1/3 right-10 z-0 text-orange-400 w-8 h-8 opacity-60" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>

              {/* Main Image */}
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div className="w-[85%] h-[85%] rounded-[3rem] overflow-hidden shadow-2xl shadow-purple-900/20 relative">
                   <img src="/hero.png" alt="Students collaborating" className="w-full h-full object-cover object-center" />
                </div>
              </div>

              {/* Floating UI Cards */}
              {displayCards.map((card, idx) => (
                <div key={idx} className={card.className}>
                  <div className={`w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden ${card.colorClass}`}>
                    <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="overflow-hidden">
                    <h5 className="font-bold text-gray-900 text-sm truncate w-full" title={card.title}>{card.title}</h5>
                    <div className="flex items-center text-[10px] text-gray-500 mt-1 truncate">
                      <Calendar size={10} className="mr-1 shrink-0" /> {card.date}
                    </div>
                    <div className="flex items-center text-[10px] text-gray-500 mt-0.5 truncate">
                      <Users size={10} className="mr-1 shrink-0" /> {card.attendees}{card.capacity ? ` / ${card.capacity}` : ''} Going
                    </div>
                  </div>
                </div>
              ))}

              {/* Floating Badge overlapping photo bottom center */}
              <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl shadow-blue-900/10 text-center border border-white/50">
                <h4 className="font-bold text-gray-800 text-lg">Events that</h4>
                <p className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                  bring people together
                </p>
                <div className="absolute -bottom-2 right-4 w-12 h-2 bg-purple-500/30 rounded-full blur-sm transform -rotate-3"></div>
              </div>

              {/* Decorative Purple Icon Left Side */}
              <div className="absolute top-[40%] left-[-2%] z-20 w-14 h-14 bg-[#9333EA] rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                <Calendar size={24} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Stats Row */}
      <section className="py-10 bg-white relative z-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 lg:p-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 lg:divide-x divide-gray-100">
              
              <div className="flex items-center gap-6 justify-center lg:justify-start pt-6 sm:pt-0">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <CalendarDays size={28} />
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold text-gray-900">{stats.eventsHosted}</h3>
                  <p className="text-sm font-semibold text-gray-500">Events Hosted</p>
                </div>
              </div>

              <div className="flex items-center gap-6 justify-center lg:justify-center pt-6 sm:pt-0">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                  <MapPin size={28} />
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold text-gray-900">{stats.campuses}</h3>
                  <p className="text-sm font-semibold text-gray-500">Campuses</p>
                </div>
              </div>

              <div className="flex items-center gap-6 justify-center lg:justify-center pt-6 sm:pt-0">
                <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                  <Users size={28} />
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold text-gray-900">{stats.activeUsers}</h3>
                  <p className="text-sm font-semibold text-gray-500">Active Users</p>
                </div>
              </div>

              <div className="flex items-center gap-6 justify-center lg:justify-end pt-6 sm:pt-0">
                <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0">
                  <ThumbsUp size={28} />
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold text-gray-900">{stats.satisfactionRate}</h3>
                  <p className="text-sm font-semibold text-gray-500">Satisfaction Rate</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Trust Logos Row */}
      <section className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-12">Trusted by leading institutions</h3>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex flex-col items-center gap-3 w-32">
              <div className="w-16 h-16 rounded-full border-2 border-gray-400 flex items-center justify-center font-bold text-gray-400 text-xl">IIT</div>
              <span className="font-semibold text-sm">IIT Bombay</span>
            </div>
            <div className="flex flex-col items-center gap-3 w-32">
              <div className="w-16 h-16 rounded-full border-2 border-gray-400 flex items-center justify-center font-bold text-gray-400 text-xl">DU</div>
              <span className="font-semibold text-sm">Delhi University</span>
            </div>
            <div className="flex flex-col items-center gap-3 w-32">
              <div className="w-16 h-16 rounded-full border-2 border-gray-400 flex items-center justify-center font-bold text-gray-400 text-xl">BP</div>
              <span className="font-semibold text-sm">BITS Pilani</span>
            </div>
            <div className="flex flex-col items-center gap-3 w-32">
              <div className="w-16 h-16 rounded-full border-2 border-gray-400 flex items-center justify-center font-bold text-gray-400 text-xl">IITD</div>
              <span className="font-semibold text-sm">IIT Delhi</span>
            </div>
            <div className="flex flex-col items-center gap-3 w-32">
              <div className="w-16 h-16 rounded-full border-2 border-gray-400 flex items-center justify-center font-bold text-gray-400 text-xl">NM</div>
              <span className="font-semibold text-sm">NMIMS University</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
