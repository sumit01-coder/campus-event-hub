import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Loader2, Users, Download, ChevronLeft, ChevronRight, CheckCircle2, Ticket, ArrowLeft, Crown, Mail, Phone, Calendar, Clock, MapPin, Search, Filter, ScanLine, UserCheck } from 'lucide-react';
import api from '../services/api';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { SidebarContext } from '../context/SidebarContext';
import GeneratePassModal from '../components/GeneratePassModal';
import QRScannerModal from '../components/QRScannerModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function EventRegistrations() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { isOpen } = useContext(SidebarContext);

  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Pass Modal
  const [selectedPassUser, setSelectedPassUser] = useState(null);
  
  // Scanner Modal & Socket
  const [showScanner, setShowScanner] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket && id) {
      socket.emit('join_event_room', id);
      
      socket.on('attendance_updated', (updatedReg) => {
        setRegistrations(prev => prev.map(r => r._id === updatedReg._id ? updatedReg : r));
      });

      return () => {
        socket.off('attendance_updated');
      };
    }
  }, [socket, id]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch event details
        const eventRes = await api.get(`/events/${id}`);
        setEvent(eventRes.data);

        // Fetch registrations
        const regRes = await api.get(`/registrations/event/${id}`);
        setRegistrations(regRes.data);
      } catch (error) {
        toast.error('Failed to load data');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) {
        fetchData();
    }
  }, [id, user]);

  const handleExportCSV = () => {
    if (registrations.length === 0) {
      toast.error('No data to export');
      return;
    }

    const metaTitle = `Event:,"${event?.title || 'Unknown Event'}"`;
    const metaOrganizer = `Organizer:,"${user?.name || 'Unknown'}"`;
    const metaDate = `Export Date:,"${new Date().toLocaleDateString()}"`;
    const emptyRow = '';

    const teamLeaders = {};
    registrations.forEach(reg => {
      if (reg.participationType === 'group' && reg.isTeamLeader && reg.teamCode) {
        teamLeaders[reg.teamCode] = reg.participantName;
      }
    });

    const getTeamCode = (reg) => reg.participationType === 'group' ? (reg.isTeamLeader ? reg.teamCode : reg.joinedTeamCode) : null;
    
    const sortedRegistrations = [...registrations].sort((a, b) => {
      const teamA = getTeamCode(a);
      const teamB = getTeamCode(b);
      if (!teamA && !teamB) return 0;
      if (!teamA) return 1;
      if (!teamB) return -1;
      if (teamA !== teamB) return teamA.localeCompare(teamB);
      if (a.isTeamLeader) return -1;
      if (b.isTeamLeader) return 1;
      return 0;
    });

    const headers = ['Participant Name', 'Email', 'Phone', 'College', 'Type', 'Team Code', 'Is Leader', 'Leader Name', 'Payment Status', 'Attendance', 'Registration Date'];
    
    const rows = sortedRegistrations.map(reg => [
      `"${reg.participantName || ''}"`,
      `"${reg.email || ''}"`,
      `"${reg.phone || ''}"`,
      `"${reg.college || ''}"`,
      `"${reg.participationType || 'individual'}"`,
      `"${getTeamCode(reg) || ''}"`,
      `"${reg.isTeamLeader ? 'Yes' : 'No'}"`,
      `"${getTeamCode(reg) ? (teamLeaders[getTeamCode(reg)] || '') : ''}"`,
      `"${reg.paymentStatus || ''}"`,
      `"${reg.status === 'attended' ? 'Present' : 'Pending'}"`,
      `"${new Date(reg.createdAt).toLocaleDateString()}"`
    ]);

    const csvContent = [metaTitle, metaOrganizer, metaDate, emptyRow, headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${event?.title?.replace(/\s+/g, '_')}_Registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Export downloaded successfully!');
  };

  const handleExportPDF = () => {
    if (registrations.length === 0) {
      toast.error('No data to export');
      return;
    }

    const doc = new jsPDF('landscape');
    
    // Header
    doc.setFontSize(18);
    doc.text(event?.title || 'Event Registrations', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Organizer: ${user?.name || 'Unknown'}`, 14, 30);
    doc.text(`Total Registrations: ${registrations.length}`, 14, 36);

    // Table Data
    const teamLeaders = {};
    registrations.forEach(reg => {
      if (reg.participationType === 'group' && reg.isTeamLeader && reg.teamCode) {
        teamLeaders[reg.teamCode] = reg.participantName;
      }
    });

    const getTeamCode = (reg) => reg.participationType === 'group' ? (reg.isTeamLeader ? reg.teamCode : reg.joinedTeamCode) : null;
    
    const sortedRegistrations = [...registrations].sort((a, b) => {
      const teamA = getTeamCode(a);
      const teamB = getTeamCode(b);
      if (!teamA && !teamB) return 0;
      if (!teamA) return 1;
      if (!teamB) return -1;
      if (teamA !== teamB) return teamA.localeCompare(teamB);
      if (a.isTeamLeader) return -1;
      if (b.isTeamLeader) return 1;
      return 0;
    });

    const tableColumn = ["Participant", "Email", "Phone", "Type", "Team Code", "Leader Name", "Payment", "Attendance", "Date"];
    const tableRows = [];

    sortedRegistrations.forEach(reg => {
      const tCode = getTeamCode(reg);
      const regData = [
        reg.participantName + (reg.isTeamLeader ? ' (Leader)' : ''),
        reg.email,
        reg.phone,
        reg.participationType || 'individual',
        tCode || '-',
        tCode ? (teamLeaders[tCode] || 'Unknown') : '-',
        reg.paymentStatus || 'N/A',
        reg.status === 'attended' ? 'Present' : 'Pending',
        new Date(reg.createdAt).toLocaleDateString()
      ];
      tableRows.push(regData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] } // indigo-600
    });

    doc.save(`${event?.title?.replace(/\s+/g, '_')}_Registrations.pdf`);
    toast.success('PDF downloaded successfully!');
  };

  const totalPages = Math.ceil(registrations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRegistrations = registrations.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className={`min-h-screen bg-gray-50 flex pt-20 transition-all duration-300 ${isOpen ? 'pl-64' : 'pl-[72px]'}`}>
      <Navbar />
      <Sidebar />
      <main className="flex-1 w-full p-6 lg:p-8 overflow-y-auto animate-fade-in-up">
        
        <button 
          onClick={() => navigate('/hosted-events')}
          className="flex items-center gap-2 text-indigo-600 font-bold mb-6 hover:text-indigo-800 transition-colors"
        >
          <ArrowLeft size={20} /> Back to My Events
        </button>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-indigo-600">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="font-bold text-xl">Loading registrations...</p>
          </div>
        ) : !event ? (
          <div className="text-center py-32 text-red-500 font-bold text-xl">Event not found</div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
              <div>
                <h1 className="text-3xl font-black tracking-tight mb-2">Registrations</h1>
                <p className="text-blue-100 font-medium text-lg">{event.title}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowScanner(true)}
                  className="bg-green-500 text-white hover:bg-green-600 px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm border border-green-400"
                >
                  <ScanLine size={20} /> Scan Passes
                </button>
                <button 
                  onClick={handleExportCSV}
                  disabled={registrations.length === 0}
                  className="bg-white text-indigo-700 px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={20} /> Export Excel
                </button>
                <button 
                  onClick={handleExportPDF}
                  disabled={registrations.length === 0}
                  className="bg-indigo-800 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-900 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-500"
                >
                  <Download size={20} /> Export PDF
                </button>
                <div className="bg-white/20 px-5 py-3 rounded-xl font-bold flex items-center gap-2 text-lg">
                  <Users size={20} />
                  {registrations.length} / {event.capacity}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-8 bg-gray-50">
              {registrations.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="text-gray-400" size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">No Registrations Yet</h3>
                  <p className="text-gray-500 text-lg">When users register for your event, they will appear here.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-100 text-gray-700 text-sm uppercase font-bold">
                        <tr>
                          <th className="px-6 py-5">Participant</th>
                          <th className="px-6 py-5">Contact</th>
                          <th className="px-6 py-5">College</th>
                          <th className="px-6 py-5">Type</th>
                          <th className="px-6 py-5">Payment</th>
                          <th className="px-6 py-5">Attendance</th>
                          <th className="px-6 py-5">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {currentRegistrations.map((reg) => (
                          <tr key={reg._id} className="hover:bg-indigo-50/50 transition-colors group border-b border-gray-50 last:border-0">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                                  {reg.participantName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900 text-sm">{reg.participantName}</div>
                                  <div className="text-xs text-gray-500">{reg.userId?.email || 'N/A'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-700 text-sm truncate max-w-[150px]" title={reg.email}>{reg.email}</div>
                              <div className="text-xs text-gray-500">{reg.phone}</div>
                            </td>
                            <td className="px-6 py-4 text-gray-600 font-medium text-sm truncate max-w-[120px]" title={reg.college || '-'}>
                              {reg.college || '-'}
                            </td>
                            <td className="px-6 py-4">
                              {reg.participationType === 'group' ? (
                                (() => {
                                  const targetCode = reg.isTeamLeader ? reg.teamCode : reg.joinedTeamCode;
                                  const teamMembers = registrations.filter(r => (r.isTeamLeader ? r.teamCode : r.joinedTeamCode) === targetCode);
                                  return (
                                    <div className="flex flex-col gap-2 min-w-[200px]">
                                      <div className="flex items-center gap-2">
                                        <span className="inline-block bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0">Team</span>
                                        {reg.isTeamLeader ? (
                                          <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-bold uppercase truncate">L: {reg.teamCode}</span>
                                        ) : (
                                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold uppercase truncate">J: {reg.joinedTeamCode}</span>
                                        )}
                                      </div>
                                      
                                      <div className="flex flex-wrap gap-1.5">
                                        {teamMembers.map(member => (
                                          <div 
                                            key={member._id}
                                            title={member.participantName}
                                            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] border ${
                                              member.isTeamLeader 
                                                ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
                                                : 'bg-white border-gray-200 text-gray-600'
                                            } ${member._id === reg._id ? 'ring-1 ring-indigo-400 font-bold shadow-sm' : 'font-medium'}`}
                                          >
                                            {member.isTeamLeader && <Crown size={10} className="text-yellow-500 shrink-0" />}
                                            <span className="truncate max-w-[80px]">{member.participantName.split(' ')[0]}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })()
                              ) : (
                                <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0">Individual</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                                reg.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {reg.paymentStatus === 'paid' ? <CheckCircle2 size={14}/> : null}
                                {reg.paymentStatus.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {reg.status === 'attended' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                  <UserCheck size={14}/> PRESENT
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                                  PENDING
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-gray-500 font-medium text-xs whitespace-nowrap">
                              {new Date(reg.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="bg-gray-50 border-t border-gray-100 p-5 flex items-center justify-between">
                      <p className="text-gray-500 font-medium">
                        Showing <span className="font-bold text-gray-900">{startIndex + 1}</span> to <span className="font-bold text-gray-900">{Math.min(startIndex + itemsPerPage, registrations.length)}</span> of <span className="font-bold text-gray-900">{registrations.length}</span> entries
                      </p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        
                        <div className="flex items-center gap-1.5">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-colors ${
                                currentPage === page 
                                  ? 'bg-indigo-600 text-white shadow-md' 
                                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-indigo-600'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>

                        <button 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        <QRScannerModal 
          isOpen={showScanner} 
          onClose={() => setShowScanner(false)} 
          onScan={(decodedText) => {
            if (socket) socket.emit('mark_attendance', { registrationId: decodedText, eventId: id });
          }}
        />
      </main>

      <GeneratePassModal 
        isOpen={!!selectedPassUser}
        onClose={() => setSelectedPassUser(null)}
        userReg={selectedPassUser}
        event={event}
      />
    </div>
  );
}
