import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { io } from 'socket.io-client';
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function EventCheckin() {
  const { eventId, registrationId } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error, unauthorized
  const [message, setMessage] = useState('');
  const [participantName, setParticipantName] = useState('');

  useEffect(() => {
    const checkInUser = async () => {
      try {
        const response = await api.put(`/registrations/${registrationId}/checkin`);
        
        setStatus('success');
        setMessage('Check-in successful!');
        setParticipantName(response.data.registration.participantName);

        // Emit socket event so dashboard updates instantly
        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
        socket.emit('mark_attendance', { registrationId, eventId });
        
        setTimeout(() => {
          socket.close();
        }, 1000);

      } catch (err) {
        if (err.response?.status === 401) {
          setStatus('unauthorized');
          setMessage('You must be the event organizer to check attendees in.');
        } else {
          setStatus('error');
          setMessage(err.response?.data?.message || 'Check-in failed. Please try again.');
        }
      }
    };

    checkInUser();
  }, [eventId, registrationId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden text-center relative">
        {/* Header */}
        <div className={`p-8 pb-12 text-white ${
          status === 'success' ? 'bg-green-500' :
          status === 'loading' ? 'bg-indigo-600' : 'bg-red-500'
        }`}>
          {status === 'loading' && <Loader2 size={64} className="animate-spin mx-auto opacity-80" />}
          {status === 'success' && <CheckCircle2 size={80} className="mx-auto mb-4 animate-bounce" />}
          {(status === 'error' || status === 'unauthorized') && <XCircle size={80} className="mx-auto mb-4" />}
          
          <h1 className="text-3xl font-black mt-4">
            {status === 'loading' && 'Checking In...'}
            {status === 'success' && 'Success!'}
            {(status === 'error' || status === 'unauthorized') && 'Error'}
          </h1>
        </div>

        {/* Body */}
        <div className="p-8 -mt-6 relative z-10 bg-white rounded-t-[2rem]">
          {status === 'success' && (
            <div className="space-y-2">
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Participant</p>
              <h2 className="text-3xl font-black text-gray-900">{participantName}</h2>
              <p className="text-green-600 font-bold mt-2">has been marked present!</p>
            </div>
          )}

          {(status === 'error' || status === 'unauthorized') && (
            <div className="space-y-4">
              <p className="text-gray-900 font-bold text-lg">{message}</p>
              {status === 'unauthorized' && (
                <p className="text-gray-500 text-sm">Please log in to your organizer account on this device and scan again.</p>
              )}
            </div>
          )}

          <div className="mt-10">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold transition-colors">
              <ArrowLeft size={18} /> Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
