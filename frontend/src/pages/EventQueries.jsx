import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { SidebarContext } from '../context/SidebarContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, MessageSquare, CheckCircle2, Clock, Loader2 } from 'lucide-react';
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

    // Connect to WebSocket
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    setSocket(newSocket);

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

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-[#F8FAFC] flex pt-20 transition-all duration-300 ${isOpen ? 'pl-64' : 'pl-[72px]'}`}>
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
    <div className={`min-h-screen bg-[#F8FAFC] flex pt-20 transition-all duration-300 ${isOpen ? 'pl-64' : 'pl-[72px]'}`}>
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
              <div className="flex gap-4">
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

            <div className="space-y-4">
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
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
