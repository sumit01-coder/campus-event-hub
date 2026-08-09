import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Calendar, Clock, MapPin, Users, Loader2, ArrowLeft, CheckCircle2, Ticket, MessageSquare, Send, ThumbsUp, ChevronDown, ChevronUp, AlertCircle, Check, X } from 'lucide-react';
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
  
  // Q&A State
  const { user } = React.useContext(AuthContext);
  const [queries, setQueries] = useState([]);
  const [newQueryText, setNewQueryText] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_event', id);
    });

    newSocket.on('new_query', (query) => {
      setQueries(prev => [query, ...prev]);
    });

    newSocket.on('query_resolved', (updatedQuery) => {
      setQueries(prev => prev.map(q => q._id === updatedQuery._id ? updatedQuery : q));
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
  }, [id]);

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
      await api.post(`/registrations/${memberRegId}/approve-cancellation`);
      toast.success('Member removed');
      setTeamMembers(prev => prev.filter(m => m._id !== memberRegId));
    } catch (error) {
      toast.error('Failed to approve cancellation');
    }
  };

  const handleRejectCancellation = async (memberRegId) => {
    try {
      await api.post(`/registrations/${memberRegId}/reject-cancellation`);
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
  }, [id, navigate]);

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

  const imageUrl = event.image?.startsWith('/') ? `http://localhost:5000${event.image}` : event.image;

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
              <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mt-10">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Live Q&A</h3>
                    <p className="text-sm text-gray-500">Ask the organizer anything about this event.</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {queries.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      No questions yet. Be the first to ask!
                    </div>
                  ) : (
                    queries.map(q => (
                      <div key={q._id} className={`p-4 rounded-xl border ${q.isResolved ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-gray-900 text-sm">{q.user.name}</span>
                          {q.isResolved ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-200/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 size={12} /> Resolved
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">{new Date(q.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          )}
                        </div>
                        <p className={`text-gray-700 ${q.isResolved ? 'opacity-70' : ''}`}>{q.text}</p>
                        
                        {q.replies && q.replies.length > 0 && (
                          <div className="mt-4 space-y-3">
                            {q.replies.map((msg, index) => (
                              <div key={index} className={`p-3 rounded-lg border shadow-sm relative ${msg.sender === 'organizer' ? 'bg-indigo-50/50 border-indigo-100 ml-4' : 'bg-white border-gray-100 mr-4'}`}>
                                <div className={`flex items-center gap-1.5 mb-1 ${msg.sender === 'organizer' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                  <span className="text-xs font-black uppercase tracking-wider">{msg.sender === 'organizer' ? 'Organizer' : 'You'}</span>
                                  <span className="text-[10px] text-gray-400 font-medium ml-auto">{new Date(msg.createdAt).toLocaleString()}</span>
                                </div>
                                <p className={`text-sm ${msg.sender === 'organizer' ? 'text-indigo-900' : 'text-gray-800'}`}>{msg.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {!q.isResolved && user && user._id === q.user.id && (
                          <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
                            <input
                              type="text"
                              placeholder="Type a reply to the organizer..."
                              className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleAttendeeReply(q._id, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                            />
                            <div className="flex justify-end">
                              <button 
                                onClick={() => handleResolveQuery(q._id)}
                                className="text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Mark as Resolved
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {user ? (
                  <form onSubmit={handleSendQuery} className="relative">
                    <input 
                      type="text" 
                      value={newQueryText}
                      onChange={(e) => setNewQueryText(e.target.value)}
                      placeholder="Type your question..." 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-12 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                    <button 
                      type="submit" 
                      disabled={!newQueryText.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-500">
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
                    <p className="font-bold text-gray-900">{event.capacity} Attendees</p>
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
                            <p className="text-xs font-bold text-green-100 mb-2">Team Members ({teamMembers.length}/{event.maxGroupSize})</p>
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
                              {teamMembers.length < event.maxGroupSize && (
                                <div className="text-center py-1">
                                  <span className="text-xs text-green-200/60 font-medium italic">Waiting for members to join...</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                    </div>

                    <button 
                      onClick={() => setIsPassModalOpen(true)}
                      className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-lg py-3 rounded-xl shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2 mb-2"
                    >
                      <Ticket size={20} /> View Pass
                    </button>

                    <button 
                      onClick={handleCancelRegistration}
                      disabled={isCancelling || registrationDetails?.cancellationRequested}
                      className="w-full bg-white/10 hover:bg-red-500/20 text-red-100 font-semibold text-sm py-3 rounded-xl border border-transparent hover:border-red-400/30 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                      {isCancelling ? <><Loader2 className="animate-spin" size={16} /> Cancelling...</> : 
                       registrationDetails?.cancellationRequested ? 'Leave Request Pending...' : 'Cancel Registration'}
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-white text-indigo-900 font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-gray-50 active:scale-95 transition-all flex justify-center items-center gap-2"
                  >
                    Register Now
                  </button>
                )}

                <p className="text-xs text-indigo-200 mt-4 font-medium opacity-80">
                  {isAlreadyRegistered ? 'Check your My Events dashboard' : 'Secure your spot before it fills up!'}
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
        onClose={() => setIsModalOpen(false)}
        event={event}
        onRegister={handleRegister}
        isRegistering={isRegistering}
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
