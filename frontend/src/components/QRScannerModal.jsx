import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QRScannerModal({ isOpen, onClose, onScan }) {
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      return;
    }

    const scanner = new Html5QrcodeScanner('reader', { 
        qrbox: { width: 250, height: 250 },
        fps: 5 
    }, false);

    let isScanning = true;

    scanner.render(
      (decodedText) => {
        if (!isScanning) return;
        isScanning = false;
        
        // Success
        setIsSuccess(true);
        toast.success('Pass Scanned Successfully!');
        
        // Notify parent
        onScan(decodedText);
        
        // Close after a brief delay
        setTimeout(() => {
          scanner.clear().catch(e => console.error(e));
          onClose();
        }, 1500);
      },
      (error) => {
        // Just ignore continuous errors during scanning
      }
    );

    return () => {
      isScanning = false;
      scanner.clear().catch(e => console.error(e));
    };
  }, [isOpen, onScan, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative z-10 bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
          <h2 className="font-bold text-lg">Scan Attendee Pass</h2>
          <button onClick={onClose} className="p-1 hover:bg-indigo-700 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-10">
              <CheckCircle size={64} className="text-green-500 mb-4 animate-bounce" />
              <h3 className="text-2xl font-bold text-gray-800">Check-In Successful!</h3>
            </div>
          ) : (
            <div id="reader" className="w-full overflow-hidden rounded-xl border border-gray-200"></div>
          )}
        </div>
      </div>
    </div>
  );
}
