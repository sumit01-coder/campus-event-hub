import React, { useState, useContext, useEffect } from 'react';
import { X, Loader2, Users, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function JoinTeamModal({ isOpen, onClose }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = Enter code, 2 = Confirm Details
  const [teamCode, setTeamCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [event, setEvent] = useState(null);
  const [customAnswers, setCustomAnswers] = useState({});
  
  const [formData, setFormData] = useState({
    participantName: '',
    email: '',
    phone: '',
    college: ''
  });

  // Pre-fill with user data if available
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        participantName: user.name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        college: user.profile?.college || ''
      });
      setStep(1);
      setTeamCode('');
      setEvent(null);
      setCustomAnswers({});
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!teamCode.trim()) {
      toast.error('Please enter a team code');
      return;
    }
    
    try {
      setIsVerifying(true);
      const { data } = await api.get(`/registrations/verify-team/${teamCode}`);
      setEvent(data.event);
      toast.success(data.message);
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid Team Code');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    
    // Validate required custom checkbox questions
    if (event?.customQuestions) {
      for (const q of event.customQuestions) {
        if (q.type === 'checkbox' && q.required) {
          const answers = customAnswers[q._id] || [];
          if (answers.length === 0) {
            toast.error(`Please select at least one option for: ${q.question}`);
            return;
          }
        }
      }
    }

    try {
      setIsJoining(true);
      
      const formattedAnswers = Object.entries(customAnswers).map(([questionId, answer]) => ({
        questionId,
        answer
      }));

      const res = await api.post('/registrations/join', {
        teamCode,
        customAnswers: formattedAnswers,
        ...formData
      });
      
      toast.success(res.data.message || 'Successfully joined the team!');
      onClose();
      // Redirect to that event's details
      navigate(`/event/${res.data.event._id}`);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join team');
      if (error.response?.status === 404) {
        setStep(1); // go back if code is invalid
      }
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
        onClick={!isJoining ? onClose : undefined}
      ></div>

      {/* Modal */}
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative">
          <button 
            onClick={onClose}
            disabled={isJoining}
            className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Users size={24} />
            <h2 className="text-2xl font-black tracking-tight">Join a Team</h2>
          </div>
          <p className="text-indigo-100 text-sm font-medium opacity-90">Enter your team code to join for free</p>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 overflow-y-auto">
          
          {step === 1 ? (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Team Code</label>
                <input 
                  type="text"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                  required
                  maxLength={6}
                  className="w-full px-4 py-4 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-mono font-bold text-2xl text-center tracking-[0.2em] text-gray-900 uppercase"
                  placeholder="XXXXXX"
                />
              </div>

              <button 
                type="submit"
                disabled={isVerifying}
                className="w-full py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all active:scale-95 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isVerifying ? <><Loader2 className="animate-spin" size={20} /> Verifying...</> : 'Continue'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoin} className="space-y-5">
              
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex flex-col gap-2 mb-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-indigo-800">Team Code:</span>
                  <span className="font-mono font-bold text-lg text-indigo-700 tracking-widest">{teamCode}</span>
                  <button type="button" onClick={() => { setStep(1); setEvent(null); setCustomAnswers({}); }} className="text-xs font-bold text-indigo-600 hover:underline">Change</button>
                </div>
                {event && (
                  <div className="text-xs font-medium text-indigo-900 border-t border-indigo-100 pt-2 mt-1">
                    Joining Event: <span className="font-bold">{event.title}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  name="participantName"
                  value={formData.participantName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                <input 
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">College / Organization</label>
                <input 
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium text-gray-900"
                />
              </div>

              {event?.customQuestions && event.customQuestions.length > 0 && (
                <div className="border-t border-gray-100 pt-5 mt-2 space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Additional Information</h4>
                  {event.customQuestions.map((q) => (
                    <div key={q._id}>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">
                        {q.question} {q.required && <span className="text-red-500">*</span>}
                      </label>
                      
                      {q.type === 'text' && (
                        <input 
                          type="text"
                          required={q.required}
                          value={customAnswers[q._id] || ''}
                          onChange={(e) => setCustomAnswers(prev => ({ ...prev, [q._id]: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium text-gray-900"
                          placeholder="Your answer"
                        />
                      )}

                      {q.type === 'dropdown' && (
                        <div className="relative">
                          <select
                            required={q.required}
                            value={customAnswers[q._id] || ''}
                            onChange={(e) => setCustomAnswers(prev => ({ ...prev, [q._id]: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium text-gray-900 appearance-none bg-white"
                          >
                            <option value="" disabled>Select an option</option>
                            {q.options.map((opt, i) => (
                              <option key={i} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                          </div>
                        </div>
                      )}

                      {q.type === 'checkbox' && (
                        <div className="space-y-2 mt-2">
                          {q.options.map((opt, i) => {
                            const isChecked = (customAnswers[q._id] || []).includes(opt);
                            return (
                              <label key={i} className="flex items-start gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center pt-0.5">
                                  <input 
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const currentAnswers = customAnswers[q._id] || [];
                                      let newAnswers;
                                      if (e.target.checked) {
                                        newAnswers = [...currentAnswers, opt];
                                      } else {
                                        newAnswers = currentAnswers.filter(a => a !== opt);
                                      }
                                      setCustomAnswers(prev => ({ ...prev, [q._id]: newAnswers }));
                                    }}
                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 opacity-0 absolute"
                                  />
                                  <div className={`w-5 h-5 rounded border ${isChecked ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300 group-hover:border-indigo-400'} flex items-center justify-center transition-colors`}>
                                    {isChecked && <CheckCircle size={14} className="text-white" />}
                                  </div>
                                </div>
                                <span className="text-sm font-medium text-gray-700 select-none pt-0.5">{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={onClose}
                  disabled={isJoining}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isJoining}
                  className="flex-[2] px-4 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isJoining ? (
                    <><Loader2 className="animate-spin" size={18} /> Joining...</>
                  ) : (
                    'Join Team'
                  )}
                </button>
              </div>
              
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

