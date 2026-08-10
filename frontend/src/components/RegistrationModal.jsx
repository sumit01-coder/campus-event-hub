import React, { useState, useContext, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function RegistrationModal({ isOpen, onClose, event, onRegister, isRegistering }) {
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    participantName: '',
    email: '',
    phone: '',
    college: '',
    participationType: 'individual',
    teamSize: 2
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
    }
  }, [user, isOpen]);

  if (!isOpen || !event) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
        onClick={!isRegistering ? onClose : undefined}
      ></div>

      {/* Modal */}
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white relative">
          <button 
            onClick={onClose}
            disabled={isRegistering}
            className="absolute top-4 right-4 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="text-2xl font-black mb-1 tracking-tight">Complete Registration</h2>
          <p className="text-indigo-100 text-sm font-medium opacity-90 line-clamp-1">{event.title}</p>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {(event.participationType === 'both' || event.participationType === 'group') && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-3">How are you registering?</label>
                <div className="flex gap-4">
                  {event.participationType !== 'group' && (
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.participationType === 'individual' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-indigo-300 text-gray-600'}`}>
                      <input type="radio" name="participationType" value="individual" checked={formData.participationType === 'individual'} onChange={handleChange} className="hidden" />
                      <span className="font-bold">Individual</span>
                    </label>
                  )}
                  {event.participationType !== 'individual' && (
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${(formData.participationType === 'group' || event.participationType === 'group') ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-indigo-300 text-gray-600'}`}>
                      <input type="radio" name="participationType" value="group" checked={formData.participationType === 'group' || event.participationType === 'group'} onChange={(e) => {
                        if (event.participationType !== 'group') handleChange(e);
                      }} className="hidden" />
                      <span className="font-bold">Team / Group</span>
                    </label>
                  )}
                </div>
                {(formData.participationType === 'group' || event.participationType === 'group') && (
                  <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Total number of members (including you)</label>
                    <input 
                      type="number"
                      name="teamSize"
                      value={formData.teamSize}
                      onChange={handleChange}
                      min="2"
                      max={event.maxGroupSize}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm font-medium"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Maximum allowed: {event.maxGroupSize}</p>
                    <p className="text-xs text-indigo-600 mt-2 font-medium bg-indigo-50 p-2 rounded border border-indigo-100">
                      You will receive a Team Code after registering. Share it with {formData.teamSize - 1} members to join for free!
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <input 
                type="text"
                name="participantName"
                value={formData.participantName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium text-gray-900"
                placeholder="Enter your full name"
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
                placeholder="Enter your email"
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
                placeholder="Enter your contact number"
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
                placeholder="Enter your college name (optional)"
              />
            </div>

            {event.price > 0 && (
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mt-6">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm text-orange-800 font-medium">Ticket Price:</p>
                  <p className="text-sm text-orange-900 font-bold">₹{event.price} x {formData.participationType === 'group' ? formData.teamSize : 1}</p>
                </div>
                <div className="flex justify-between items-center border-t border-orange-200 pt-2 mt-2">
                  <p className="text-sm text-orange-800 font-bold">Total Payment Required:</p>
                  <p className="text-lg text-orange-900 font-black">₹{event.price * (formData.participationType === 'group' ? formData.teamSize : 1)}</p>
                </div>
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                disabled={isRegistering}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isRegistering}
                className="flex-[2] px-4 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isRegistering ? (
                  <><Loader2 className="animate-spin" size={18} /> Processing...</>
                ) : (
                  'Confirm Registration'
                )}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
