import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { SidebarContext } from '../context/SidebarContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, MessageSquare, CheckCircle2, Clock, Loader2, Megaphone, X } from 'lucide-react';
import { io } from 'socket.io-client';

export default function EventQueries() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = React.useContext(AuthContext);
  const { isOpen } = React.useContext(SidebarContext);
  
  const [event, setEvent] = useState(null);
  const [queries, setQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [replyTexts, setReplyTexts] = useState({});
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastMessageText, setBroadcastMessageText] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [presenceList, setPresenceList] = useState([]);
  const [isBroadcastHistoryOpen, setIsBroadcastHistoryOpen] = useState(true);
  const [isQueriesOpen, setIsQueriesOpen] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, queriesRes] = await Promise.all([
          api.get(`/events/${id}`),
          api.get(`/queries/${id}`)
        ]);
        setEvent(eventRes.data);
        setQueries(queriesRes.data);
      } catch (err) {
        toast.error('Failed to load queries');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

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
      toast.success('New query received!');
    });

    newSocket.on('query_resolved', (updatedQuery) => {
      setQueries(prev => prev.map(q => q._id === updatedQuery._id ? updatedQuery : q));
    });

    newSocket.on('presence_update', (users) => {
      setPresenceList(users);
    });

    return () => newSocket.close();
  }, [id]);

  const handleReply = (queryId) => {
    if (!socket) return;
    socket.emit('organizer_reply', { queryId, eventId: id, replyText: replyTexts[queryId] || '' });
    setReplyTexts(prev => {
      const newTexts = { ...prev };
      delete newTexts[queryId];
      return newTexts;
    });
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessageText.trim()) return;
    
    setIsBroadcasting(true);
    try {
      const res = await api.post(`/events/${id}/broadcast`, { message: broadcastMessageText });
      toast.success(res.data.message || 'Broadcast sent successfully!');
      
      // Update local state to immediately show the new announcement
      setEvent(prev => ({
        ...prev,
        announcements: [...(prev.announcements || []), { message: broadcastMessageText, date: new Date().toISOString() }]
      }));
      
      setIsBroadcastModalOpen(false);
      setBroadcastMessageText('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleDeleteBroadcast = async (announcementId) => {
    if (!window.confirm('Are you sure you want to delete this broadcast?')) return;
    try {
      await api.delete(`/events/${id}/broadcast/${announcementId}`);
      toast.success('Broadcast deleted successfully');
      setEvent(prev => ({
        ...prev,
        announcements: prev.announcements.filter(a => a._id !== announcementId)
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete broadcast');
    }
  };

  const handleToggleHide = async (announcementId) => {
    try {
      const { data } = await api.patch(`/events/${id}/broadcast/${announcementId}/toggle-hide`);
      toast.success(data.message);
      setEvent(prev => ({
        ...prev,
        announcements: prev.announcements.map(a =>
          a._id === announcementId ? { ...a, isHidden: data.announcement.isHidden } : a
        )
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update broadcast visibility');
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-[#F8FAFC] flex pt-20 transition-all duration-300 pl-0 ${isOpen ? 'md:pl-64' : 'md:pl-[72px]'}`}>
        <Navbar />
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  const unresolvedCount = queries.filter(q => !q.isResolved).length;

  return (
    <div className={`min-h-screen bg-[#F8FAFC] flex pt-20 transition-all duration-300 pl-0 ${isOpen ? 'md:pl-64' : 'md:pl-[72px]'}`}>
      <Navbar />
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 p-6 md:p-10 overflow-y-auto animate-fade-in-up">
          <div className="max-w-4xl mx-auto">
            
            <button 
              onClick={() => navigate('/hosted-events')}
              className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium text-sm mb-6 w-fit"
            >
              <ArrowLeft size={16} /> Back to Hosted Events
            </button>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Live Queries</h1>
                    <p className="text-sm text-gray-500 font-medium">Manage Q&A for <span className="text-indigo-600">{event?.title}</span></p>
                  </div>
                </div>
              </div>
                <div className="flex gap-4 items-center flex-wrap">
                  <button 
                    onClick={() => setIsBroadcastModalOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all text-sm h-full"
                  >
                    <Megaphone size={18} />
                    Broadcast
                  </button>
                  {/* Live Attendee Pulse */}
                  {presenceList.filter(p => p.role === 'attendee').length > 0 && (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-2xl text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      {presenceList.filter(p => p.role === 'attendee').length} Attendee{presenceList.filter(p => p.role === 'attendee').length > 1 ? 's' : ''} Online
                    </div>
                  )}
                  <div className="bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total</p>
                    <p className="text-2xl font-black text-gray-900">{queries.length}</p>
                  </div>
                  <div className="bg-orange-50 px-4 py-3 rounded-2xl border border-orange-100 text-center">
                    <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">Unresolved</p>
                    <p className="text-2xl font-black text-orange-600">{unresolvedCount}</p>
                  </div>
                </div>
            </div>

            {/* Broadcast History Section */}
            {event?.announcements && event.announcements.length > 0 && (
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl mb-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                {/* Clickable header to expand/collapse */}
                <button
                  onClick={() => setIsBroadcastHistoryOpen(prev => !prev)}
                  className="w-full flex items-center justify-between p-8 pb-4 text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner">
                      <Megaphone size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">Broadcast History</h2>
                      <p className="text-sm font-medium text-gray-500">Manage your past announcements to attendees</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 text-indigo-700 font-bold text-sm">
                      {event.announcements.length} {event.announcements.length === 1 ? 'Message' : 'Messages'}
                    </div>
                    {/* Chevron icon */}
                    <div className={`w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 transition-transform duration-300 group-hover:bg-gray-100 ${isBroadcastHistoryOpen ? 'rotate-180' : 'rotate-0'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                  </div>
                </button>

                {/* Collapsible body */}
                <div className={`overflow-hidden transition-all duration-400 ease-in-out ${
                  isBroadcastHistoryOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-8 pb-8 border-t border-gray-50">
                    <div className="pt-5 space-y-3 max-h-[420px] overflow-y-auto pr-3 custom-scrollbar">
                  {event.announcements.slice().reverse().map((announcement, index) => (
                    <div
                      key={announcement._id || index}
                      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                        announcement.isHidden
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-white border-indigo-50 shadow-sm'
                      }`}
                    >
                      {/* Card body */}
                      <div className="flex items-start gap-3 p-4">
                        {/* Megaphone icon */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          announcement.isHidden
                            ? 'bg-gray-200 text-gray-400'
                            : 'bg-indigo-100 text-indigo-600'
                        }`}>
                          <Megaphone size={16} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {announcement.isHidden ? (
                              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">Hidden</span>
                            ) : (
                              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">Live</span>
                            )}
                            <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                              <Clock size={10} /> {new Date(announcement.date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className={`text-sm leading-relaxed font-medium break-words ${
                            announcement.isHidden ? 'text-gray-400 line-through' : 'text-gray-800'
                          }`}>
                            {announcement.message}
                          </p>
                        </div>
                      </div>

                      {/* Action bar — always visible */}
                      <div className={`flex items-center justify-between px-4 py-2 border-t ${
                        announcement.isHidden ? 'border-gray-200 bg-gray-100/50' : 'border-indigo-50/80 bg-indigo-50/30'
                      }`}>
                        {/* Hide / Show toggle pill */}
                        <button
                          onClick={() => handleToggleHide(announcement._id)}
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                            announcement.isHidden
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                              : 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {announcement.isHidden ? (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              Show to Attendees
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                              Hide from Attendees
                            </>
                          )}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteBroadcast(announcement._id)}
                          title="Delete permanently"
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border text-red-500 bg-red-50 border-red-200 hover:bg-red-100 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                    </div>{/* scrollable list */}
                  </div>{/* inner padding div */}
                </div>{/* collapsible wrapper */}
              </div>
            )}

            {/* Attendee Queries Section */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl mb-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              {/* Clickable header to expand/collapse */}
              <button
                onClick={() => setIsQueriesOpen(prev => !prev)}
                className="w-full flex items-center justify-between p-8 pb-4 text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Attendee Queries</h2>
                    <p className="text-sm font-medium text-gray-500">Respond to questions in real-time</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 text-blue-700 font-bold text-sm">
                    {queries.length} {queries.length === 1 ? 'Query' : 'Queries'}
                  </div>
                  {/* Chevron icon */}
                  <div className={`w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 transition-transform duration-300 group-hover:bg-gray-100 ${isQueriesOpen ? 'rotate-180' : 'rotate-0'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </div>
              </button>

              {/* Collapsible body */}
              <div className={`overflow-hidden transition-all duration-400 ease-in-out ${
                isQueriesOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-8 pb-8 border-t border-gray-50">
                  <div className="pt-5 space-y-4 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar">
              {queries.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <MessageSquare size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No queries yet</h3>
                  <p className="text-gray-500 text-sm">Attendees haven't asked any questions for this event.</p>
                </div>
              ) : (
                queries.map(q => (
                  <div key={q._id} className={`bg-white p-6 rounded-2xl border shadow-sm transition-all flex flex-col gap-4 ${q.isResolved ? 'border-gray-200 opacity-70' : 'border-indigo-100'}`}>
                    
                    {/* Header: User Info & Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                          {q.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{q.user.name}</p>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                            <Clock size={12} /> {new Date(q.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {q.isResolved && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider border border-green-100">
                          <CheckCircle2 size={14} /> Resolved
                        </span>
                      )}
                    </div>

                    {/* Question Content */}
                    <div className="pl-[52px]">
                      <p className={`text-gray-800 text-lg ${q.isResolved ? 'line-through text-gray-400' : ''}`}>{q.text}</p>
                      
                      {/* Chat History */}
                      {q.replies && q.replies.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {q.replies.map((msg, index) => (
                            <div key={index} className={`p-4 rounded-xl border relative ${msg.sender === 'organizer' ? "bg-indigo-50/50 border-indigo-100 ml-6" : "bg-gray-50 border-gray-100 mr-6"}`}>
                              <div className="flex items-center gap-2 mb-2">
                                {msg.sender === 'organizer' ? (
                                  <>
                                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-[10px]">
                                      You
                                    </div>
                                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Your Reply</span>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-700 font-bold text-[10px]">
                                      {q.user.name.charAt(0)}
                                    </div>
                                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">{q.user.name}</span>
                                  </>
                                )}
                                <span className="text-[10px] text-gray-400 font-medium ml-2">{new Date(msg.createdAt).toLocaleString()}</span>
                              </div>
                              <p className={`text-sm pl-8 ${msg.sender === 'organizer' ? "text-indigo-900" : "text-gray-700"}`}>{msg.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Reply Action (if unresolved) */}
                    {!q.isResolved && (
                      <div className="pl-[52px] mt-2">
                        <div className="flex items-center gap-3 w-full bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                          <input 
                            type="text"
                            placeholder="Type a message..."
                            value={replyTexts[q._id] || ''}
                            onChange={(e) => setReplyTexts({...replyTexts, [q._id]: e.target.value})}
                            className="flex-1 bg-transparent px-3 py-2 text-sm text-gray-800 focus:outline-none placeholder:text-gray-400"
                            onKeyDown={(e) => e.key === 'Enter' && handleReply(q._id)}
                          />
                          <button 
                            onClick={() => handleReply(q._id)}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-all shadow-md shadow-indigo-600/20 active:scale-95 flex items-center gap-2"
                          >
                            Send Reply
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                ))
              )}
                  </div>{/* scrollable list */}
                </div>{/* inner padding div */}
              </div>{/* collapsible wrapper */}
            </div>

          </div>
        </main>
      </div>

      {/* Broadcast Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in-up border border-gray-100">
            <div className="flex justify-between items-center p-6 border-b border-gray-50 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <Megaphone size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Broadcast Message</h3>
                  <p className="text-xs text-gray-500 font-medium">Send an announcement to all registered attendees.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsBroadcastModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleBroadcast} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Message Content</label>
                <textarea 
                  value={broadcastMessageText}
                  onChange={(e) => setBroadcastMessageText(e.target.value)}
                  placeholder="Type your announcement here..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none min-h-[120px]"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button 
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isBroadcasting || !broadcastMessageText.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-70 shadow-md shadow-indigo-200"
                >
                  {isBroadcasting ? (
                    <><Loader2 size={18} className="animate-spin" /> Sending...</>
                  ) : (
                    <><Megaphone size={18} /> Send Broadcast</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
