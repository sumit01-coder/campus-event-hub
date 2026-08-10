import React, { useState } from 'react';
import { X, UserPlus, Trash2, Shield, Mail } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ManageCoordinatorsModal({ isOpen, onClose, event, onEventUpdated }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !event) return null;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    try {
      const { data } = await api.post(`/events/${event._id}/coordinators`, { email });
      toast.success(data.message);
      onEventUpdated({ ...event, coordinators: data.coordinators });
      setEmail('');
    } catch (error) {
      let errorMessage = 'Failed to add coordinator.';
      if (!error.response) {
        errorMessage = 'Network error. Please make sure the backend server is running.';
      } else if (error.response.status === 404 && typeof error.response.data === 'string') {
        errorMessage = 'API Route not found! Please completely restart your backend node server so it can load the new code.';
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this coordinator?')) return;
    
    try {
      const { data } = await api.delete(`/events/${event._id}/coordinators/${userId}`);
      toast.success(data.message);
      onEventUpdated({ ...event, coordinators: data.coordinators });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove coordinator');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Manage Volunteers</h2>
              <p className="text-sm text-gray-500 line-clamp-1">{event.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleAdd} className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-2">Invite Coordinator by Email</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !email}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <UserPlus size={18} />
                {isLoading ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>

          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Current Coordinators ({event.coordinators?.length || 0})</h3>
            
            {(!event.coordinators || event.coordinators.length === 0) ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500 font-medium">No coordinators added yet.</p>
                <p className="text-xs text-gray-400 mt-1">They will be able to help check in attendees and answer live queries.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {event.coordinators.map((coord) => (
                  <li key={coord.userId} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-indigo-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold">
                        {coord.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{coord.name}</p>
                        <p className="text-xs text-gray-500">{coord.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(coord.userId)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove coordinator"
                    >
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
