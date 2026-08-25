import React, { useState, useContext, useEffect } from 'react';
import { X, Loader2, UploadCloud, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function RegistrationModal({ isOpen, onClose, event, onRegister, isRegistering, initialData = null, isEditing = false }) {
  const { user } = useContext(AuthContext);
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showQrPreview, setShowQrPreview] = useState(false);
  
  const hasQrCode = !!event?.organizerId?.paymentConfig?.qrCode;

  const [formData, setFormData] = useState({
    participantName: '',
    email: '',
    phone: '',
    college: '',
    participationType: 'individual',
    teamSize: 2
  });

  const [customAnswers, setCustomAnswers] = useState({});

  // Pre-fill with user data or initialData if editing
  useEffect(() => {
    if (isOpen) {
      if (isEditing && initialData) {
        setFormData({
          participantName: initialData.participantName || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
          college: initialData.college || '',
          participationType: initialData.participationType || 'individual',
          teamSize: initialData.teamSize || 2
        });
        
        // Reconstruct customAnswers object
        if (initialData.customAnswers && initialData.customAnswers.length > 0) {
          const answersMap = {};
          initialData.customAnswers.forEach(ans => {
            answersMap[ans.questionId] = ans.answer;
          });
          setCustomAnswers(answersMap);
        }
      } else if (user) {
        setFormData({
          participantName: user.name || '',
          email: user.email || '',
          phone: user.profile?.phone || '',
          college: user.profile?.college || '',
          participationType: 'individual',
          teamSize: 2
        });
        setCustomAnswers({});
      }
    }
  }, [user, isOpen, isEditing, initialData]);

  if (!isOpen || !event) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCustomAnswerChange = (questionId, value) => {
    setCustomAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (event.customQuestions) {
      for (const q of event.customQuestions) {
        if (q.required && q.type === 'checkbox') {
          const answers = customAnswers[q._id];
          if (!answers || answers.length === 0) {
            toast.error(`Please select at least one option for: ${q.question}`);
            return;
          }
        }
      }
    }

    if (!isEditing && event.price > 0 && !paymentProofUrl) {
      toast.error('Please upload your payment proof screenshot');
      return;
    }
    
    const formattedCustomAnswers = Object.entries(customAnswers).map(([questionId, answer]) => ({
      questionId,
      answer
    }));

    onRegister({ ...formData, paymentProof: paymentProofUrl, customAnswers: formattedCustomAnswers });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    setIsUploading(true);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await api.post('/upload', uploadData, config);
      
      const newUrl = `http://localhost:5000${data.imageUrl}`;
      setPaymentProofUrl(newUrl);
      toast.success('Payment proof uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload payment proof');
    } finally {
      setIsUploading(false);
    }
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
            
            {!isEditing && (event.participationType === 'both' || event.participationType === 'group') && (
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
                disabled={isEditing}
                className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium text-gray-900 ${isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
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

            {event.customQuestions && event.customQuestions.length > 0 && (
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
                        onChange={(e) => handleCustomAnswerChange(q._id, e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium text-gray-900"
                        placeholder="Your answer"
                      />
                    )}

                    {q.type === 'dropdown' && (
                      <div className="relative">
                        <select
                          required={q.required}
                          value={customAnswers[q._id] || ''}
                          onChange={(e) => handleCustomAnswerChange(q._id, e.target.value)}
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
                                    handleCustomAnswerChange(q._id, newAnswers);
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

            {!isEditing && event.price > 0 && (
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mt-6">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm text-orange-800 font-medium">Ticket Price:</p>
                  <p className="text-sm text-orange-900 font-bold">₹{event.price} x {formData.participationType === 'group' ? formData.teamSize : 1}</p>
                </div>
                <div className="flex justify-between items-center border-t border-orange-200 pt-2 mt-2">
                  <p className="text-sm text-orange-800 font-bold">Total Payment Required:</p>
                  <p className="text-lg text-orange-900 font-black">₹{event.price * (formData.participationType === 'group' ? formData.teamSize : 1)}</p>
                </div>

                <div className="mt-4 border-t border-orange-200 pt-4">
                  <p className="text-sm font-bold text-orange-900 mb-2">1. Scan & Pay</p>
                  {hasQrCode ? (
                    <>
                      <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-orange-200 mb-4">
                        <img 
                          src={event.organizerId.paymentConfig.qrCode} 
                          alt="UPI QR Code" 
                          className="w-40 h-40 object-contain mb-2 cursor-pointer hover:opacity-80 transition-opacity border border-gray-100 rounded-lg p-1" 
                          onClick={() => setShowQrPreview(true)}
                          title="Click to enlarge"
                        />
                        <p className="text-xs font-bold text-gray-500 uppercase mt-1">UPI ID: {event.organizerId.paymentConfig.upiId}</p>
                        <button 
                          type="button"
                          onClick={() => setShowQrPreview(true)}
                          className="text-indigo-600 text-[10px] font-bold uppercase mt-1 hover:underline"
                        >
                          Tap to enlarge QR
                        </button>
                      </div>

                      <p className="text-sm font-bold text-orange-900 mb-2">2. Upload Payment Proof <span className="text-red-500">*</span></p>
                      <div className="relative overflow-hidden w-full">
                        {paymentProofUrl ? (
                          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="text-green-500" size={20} />
                              <span className="text-sm font-bold text-green-700">Proof Uploaded</span>
                            </div>
                            <button type="button" onClick={() => setPaymentProofUrl('')} className="text-xs text-red-500 font-bold hover:underline">Remove</button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-orange-300 rounded-xl bg-orange-50/50 hover:bg-orange-100/50 transition-colors cursor-pointer">
                            <UploadCloud className="text-orange-400 mb-1" size={24} />
                            <span className="text-xs font-bold text-orange-700">{isUploading ? 'Uploading...' : 'Click to upload screenshot'}</span>
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={isUploading}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border-2 border-red-200 mb-2">
                      <p className="text-sm font-bold text-red-600 text-center mb-1">Payment option not available.</p>
                      <p className="text-xs text-red-400 text-center">The organizer has not uploaded a QR code yet. Please contact the organizer.</p>
                    </div>
                  )}
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
                disabled={isRegistering || (!isEditing && event.price > 0 && !paymentProofUrl)}
                className="flex-[2] px-4 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isRegistering ? (
                  <><Loader2 className="animate-spin" size={18} /> Processing...</>
                ) : (isEditing ? 'Update Registration' : 'Confirm Registration')}
              </button>
            </div>
            
          </form>
        </div>
      </div>

      {/* QR Code Full Screen Preview Modal */}
      {showQrPreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setShowQrPreview(false)}>
          <div className="relative bg-white p-6 rounded-3xl max-w-sm w-full flex flex-col items-center animate-zoom-in" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowQrPreview(false)}
              className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full p-2 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-black text-gray-900 mb-4">Scan to Pay</h3>
            <div className="bg-gray-50 p-2 rounded-2xl border border-gray-200 w-full flex justify-center">
              <img src={event.organizerId.paymentConfig.qrCode} alt="UPI QR Code Preview" className="w-full max-w-[280px] object-contain rounded-xl" />
            </div>
            <p className="text-sm font-bold text-gray-600 mt-4 uppercase">UPI ID: {event.organizerId.paymentConfig.upiId}</p>
          </div>
        </div>
      )}
    </div>
  );
}
