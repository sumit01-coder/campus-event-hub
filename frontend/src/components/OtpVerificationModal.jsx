import React, { useState, useEffect } from 'react';
import { Mail, KeyRound, X, AlertCircle } from 'lucide-react';

export default function OtpVerificationModal({ isOpen, onClose, onVerify, email }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  
  useEffect(() => {
    if (!isOpen) {
      setOtp('');
      setError('');
      setTimeLeft(300);
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    
    if (timeLeft === 0) {
      setError('Code has expired. Please request a new one.');
      return;
    }
    
    try {
      await onVerify(otp);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code');
    }
  };

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Mail className="text-indigo-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Verify Email</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6">
            We've sent a 6-digit verification code to <span className="font-semibold text-gray-800">{email}</span>. Please enter it below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg tracking-widest font-mono text-center transition-all bg-gray-50 focus:bg-white"
                  placeholder="------"
                  required
                />
              </div>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">
                Code expires in:
              </span>
              <span className={`font-mono font-medium ${timeLeft < 60 ? 'text-red-500' : 'text-indigo-600'}`}>
                {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
            </div>

            <button
              type="submit"
              disabled={timeLeft === 0 || otp.length !== 6}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-3 rounded-xl font-medium transition-colors focus:ring-4 focus:ring-indigo-100"
            >
              Verify Code
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
