import React, { useState, useRef, useContext, useEffect } from 'react';
import { X, Camera, Upload, CheckCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function IdentityVerificationModal({ isOpen, onClose }) {
  const { updateUser } = useContext(AuthContext);
  
  const [step, setStep] = useState(1); // 1: Intro, 2: ID Upload, 3: Live Photo, 4: Success
  const [idCardFile, setIdCardFile] = useState(null);
  const [idCardPreview, setIdCardPreview] = useState('');
  
  // Webcam state
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [livePhotoBlob, setLivePhotoBlob] = useState(null);
  const [livePhotoPreview, setLivePhotoPreview] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stop webcam when component unmounts or modal closes
  useEffect(() => {
    if (!isOpen) stopWebcam();
    return () => stopWebcam();
  }, [isOpen]);

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast.error('Could not access webcam. Please check permissions.');
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL('image/jpeg');
      setLivePhotoPreview(dataUrl);
      
      canvas.toBlob((blob) => {
        setLivePhotoBlob(blob);
      }, 'image/jpeg');
      
      stopWebcam();
    }
  };

  const handleIdCardChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdCardFile(file);
      setIdCardPreview(URL.createObjectURL(file));
    }
  };

  const uploadFile = async (fileOrBlob, filename) => {
    try {
      const formData = new FormData();
      formData.append('image', fileOrBlob, filename);
      const { data } = await api.post('/upload', formData);
      return data.imageUrl;
    } catch (err) {
      console.error(`Upload failed for ${filename}:`, err);
      throw new Error(`Upload failed for ${filename}: ${err.message}`);
    }
  };

  const handleSubmit = async () => {
    if (!idCardFile || !livePhotoBlob) {
      toast.error('Please complete all steps');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // 1. Upload both images
      const idCardUrl = await uploadFile(idCardFile, 'idcard.jpg');
      const livePhotoUrl = await uploadFile(livePhotoBlob, 'livephoto.jpg');
      
      // 2. Submit Verification
      const { data } = await api.post('/users/verify-identity', {
        idCardPhotoUrl: idCardUrl,
        livePhotoUrl: livePhotoUrl
      });
      
      updateUser(data);
      setStep(4);
    } catch (error) {
      console.error('Verification error:', error.response?.data || error);
      toast.error(`Verification failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetState = () => {
    setStep(1);
    setIdCardFile(null);
    setIdCardPreview('');
    setLivePhotoBlob(null);
    setLivePhotoPreview('');
    stopWebcam();
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={handleClose}></div>
      <div className="bg-white rounded-[24px] w-full max-w-xl shadow-2xl relative z-10 flex flex-col overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
          <h2 className="text-xl font-extrabold text-gray-900">Identity Verification</h2>
          <button onClick={handleClose} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          
          {/* STEP 1: Intro */}
          {step === 1 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Camera size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Secure Your Account</h3>
                <p className="text-gray-500 leading-relaxed max-w-sm mx-auto">To host events or gain verified status, you must upload a valid college ID and capture a live photo to confirm your identity.</p>
              </div>
              <button 
                onClick={() => setStep(2)}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all shadow-sm"
              >
                Start Verification
              </button>
            </div>
          )}

          {/* STEP 2: ID Upload */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Step 1: Upload ID Card</h3>
                <p className="text-sm text-gray-500">Please upload a clear photo of your college ID or Faculty ID card.</p>
              </div>
              
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors relative cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleIdCardChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {idCardPreview ? (
                  <img src={idCardPreview} alt="ID Preview" className="max-h-48 mx-auto rounded-xl shadow-sm object-contain" />
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500 mb-4">
                      <ImageIcon size={28} />
                    </div>
                    <p className="font-bold text-gray-700 mb-1">Click to browse or drag image here</p>
                    <p className="text-xs text-gray-400">Supports JPG, PNG (Max 5MB)</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(1)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">Back</button>
                <button 
                  onClick={() => {
                    setStep(3);
                    startWebcam();
                  }} 
                  disabled={!idCardFile}
                  className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Next: Live Photo
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Live Photo */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Step 2: Live Photo</h3>
                <p className="text-sm text-gray-500">Look directly into the camera and ensure your face is clearly visible.</p>
              </div>
              
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-video shadow-inner">
                {!livePhotoPreview ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <img src={livePhotoPreview} alt="Live Photo" className="w-full h-full object-cover transform -scale-x-100" />
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex justify-between pt-4 items-center">
                <button 
                  onClick={() => {
                    stopWebcam();
                    setStep(2);
                  }} 
                  className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Back
                </button>

                {!livePhotoPreview ? (
                  <button 
                    onClick={capturePhoto} 
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition-all shadow-md flex items-center gap-2"
                  >
                    <Camera size={20} /> Capture
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        setLivePhotoPreview('');
                        setLivePhotoBlob(null);
                        startWebcam();
                      }} 
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors text-sm"
                    >
                      Retake
                    </button>
                    <button 
                      onClick={handleSubmit} 
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-70"
                    >
                      {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      {isSubmitting ? 'Verifying...' : 'Submit Verification'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <div className="text-center space-y-6 py-6">
              <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                <CheckCircle size={48} />
              </div>
              <div>
                <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Verified!</h3>
                <p className="text-gray-500 leading-relaxed">Your identity has been successfully verified by the system. You now have full access to host events.</p>
              </div>
              <button 
                onClick={handleClose}
                className="px-8 py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-lg transition-all shadow-sm"
              >
                Return to Profile
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
