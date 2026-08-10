import React, { useState, useContext } from 'react';
import { X, Send, Loader2, Building, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function RequestOrganizerModal({ isOpen, onClose }) {
  const { user, updateUser } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    organizationType: user?.organizerProfile?.organizationType || '',
    organizationName: user?.organizerProfile?.organizationName || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.organizationType || !formData.organizationName) {
      toast.error('Please fill all fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data } = await api.put('/users/profile', formData);
      updateUser(data);
      toast.success('Organizer request sent successfully! Pending admin approval.');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative z-10 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <ShieldCheck size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Request Organizer Access</h2>
              <p className="text-purple-100 text-sm mt-1 opacity-90">Host events on behalf of your institute</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md">
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <div className="mb-6 bg-purple-50 border border-purple-100 p-4 rounded-2xl flex items-start gap-3">
            <Building size={20} className="text-purple-600 shrink-0 mt-0.5" />
            <p className="text-sm text-purple-900 leading-relaxed">
              Applying for organizer access allows you to publish events, manage registrations, and broadcast emails. 
              <strong> All requests are manually verified by the administration team.</strong>
            </p>
          </div>

          <form id="organizer-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Host Type <span className="text-red-500">*</span></label>
              <select name="organizationType" value={formData.organizationType} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer">
                <option value="">Select Type</option>
                <option value="Institute">Institute / College</option>
                <option value="Faculty">Faculty Member</option>
                <option value="Student Club">Student Club</option>
                <option value="Normal User">Independent Organizer</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Organization / Club Name <span className="text-red-500">*</span></label>
              <input type="text" name="organizationName" value={formData.organizationName} onChange={handleChange} required placeholder="e.g. GDSC PPSU, TechFest Committee" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" form="organizer-form" disabled={isSubmitting} className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Submit Request
          </button>
        </div>

      </div>
    </div>
  );
}
