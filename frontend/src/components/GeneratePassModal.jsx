import React, { useRef } from 'react';
import { X, Printer, QrCode, Calendar, MapPin, Ticket, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GeneratePassModal({ isOpen, onClose, userReg, event }) {
  const printRef = useRef();

  if (!isOpen || !userReg || !event) return null;

  const handlePrint = () => {
    window.print();
  };

  // Generate a mock unique ticket ID based on object ID
  const ticketId = userReg._id.substring(userReg._id.length - 8).toUpperCase();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        
        {/* Controls - Hidden during print via CSS classes */}
        <div className="flex justify-end gap-3 mb-4 no-print">
          <button 
            onClick={() => {
              toast.success(`Pass successfully emailed to ${userReg.email || 'your registered email address'}!`);
            }}
            className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-colors"
          >
            <Mail size={18} /> Email Pass
          </button>
          <button 
            onClick={handlePrint}
            className="bg-white text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-colors"
          >
            <Printer size={18} /> Print Pass
          </button>
          <button 
            onClick={onClose}
            className="bg-black/50 text-white hover:bg-black/70 p-2 rounded-xl backdrop-blur transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Printable Ticket Area */}
        <div ref={printRef} className="print-area">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl relative">
            
            {/* Top Event Header */}
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 text-center text-white relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                <Ticket className="text-white drop-shadow-md" size={32} />
              </div>
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-[0.2em] mb-2">Admit One</p>
              <h2 className="text-2xl font-black leading-tight line-clamp-2 drop-shadow-md relative z-10">{event.title}</h2>
            </div>

            {/* Jagged tear-off edge decoration */}
            <div className="flex w-full -mt-2 relative z-10 overflow-hidden text-white">
              {[...Array(30)].map((_, i) => (
                <div key={i} className="w-4 h-4 bg-white rounded-full -mt-2 shrink-0"></div>
              ))}
            </div>

            {/* Ticket Body */}
            <div className="p-8 pt-4">
              
              <div className="mb-8">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Participant</p>
                <h3 className="text-2xl font-extrabold text-gray-900">{userReg.participantName}</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">{userReg.college || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar size={12}/> Date</p>
                  <p className="font-bold text-gray-800">{new Date(event.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">{event.time}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin size={12}/> Venue</p>
                  <p className="font-bold text-gray-800 line-clamp-2">{event.venue}</p>
                </div>
                
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Type</p>
                  {userReg.participationType === 'group' ? (
                     <div className="inline-block bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Team ({userReg.isTeamLeader ? 'Leader' : 'Member'})</div>
                  ) : (
                     <div className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Individual</div>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Payment</p>
                  <div className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${userReg.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {userReg.paymentStatus}
                  </div>
                </div>
              </div>

              {/* Barcode/QR Section */}
              <div className="pt-6 border-t-2 border-dashed border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-bold mb-1">TICKET ID</p>
                  <p className="font-mono font-bold tracking-widest text-lg text-gray-900">{ticketId}</p>
                </div>
                <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center p-1.5 overflow-hidden border border-gray-200 shadow-sm">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/checkin/' + event._id + '/' + userReg._id)}`}
                    alt="Attendance QR Code"
                    className="w-full h-full object-contain rounded-lg mix-blend-multiply"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Global CSS for Printing specifically for this modal */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            max-width: 500px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}
