import React, { useState } from 'react';
import { X, Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function RatingModal({ isOpen, onClose, event, onRatingSubmitted }) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post(`/events/${event._id}/rate`, { rating, review });
      toast.success(res.data.message || 'Rating submitted successfully!');
      onRatingSubmitted(res.data.ratings);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-fade-in-up">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Rate this Event</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
              >
                <Star 
                  size={40} 
                  className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} transition-colors`} 
                />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Write a review (optional)</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What did you think of the event?"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[100px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all flex justify-center items-center gap-2 shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? <><Loader2 className="animate-spin" size={20}/> Submitting...</> : 'Submit Rating'}
          </button>
        </form>

      </div>
    </div>
  );
}
