import React, { useState, useEffect } from 'react';
import { X, Loader2, Calendar as CalendarIcon, MapPin, Tag, Users, Clock, DollarSign, Edit3, LayoutList } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function EditEventModal({ isOpen, onClose, event, onEventUpdated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    category: '',
    price: 0,
    capacity: 10,
    participationType: 'individual',
    maxGroupSize: 1,
    registrationDeadline: ''
  });

  useEffect(() => {
    if (isOpen && event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
        time: event.time || '',
        venue: event.venue || '',
        category: event.category || '',
        price: event.price || 0,
        capacity: event.capacity || 10,
        participationType: event.participationType || 'individual',
        maxGroupSize: event.maxGroupSize || 1,
        registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 16) : ''
      });
    }
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data } = await api.put(`/events/${event._id}`, formData);
      toast.success('Event updated successfully!');
      onEventUpdated(data);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Modal */}
      <div className="bg-white rounded-[24px] w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Edit3 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Edit Event</h2>
              <p className="text-blue-100 text-xs font-medium truncate max-w-[200px] md:max-w-md">{event.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Event Title <span className="text-red-500">*</span></label>
              <div className="relative">
                <LayoutList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                  className="w-full pl-9 pr-4 bg-gray-50 border border-gray-200 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-sm transition-all outline-none font-medium" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <select 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange} 
                    className="w-full pl-9 pr-3 bg-gray-50 border border-gray-200 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-sm appearance-none outline-none font-medium text-gray-700"
                  >
                    <option value="technology">Technology</option>
                    <option value="music">Music & Arts</option>
                    <option value="business">Business & Networking</option>
                    <option value="sports">Sports</option>
                    <option value="workshop">Workshop / Seminar</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Participation Type <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <select 
                    name="participationType" 
                    value={formData.participationType} 
                    onChange={handleChange} 
                    className="w-full pl-9 pr-3 bg-gray-50 border border-gray-200 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-sm appearance-none outline-none font-medium text-gray-700"
                  >
                    <option value="individual">Individual Only</option>
                    <option value="group">Group Only</option>
                    <option value="both">Both (Indiv & Group)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="date" 
                    name="date" 
                    value={formData.date} 
                    onChange={handleChange} 
                    required 
                    className="w-full pl-4 pr-9 bg-gray-50 border border-gray-200 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-sm outline-none font-medium text-gray-700" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Time <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="time" 
                    name="time" 
                    value={formData.time} 
                    onChange={handleChange} 
                    required 
                    className="w-full pl-4 pr-9 bg-gray-50 border border-gray-200 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-sm outline-none font-medium text-gray-700" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Venue <span className="text-red-500">*</span></label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    name="venue" 
                    value={formData.venue} 
                    onChange={handleChange} 
                    required 
                    className="w-full pl-9 pr-3 bg-gray-50 border border-gray-200 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-sm outline-none font-medium" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Ticket Price (₹)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleChange} 
                    min="0"
                    step="0.01"
                    className="w-full pl-9 pr-3 bg-gray-50 border border-gray-200 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-sm outline-none font-medium" 
                  />
                </div>
              </div>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-${(formData.participationType === 'group' || formData.participationType === 'both') ? '3' : '2'} gap-6`}>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Max Capacity <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="number" 
                    name="capacity" 
                    value={formData.capacity} 
                    onChange={handleChange} 
                    required
                    min="1"
                    className="w-full pl-9 pr-3 bg-gray-50 border border-gray-200 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-sm outline-none font-medium" 
                  />
                </div>
              </div>

              {(formData.participationType === 'group' || formData.participationType === 'both') && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Max Group Size <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="number" 
                      name="maxGroupSize" 
                      value={formData.maxGroupSize} 
                      onChange={handleChange} 
                      required
                      min="2"
                      className="w-full pl-9 pr-3 bg-gray-50 border border-gray-200 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-sm outline-none font-medium" 
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Registration Deadline</label>
                <div className="relative">
                  <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="datetime-local" 
                    name="registrationDeadline" 
                    value={formData.registrationDeadline} 
                    onChange={handleChange} 
                    className="w-full pl-3 pr-9 bg-gray-50 border border-gray-200 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-sm outline-none font-medium text-gray-700" 
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Event Description <span className="text-red-500">*</span></label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                required 
                rows="5"
                className="w-full bg-gray-50 border border-gray-200 py-3 px-4 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-sm outline-none font-medium resize-none" 
              ></textarea>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] px-4 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><Loader2 className="animate-spin" size={18} /> Saving...</>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
            
          </form>
        </div>

      </div>
    </div>
  );
}
