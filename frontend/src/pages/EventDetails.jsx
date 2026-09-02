import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Calendar, Clock, MapPin, Users, Loader2, ArrowLeft, CheckCircle2, Ticket, MessageSquare, Send, ThumbsUp, ChevronDown, ChevronUp, AlertCircle, Check, X, Megaphone } from 'lucide-react';
import RegistrationModal from '../components/RegistrationModal';
import GeneratePassModal from '../components/GeneratePassModal';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [registrationDetails, setRegistrationDetails] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Q&A State
  const { user } = React.useContext(AuthContext);
  const [queries, setQueries] = useState([]);
  const [newQueryText, setNewQueryText] = useState('');
  const [socket, setSocket] = useState(null);
  const [presenceList, setPresenceList] = useState([]);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Connect to WebSocket with auth token
    const userObj = JSON.parse(localStorage.getItem('user'));
    const token = userObj?.token || '';
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token }
    });
    setSocket(newSocket);

    newSocket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    newSocket.on('connect', () => {
      newSocket.emit('join_event', id);
    });

    newSocket.on('new_query', (query) => {
      setQueries(prev => [query, ...prev]);
    });

    newSocket.on('query_resolved', (updatedQuery) => {
      setQueries(prev => prev.map(q => q._id === updatedQuery._id ? updatedQuery : q));
    });

    newSocket.on('registration_updated', (data) => {
      if (data.eventId === id) {
        setRefreshTrigger(prev => prev + 1);
      }
    });

    newSocket.on('new_announcement', (announcement) => {
      setEvent(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          announcements: [...(prev.announcements || []), announcement]
        };
      });
      toast.success(`New Announcement: ${announcement.message}`);
    });

    newSocket.on('delete_announcement', (announcementId) => {
      setEvent(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          announcements: (prev.announcements || []).filter(a => a._id !== announcementId)
        };
      });
    });

    newSocket.on('presence_update', (users) => {
      setPresenceList(users);
    });

    return () => newSocket.close();
  }, [id]);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const { data } = await api.get(`/queries/${id}`);
        setQueries(data);
      } catch (err) {
        console.error('Failed to fetch queries', err);
      }
    };
    fetchQueries();
  }, [id, refreshTrigger]);

  const handleSendQuery = (e) => {
    e.preventDefault();
    if (!newQueryText.trim() || !user || !socket) return;
    
    socket.emit('send_query', {
      eventId: id,
      userId: user._id,
      userName: user.name,
      text: newQueryText.trim()
    });
    setNewQueryText('');
  };

  const handleResolveQuery = (queryId) => {
    if (!socket) return;
    socket.emit('resolve_query', { queryId, eventId: id });
  };

  const handleAttendeeReply = (queryId, text) => {
    if (!socket || !text.trim()) return;
    socket.emit('attendee_reply', { queryId, eventId: id, replyText: text.trim() });
  };

  const handleRegister = async (formData) => {
    try {
      setIsRegistering(true);
      const { data } = await api.post('/registrations', { eventId: id, ...formData });
      toast.success('Successfully registered for event!');
      setIsAlreadyRegistered(true);
      setRegistrationDetails(data); // The backend returns the new registration object
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register for event');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUpdateRegistration = async (formData) => {
    try {
      setIsRegistering(true);
      const { data } = await api.put(`/registrations/${registrationDetails._id}`, formData);
      toast.success('Successfully updated registration!');
      setRegistrationDetails(data);
      setIsModalOpen(false);
      setIsEditMode(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update registration');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!window.confirm('Are you sure you want to cancel your registration?')) return;
    
    try {
      setIsCancelling(true);
      const res = await api.delete(`/registrations/${id}`);
      
      if (res.data.status === 'requested') {
        toast.success(res.data.message);
        setRegistrationDetails(prev => ({ ...prev, cancellationRequested: true }));
      } else {
        toast.success('Registration cancelled successfully');
        setIsAlreadyRegistered(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel registration');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleApproveCancellation = async (memberRegId) => {
    try {
      await api.put(`/registrations/${memberRegId}/approve-cancellation`);
      toast.success('Member removed');
      setTeamMembers(prev => prev.filter(m => m._id !== memberRegId));
    } catch (error) {
      toast.error('Failed to approve cancellation');
    }
  };

  const handleRejectCancellation = async (memberRegId) => {
    try {
      await api.put(`/registrations/${memberRegId}/reject-cancellation`);
      toast.success('Cancellation rejected');
      setTeamMembers(prev => prev.map(m => m._id === memberRegId ? { ...m, cancellationRequested: false } : m));
    } catch (error) {
      toast.error('Failed to reject cancellation');
    }
  };

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        setEvent(data);
        
        // Also check registration status
        try {
          const statusRes = await api.get(`/registrations/check/${id}`);
          if (statusRes.data.isRegistered) {
            const reg = statusRes.data.registration;
            setIsAlreadyRegistered(true);
            setRegistrationDetails(reg);
            
            // If part of a team, fetch members
            if (reg.participationType === 'group') {
              const codeToFetch = reg.isTeamLeader ? reg.teamCode : reg.joinedTeamCode;
              if (codeToFetch) {
                const teamRes = await api.get(`/registrations/team/${codeToFetch}`);
                setTeamMembers(teamRes.data);
              }
            }
          }
        } catch (err) {
          console.error('Failed to check registration status', err);
        }

      } catch (error) {
        toast.error('Event not found or failed to load');
        navigate('/events');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEventData();
  }, [id, navigate, refreshTrigger]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="animate-spin text-indigo-600" size={64} />
        </div>
      </div>
    );
  }

  if (!event) return null;

  const hasEventPassed = event.date ? new Date(event.date) < new Date() : false;
  const isOrganizer = event.organizerId && user && (event.organizerId._id === user._id || event.organizerId === user._id);
  const isCoordinator = event.coordinators && user && event.coordinators.some(c => c.userId === user._id);
  const isLockedForUser = hasEventPassed && !isAlreadyRegistered && !isOrganizer && !isCoordinator;

  if (isLockedForUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-28 px-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">Event Locked</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              This event has already ended. Access to this page is restricted to enrolled participants and organizers only.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
            >
              Go to Homepage
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const firstImage = event.images && event.images.length > 0 ? event.images[0] : event.image;
  const imageUrl = firstImage?.startsWith('/') ? `http://localhost:5000${firstImage}` : firstImage;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28 animate-fade-in-up">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold mb-8 transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Image */}
          <div className="w-full h-[400px] relative bg-gray-200">
            <img 
              src={imageUrl} 
              alt={event.title} 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 w-full p-10 flex justify-between items-end">
              <div>
                <div className="inline-block px-4 py-1.5 bg-indigo-600 rounded-lg text-sm font-bold text-white mb-4 uppercase tracking-widest shadow-md">
                  {event.category}
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl">
                  {event.title}
                </h1>
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Main Details (Left) */}
            <div className="lg:col-span-2 space-y-10">
              
              {/* Announcements / Broadcast Section — only show visible ones */}
              {event.announcements && event.announcements.filter(a => !a.isHidden).length > 0 && (
                <section className="animate-fade-in-up">
                  <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
                    <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
                      <Megaphone className="text-indigo-600" size={24} /> 
                      Live Announcements
                    </h2>
                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                      {event.announcements.filter(a => !a.isHidden).length} {event.announcements.filter(a => !a.isHidden).length === 1 ? 'Update' : 'Updates'}
                    </span>
                  </div>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar">
                    {event.announcements.filter(a => !a.isHidden).slice().reverse().map((announcement, index) => (
                      <div key={index} className="bg-indigo-50/40 rounded-2xl p-6 border border-indigo-100/60 flex gap-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-2xl group-hover:bg-indigo-600 transition-colors"></div>
                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600 flex-shrink-0 border border-indigo-50/50">
                          <Megaphone size={20} className="group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 text-xs text-indigo-400 font-bold">
                            <span className="uppercase tracking-widest bg-indigo-100/50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-200/30">Broadcast</span>
                            <span className="text-gray-400">•</span>
                            <span className="flex items-center gap-1.5 text-gray-500 bg-white px-2.5 py-1 rounded-md border border-gray-100"><Clock size={12} /> {new Date(announcement.date || new Date()).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-gray-800 text-[15px] leading-relaxed font-medium">{announcement.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-4 border-b border-gray-100 pb-2">About This Event</h2>
                <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </section>

              {event.organizerId && (
                <section className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Organized By</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl border border-indigo-200">
                      {event.organizerId.organizerProfile?.organizationName?.charAt(0) || event.organizerId.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{event.organizerId.organizerProfile?.organizationName || event.organizerId.name}</h4>
                      <p className="text-gray-500">{event.organizerId.email}</p>
                    </div>
                  </div>
                </section>
              )}
              {/* Live Q&A Section */}
              <section className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl mt-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8 border-b border-gray-100 pb-6 relative">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900">Live Q&amp;A</h3>
                      <p className="text-sm text-gray-500 font-medium mt-1">Direct channel to the event organizer.</p>
                    </div>
                  </div>

                  {/* Live Presence Panel */}
                  <div className="flex flex-wrap items-center gap-2">
                    {(() => {
                      const organizer = presenceList.find(p => p.role === 'organizer');
                      const volunteers = presenceList.filter(p => p.role === 'volunteer');
                      return (
                        <>
                          {/* Organizer status */}
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${organizer ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                            <span className={`w-2 h-2 rounded-full ${organizer ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></span>
                            Organizer {organizer ? 'Online' : 'Offline'}
                          </div>

                          {/* Volunteer online pings */}
                          {volunteers.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              {volunteers.slice(0, 4).map((v, i) => (
                                <div key={v.userId}
                                  title={`${v.name} (Volunteer) — Online`}
                                  className="relative w-8 h-8 rounded-full bg-indigo-100 border-2 border-white shadow flex items-center justify-center text-indigo-700 font-black text-xs cursor-default"
                                >
                                  {v.name.charAt(0).toUpperCase()}
                                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></span>
                                </div>
                              ))}
                              {volunteers.length > 4 && (
                                <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white shadow flex items-center justify-center text-gray-500 font-bold text-xs">
                                  +{volunteers.length - 4}
                                </div>
                              )}
                              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full ml-1">
                                {volunteers.length} Volunteer{volunteers.length > 1 ? 's' : ''} Online
                              </span>
                            </div>
                          )}

                          {/* Total viewers count */}
                          {presenceList.length > 0 && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                              {presenceList.length} Viewing
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="space-y-5 mb-8 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
                  {queries.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 font-medium bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                      <MessageSquare className="mx-auto mb-3 opacity-20" size={32} />
                      No questions yet. Drop one below!
                    </div>
                  ) : (
                    queries.map(q => (
                      <div key={q._id} className={`p-5 rounded-2xl border transition-all ${q.isResolved ? 'bg-gray-50/50 border-gray-100' : 'bg-white border-gray-200 shadow-sm hover:shadow-md'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                              {q.user.name.charAt(0)}
                            </div>
                            <span className="font-bold text-gray-900">{q.user.name}</span>
                          </div>
                          {q.isResolved ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-emerald-200/50">
                              <CheckCircle2 size={12} /> Resolved
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">{new Date(q.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          )}
                        </div>
                        <p className={`text-gray-800 text-[15px] font-medium pl-10 ${q.isResolved ? 'opacity-60 line-through decoration-gray-300' : ''}`}>{q.text}</p>
                        
                        {q.replies && q.replies.length > 0 && (
                          <div className="mt-5 space-y-4 pl-4 border-l-2 border-gray-100 ml-4">
                            {q.replies.map((msg, index) => (
                              <div key={index} className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm ${msg.sender === 'organizer' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                    {msg.sender === 'organizer' ? 'Organizer' : 'You'}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-medium">{new Date(msg.createdAt).toLocaleString(undefined, {hour: '2-digit', minute: '2-digit'})}</span>
                                </div>
                                <div className={`p-3.5 rounded-2xl max-w-[90%] ${msg.sender === 'organizer' ? 'bg-indigo-50/70 border border-indigo-100 text-indigo-900 rounded-tl-sm' : 'bg-gray-100 border border-gray-200 text-gray-800 rounded-tr-sm ml-auto'}`}>
                                  <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {!q.isResolved && !hasEventPassed && user && user._id === q.user.id && (
                          <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-5">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Reply to this thread..."
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-gray-400"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && e.target.value.trim()) {
                                    handleAttendeeReply(q._id, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                              />
                            </div>
                            <div className="flex justify-end">
                              <button 
                                onClick={() => handleResolveQuery(q._id)}
                                className="text-xs font-bold text-gray-500 hover:text-emerald-600 bg-gray-100 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 px-4 py-2 rounded-lg transition-all flex items-center gap-1.5"
                              >
                                <Check size={14} /> Close Thread
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {hasEventPassed ? (
                  <div className="text-center py-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm font-bold text-gray-500 shadow-inner mt-2">
                    This event has ended. Q&A is now closed.
                  </div>
                ) : user ? (
                  <form onSubmit={handleSendQuery} className="relative mt-2">
                    <div className="relative group">
                      <input 
                        type="text" 
                        value={newQueryText}
                        onChange={(e) => setNewQueryText(e.target.value)}
                        placeholder="Start a new question thread..." 
                        className="w-full bg-white border-2 border-gray-200 rounded-2xl py-4 pl-5 pr-14 text-gray-900 font-medium placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm"
                      />
                      <button 
                        type="submit" 
                        disabled={!newQueryText.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl flex items-center justify-center text-white shadow-md active:scale-95 transition-all"
                      >
                        <Send size={18} className={newQueryText.trim() ? "translate-x-[-1px] translate-y-[1px]" : ""} />
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-4 bg-gray-50 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 shadow-inner mt-2">
                    Please log in to ask a question.
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar Details (Right) */}
            <div className="space-y-6">
              {/* Event Info Card */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-6">
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <Calendar className="text-indigo-600" size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</p>
                    <p className="font-bold text-gray-900">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                    <Clock className="text-orange-500" size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Time</p>
                    <p className="font-bold text-gray-900">{event.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                    <MapPin className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</p>
                    <p className="font-bold text-gray-900">{event.venue}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Users className="text-blue-500" size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Capacity</p>
                    <p className="font-bold text-gray-900">{event.capacity} Total Attendees</p>
                    {event.registrationsCount !== undefined && (
                      <p className={`text-sm font-bold mt-0.5 ${event.capacity - event.registrationsCount <= 10 ? 'text-red-500' : 'text-green-600'}`}>
                        {Math.max(0, event.capacity - event.registrationsCount)} Seats Available
                      </p>
                    )}
                  </div>
                </div>

              </div>

              {/* Action Card */}
              <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl shadow-xl p-8 text-center text-white border border-indigo-700/50">
                <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-2">Registration</h3>
                <div className="text-4xl font-black mb-6">
                  {event.price === 0 ? 'FREE' : `₹${event.price}`}
                </div>
                
                {isAlreadyRegistered ? (
                  <div className="space-y-3">
                    <div className="w-full bg-green-500/20 text-green-100 font-bold text-lg py-4 rounded-xl border border-green-400/30 flex flex-col justify-center items-center gap-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={22} /> Already Registered
                      </div>
                      
                      {registrationDetails?.participationType === 'group' && (
                        <div className="mt-3 bg-white/10 p-3 rounded-lg border border-white/20 w-[95%]">
                          {registrationDetails.isTeamLeader && registrationDetails.teamCode && (
                            <div className="text-center mb-3 pb-3 border-b border-white/10">
                              <p className="text-xs text-green-200 font-medium uppercase tracking-wider mb-1">Your Team Code</p>
                              <p className="text-xl font-mono font-black tracking-widest text-white">{registrationDetails.teamCode}</p>
                              <p className="text-[10px] text-green-200 mt-1">Share this code with your team!</p>
                            </div>
                          )}
                          <div className="text-left">
                            <p className="text-xs font-bold text-green-100 mb-2">Team Members ({teamMembers.length}/{registrationDetails?.isTeamLeader ? registrationDetails.teamSize : (teamMembers.find(m => m.isTeamLeader)?.teamSize || event.maxGroupSize)})</p>
                            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                              {teamMembers.map(member => (
                                <div key={member._id} className="flex items-center justify-between bg-black/10 px-3 py-2 rounded">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${member.isTeamLeader ? 'bg-yellow-400' : 'bg-green-300'}`}></div>
                                    <span className="text-sm font-medium text-white line-clamp-1">{member.participantName}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {member.isTeamLeader && <span className="text-[10px] bg-yellow-500/20 text-yellow-200 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Leader</span>}
                                    {registrationDetails?.isTeamLeader && member.cancellationRequested && !member.isTeamLeader && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-[10px] text-red-200 bg-red-900/40 px-1.5 py-0.5 rounded border border-red-500/30">Wants to leave</span>
                                        <button onClick={() => handleApproveCancellation(member._id)} className="p-0.5 bg-green-500/80 hover:bg-green-500 rounded text-white" title="Approve"><Check size={12}/></button>
                                        <button onClick={() => handleRejectCancellation(member._id)} className="p-0.5 bg-red-500/80 hover:bg-red-500 rounded text-white" title="Reject"><X size={12}/></button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {teamMembers.length < (registrationDetails?.isTeamLeader ? registrationDetails.teamSize : (teamMembers.find(m => m.isTeamLeader)?.teamSize || event.maxGroupSize)) && (
                                <div className="text-center py-1">
                                  <span className="text-xs text-green-200/60 font-medium italic">Waiting for members to join...</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                    </div>

                    <div className="flex gap-2 mb-2">
                      <button 
                        onClick={() => setIsPassModalOpen(true)}
                        className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm py-3 rounded-xl shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2"
                      >
                        <Ticket size={18} /> View Pass
                      </button>
                      
                      {!hasEventPassed && new Date() < new Date(event.registrationDeadline) && (
                        <button 
                          onClick={() => {
                            setIsEditMode(true);
                            setIsModalOpen(true);
                          }}
                          className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm py-3 rounded-xl shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2"
                        >
                          Edit Details
                        </button>
                      )}
                    </div>

                    {!hasEventPassed && (
                      <button 
                        onClick={handleCancelRegistration}
                        disabled={isCancelling || registrationDetails?.cancellationRequested}
                        className="w-full bg-white/10 hover:bg-red-500/20 text-red-100 font-semibold text-sm py-3 rounded-xl border border-transparent hover:border-red-400/30 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                      >
                        {isCancelling ? <><Loader2 className="animate-spin" size={16} /> Cancelling...</> : 
                         registrationDetails?.cancellationRequested ? 'Leave Request Pending...' : 'Cancel Registration'}
                      </button>
                    )}
                  </div>
                ) : (
                  hasEventPassed ? (
                    <div className="w-full bg-white/10 text-gray-300 font-bold text-sm py-3 rounded-xl border border-white/10 flex justify-center items-center gap-2">
                      Registration Closed
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        if (!user) {
                          toast.error('Please log in to register for events.');
                          navigate('/login');
                          return;
                        }
                        setIsModalOpen(true);
                      }}
                      className="w-full bg-white text-indigo-900 font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-gray-50 active:scale-95 transition-all flex justify-center items-center gap-2"
                    >
                      {event.isPaid && event.price > 0 ? `Register & Pay ₹${event.price}` : 'Register Now'}
                    </button>
                  )
                )}

                <p className="text-xs text-indigo-200 mt-4 font-medium opacity-80">
                  {hasEventPassed ? 'Event Ended (View-Only Mode)' : isAlreadyRegistered ? 'Check your My Events dashboard' : 'Secure your spot before it fills up!'}
                </p>
              </div>

            </div>

          </div>
        </div>
      </main>
      
      <Footer />

      {/* Registration Modal */}
      <RegistrationModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
        }}
        event={event}
        onRegister={isEditMode ? handleUpdateRegistration : handleRegister}
        isRegistering={isRegistering}
        isEditing={isEditMode}
        initialData={isEditMode ? registrationDetails : null}
      />

      {/* Pass Modal */}
      {isPassModalOpen && registrationDetails && (
        <GeneratePassModal 
          isOpen={isPassModalOpen} 
          onClose={() => setIsPassModalOpen(false)} 
          userReg={registrationDetails} 
          event={event} 
        />
      )}
    </div>
  );
}
