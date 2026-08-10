import React, { useState, useContext } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function EditProfileModal({ isOpen, onClose }) {
  const { user, updateUser } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    college: user?.profile?.college || '',
    department: user?.profile?.department || '',
    year: user?.profile?.year || '',
    studentId: user?.profile?.studentId || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data } = await api.put('/users/profile', formData);
      updateUser(data);
      toast.success('Profile updated successfully!');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-[24px] w-full max-w-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] relative z-10 flex flex-col max-h-[90vh] animate-fade-in-up">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
          <button onClick={onClose} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
          <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100"></div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Academic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">College / University</label>
                  <input type="text" name="college" value={formData.college} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Department</label>
                  <input type="text" name="department" value={formData.department} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Student ID</label>
                  <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Year of Study</label>
                  <select name="year" value={formData.year} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Alumni">Alumni</option>
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 rounded-b-[24px]">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" form="edit-profile-form" disabled={isSubmitting} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
