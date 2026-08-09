import React, { useState, useContext, useEffect } from 'react';
import { X, Loader2, Users } from 'lucide-react';
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
    
    // We don't have a direct "verify code" API, so we just proceed to step 2 
    // and let the join API handle validation.
    // If we wanted to, we could add a verify API, but for now we'll optimistically proceed.
    setStep(2);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      setIsJoining(true);
      const res = await api.post('/registrations/join', {
        teamCode,
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
                className="w-full py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
              >
                Continue
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoin} className="space-y-5">
              
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-indigo-800">Team Code:</span>
                <span className="font-mono font-bold text-lg text-indigo-700 tracking-widest">{teamCode}</span>
                <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-indigo-600 hover:underline">Change</button>
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
