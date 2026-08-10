import React, { useContext, useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Phone, BookOpen, Building, GraduationCap, BadgeCheck, Shield, Calendar, Edit3, CheckCircle, RefreshCw, Download, Maximize2, Sun, Smile, FileText, UserCheck, Smartphone, Clock, AlertCircle } from 'lucide-react';
import EditProfileModal from '../components/EditProfileModal';
import IdentityVerificationModal from '../components/IdentityVerificationModal';
import RequestOrganizerModal from '../components/RequestOrganizerModal';
import OtpVerificationModal from '../components/OtpVerificationModal';
import api from '../services/api';
import toast from 'react-hot-toast';
import { SidebarContext } from '../context/SidebarContext';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, sendVerificationEmail, verifyEmail } = useContext(AuthContext);
  const { isOpen } = useContext(SidebarContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [isOrganizerModalOpen, setIsOrganizerModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('edit') === 'true') {
      setIsEditModalOpen(true);
    }
  }, [location]);

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('edit') === 'true') {
      queryParams.delete('edit');
      navigate({
        pathname: location.pathname,
        search: queryParams.toString()
      }, { replace: true });
    }
  };

  const handleVerify = async () => {
    setIsSendingVerification(true);
    try {
      await sendVerificationEmail();
      setIsOtpModalOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send verification email. Please try again.');
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleVerifyOtp = async (otp) => {
    await verifyEmail(otp);
    toast.success('Email verified successfully!');
  };

  if (!user) {
    return (
      <div className={`min-h-screen bg-[#F8FAFC] flex pt-20 transition-all duration-300 pl-0 ${isOpen ? 'md:pl-64' : 'md:pl-[72px]'}`}>
        <Navbar />
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <p className="text-gray-500 font-medium">Loading profile...</p>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#F8FAFC] flex pt-20 transition-all duration-300 pl-0 ${isOpen ? 'md:pl-64' : 'md:pl-[72px]'}`}>
      <Navbar />
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto animate-fade-in-up">
        
        {/* Email Verification Banner */}
        {user && !user.isEmailVerified && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-[20px] p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                <Mail size={20} />
              </div>
              <div>
                <h3 className="text-orange-800 font-bold text-sm">Please verify your email</h3>
                <p className="text-orange-700 text-xs">Verify your email address to unlock all platform features.</p>
              </div>
            </div>
            <button 
              onClick={handleVerify}
              disabled={isSendingVerification}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-70"
            >
              {isSendingVerification ? 'Sending...' : 'Verify Email'}
            </button>
          </div>
        )}

        {/* Identity Verification Banner */}
        {user && user.identityVerification?.status !== 'verified' && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-[20px] p-4 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-blue-800 font-bold text-sm">Identity Not Verified</h3>
                <p className="text-blue-700 text-xs">Verify your identity with a live photo and ID card to unlock hosting capabilities.</p>
              </div>
            </div>
            <button 
              onClick={() => setIsIdentityModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm whitespace-nowrap"
            >
              Verify Identity
            </button>
          </div>
        )}

        {/* Organizer Application Banner */}
        {user && (!user.organizerProfile || user.organizerProfile.verificationStatus === 'none') && (
          <div className="mb-6 bg-purple-50 border border-purple-200 rounded-[20px] p-4 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-full">
                <Building size={20} />
              </div>
              <div>
                <h3 className="text-purple-800 font-bold text-sm">Become an Event Organizer</h3>
                <p className="text-purple-700 text-xs">Apply for an organizer account to host events on behalf of your institute or club.</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOrganizerModalOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm whitespace-nowrap"
            >
              Request Access
            </button>
          </div>
        )}

        {/* Organizer Pending Banner */}
        {user && user.organizerProfile?.verificationStatus === 'pending' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-[20px] p-4 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-yellow-800 font-bold text-sm">Organizer Application Pending</h3>
                <p className="text-yellow-700 text-xs">Your request is currently being verified by the administration team. You will be notified once approved.</p>
              </div>
            </div>
          </div>
        )}

        {/* Organizer Rejected Banner */}
        {user && user.organizerProfile?.verificationStatus === 'rejected' && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-[20px] p-4 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-full">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="text-red-800 font-bold text-sm">Organizer Application Rejected</h3>
                <p className="text-red-700 text-xs">Your request was not approved by the admin. You can update your details and request again.</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOrganizerModalOpen(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm whitespace-nowrap"
            >
              Re-apply
            </button>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="bg-white rounded-[32px] p-8 md:p-12 mb-8 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
          
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-1 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full rounded-full border-4 border-white bg-white flex items-center justify-center overflow-hidden">
                {user.profile?.photo ? (
                  <img src={user.profile.photo.startsWith('/') ? `http://localhost:5000${user.profile.photo}` : user.profile.photo} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-gray-300" />
                )}
              </div>
            </div>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="absolute bottom-0 right-0 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white rounded-full shadow-md border border-gray-100 text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
            >
              <Edit3 size={16} />
            </button>
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{user.name}</h1>
            <p className="text-lg text-gray-500 font-medium mb-4">{user.profile?.course || 'Student'} • {user.profile?.college || 'University'}</p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {user.capabilities?.participant && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                  <BadgeCheck size={14} /> Participant
                </span>
              )}
              {user.capabilities?.organizer && (
                <>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">
                    <Shield size={14} /> Organizer
                  </span>
                  {user.organizerProfile?.verificationStatus === 'verified' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                      <BadgeCheck size={14} /> Verified Host
                    </span>
                  )}
                </>
              )}
              {user.capabilities?.volunteer && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                  <Shield size={14} /> Volunteer
                </span>
              )}
              {user.identityVerification?.status === 'verified' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                  <BadgeCheck size={14} /> ID Verified
                </span>
              )}
              {user.isEmailVerified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-100">
                  <BadgeCheck size={14} /> Email Verified
                </span>
              )}
            </div>
          </div>
          
          <div className="hidden md:block w-px h-24 bg-gray-100 mx-4"></div>
          
          <div className="flex gap-4 md:flex-col justify-center">
             <button 
               onClick={() => setIsEditModalOpen(true)}
               className="px-6 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors"
             >
               Edit Profile
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Contact Information */}
          <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 relative">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User size={18} /></div>
              Contact Details
            </h3>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 text-gray-400"><Mail size={18} /></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-0.5">Email Address</p>
                  <p className="text-gray-900 font-semibold">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-0.5 text-gray-400"><Phone size={18} /></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-0.5">Phone Number</p>
                  <p className="text-gray-900 font-semibold">{user.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 relative">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><GraduationCap size={18} /></div>
              Academic Info
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-gray-400"><Building size={16} /></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-0.5">College</p>
                  <p className="text-gray-900 font-semibold">{user.profile?.college || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-gray-400"><BookOpen size={16} /></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-0.5">Department</p>
                  <p className="text-gray-900 font-semibold">{user.profile?.department || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-gray-400"><BadgeCheck size={16} /></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-0.5">Student ID</p>
                  <p className="text-gray-900 font-semibold">{user.profile?.studentId || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-gray-400"><Calendar size={16} /></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-0.5">Year</p>
                  <p className="text-gray-900 font-semibold">{user.profile?.year || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* New 3-Column Identity Verification Dashboard */}
        {user.identityVerification?.status === 'verified' && (
          <div className="mt-8 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-6 px-2">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  Identity Verification
                  <button 
                    onClick={() => setIsIdentityModalOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-1.5 rounded-full shadow hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <RefreshCw size={14} className="opacity-80" /> Update Verification
                  </button>
                </h3>
                <p className="text-sm text-gray-500 mt-1">Official data verified by OCR system</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LEFT COLUMN: Extracted Details & Matched Info */}
              <div className="lg:col-span-1 space-y-6">
                {/* Extracted Details Box */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                      <BookOpen size={16} /> Extracted Details
                    </h4>
                    {user.identityVerification.confidence !== undefined && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-50 text-green-600 border border-green-100 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> OCR Confidence: {user.identityVerification.confidence}%
                      </span>
                    )}
                  </div>
                  <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-4 max-h-64 overflow-y-auto">
                    <table className="w-full text-xs font-mono text-gray-600">
                      <tbody>
                        {(user.identityVerification.extractedText || "Verification complete.").split('\n').map((line, idx) => (
                          <tr key={idx}>
                            <td className="w-6 py-0.5 text-gray-400 select-none align-top">
                              {String(idx + 1).padStart(2, '0')}
                            </td>
                            <td className="py-0.5 break-all">{line}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {user.identityVerification.verifiedAt && (
                    <div className="text-[11px] text-gray-400 mt-3 flex items-center gap-1.5">
                      <Calendar size={12} /> Verified on: {new Date(user.identityVerification.verifiedAt).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Matched Information */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" /> Matched Information
                  </h4>
                  <div className="space-y-2.5">
                    {/* Full Name */}
                    <div className="flex items-center justify-between bg-green-50/50 px-3 py-2.5 rounded-lg border border-green-100/50">
                      <div className="flex items-center gap-2.5 text-green-700">
                        <UserCheck size={16} /> <span className="text-xs font-bold">Full Name Match</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-green-700">
                        <span className="text-xs font-bold uppercase">{user.identityVerification.extractedData?.name || user.name}</span>
                        <CheckCircle size={14} className="fill-green-600 text-white" />
                      </div>
                    </div>
                    
                    {/* Student ID */}
                    <div className="flex items-center justify-between bg-blue-50/50 px-3 py-2.5 rounded-lg border border-blue-100/50">
                      <div className="flex items-center gap-2.5 text-blue-700">
                        <GraduationCap size={16} /> <span className="text-xs font-bold">Student / Faculty ID</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-blue-700">
                        <span className="text-xs font-bold uppercase">{user.identityVerification.extractedData?.idNumber || 'Not Found'}</span>
                        {user.identityVerification.extractedData?.idNumber ? (
                          <CheckCircle size={14} className="fill-blue-600 text-white" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-400 flex items-center justify-center text-[8px] font-bold">i</div>
                        )}
                      </div>
                    </div>

                    {/* Mobile Number */}
                    <div className="flex items-center justify-between bg-purple-50/50 px-3 py-2.5 rounded-lg border border-purple-100/50">
                      <div className="flex items-center gap-2.5 text-purple-700">
                        <Smartphone size={16} /> <span className="text-xs font-bold">Mobile Number</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-purple-700">
                        <span className="text-xs font-bold">{user.identityVerification.extractedData?.mobile || 'Not Found'}</span>
                        {user.identityVerification.extractedData?.mobile ? (
                          <CheckCircle size={14} className="fill-purple-600 text-white" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-purple-400 flex items-center justify-center text-[8px] font-bold">i</div>
                        )}
                      </div>
                    </div>

                    {/* University */}
                    <div className="flex items-center justify-between bg-orange-50/50 px-3 py-2.5 rounded-lg border border-orange-100/50">
                      <div className="flex items-center gap-2.5 text-orange-700">
                        <Building size={16} /> <span className="text-xs font-bold">Institution / University</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-orange-700">
                        <span className="text-xs font-bold uppercase truncate max-w-[120px]">{user.identityVerification.extractedData?.university || 'Not Found'}</span>
                        {user.identityVerification.extractedData?.university ? (
                          <CheckCircle size={14} className="fill-orange-600 text-white" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-orange-400 flex items-center justify-center text-[8px] font-bold">i</div>
                        )}
                      </div>
                    </div>

                    {/* Human Liveness */}
                    <div className="flex items-center justify-between bg-green-50/50 px-3 py-2.5 rounded-lg border border-green-100/50">
                      <div className="flex items-center gap-2.5 text-green-700">
                        <Shield size={16} /> <span className="text-xs font-bold">Human Liveness</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-green-700">
                        <span className="text-xs font-bold uppercase">Passed</span>
                        <CheckCircle size={14} className="fill-green-600 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CENTER COLUMN: Live Photo */}
              <div className="lg:col-span-1 bg-gradient-to-b from-blue-50/30 to-white rounded-2xl p-5 border border-blue-50 shadow-sm flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-10">
                  <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                    <UserCheck size={16} /> Live Photo
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded text-green-600 bg-green-50">Live</span>
                </div>

                <div className="relative mb-6">
                  {/* Scanner Reticles */}
                  <div className="absolute -top-4 -left-4 w-6 h-6 border-t-2 border-l-2 border-blue-400 rounded-tl-lg"></div>
                  <div className="absolute -top-4 -right-4 w-6 h-6 border-t-2 border-r-2 border-blue-400 rounded-tr-lg"></div>
                  <div className="absolute -bottom-4 -left-4 w-6 h-6 border-b-2 border-l-2 border-blue-400 rounded-bl-lg"></div>
                  <div className="absolute -bottom-4 -right-4 w-6 h-6 border-b-2 border-r-2 border-blue-400 rounded-br-lg"></div>
                  
                  {/* Circular Photo */}
                  <div className="w-48 h-48 rounded-full border-[3px] border-blue-500 overflow-hidden relative shadow-lg">
                    {user.identityVerification.livePhoto ? (
                      <img src={user.identityVerification.livePhoto.startsWith('/') ? `http://localhost:5000${user.identityVerification.livePhoto}` : user.identityVerification.livePhoto} alt="Live Capture" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400"><User size={48} /></div>
                    )}
                    {/* Scanner overlay effect */}
                    <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay"></div>
                  </div>
                  
                  {/* Animated Scanner Ring (mocked with a dot) */}
                  <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow animate-pulse"></div>
                </div>

                <div className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 mb-10 shadow-sm border border-green-200">
                  <CheckCircle size={14} className="fill-green-600 text-white" /> Liveness: 98%
                </div>

                {/* Metrics Mock */}
                <div className="w-full bg-white rounded-xl border border-gray-100 p-1 shadow-sm">
                  <div className="flex items-center justify-between p-3 border-b border-gray-50">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600"><User size={14} className="text-blue-500" /> Quality</div>
                    <div className="text-xs font-bold text-gray-800 flex items-center gap-1.5">Good <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div></div>
                  </div>
                  <div className="flex items-center justify-between p-3 border-b border-gray-50">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600"><Sun size={14} className="text-blue-500" /> Lighting</div>
                    <div className="text-xs font-bold text-gray-800 flex items-center gap-1.5">Good <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div></div>
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600"><Smile size={14} className="text-blue-500" /> Face Match</div>
                    <div className="text-xs font-bold text-gray-800 flex items-center gap-1.5">98% <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div></div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: ID Card */}
              <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col">
                <div className="w-full flex justify-between items-center mb-6">
                  <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen size={16} /> ID Card
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded text-green-600 bg-green-50">Extracted</span>
                </div>

                <div className="bg-gray-100 rounded-xl p-3 flex-1 flex items-center justify-center relative group overflow-hidden mb-4 shadow-inner">
                  {user.identityVerification.idCardPhoto ? (
                    <img src={user.identityVerification.idCardPhoto.startsWith('/') ? `http://localhost:5000${user.identityVerification.idCardPhoto}` : user.identityVerification.idCardPhoto} alt="ID Card" className="w-full h-auto rounded-lg shadow-sm" />
                  ) : (
                    <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">N/A</div>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                     <Maximize2 className="text-white drop-shadow-md" size={32} />
                  </div>
                </div>

                <button className="w-full py-2.5 rounded-xl border-2 border-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors mb-6">
                  <Maximize2 size={14} /> View Full Size
                </button>

                <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-4">
                  <h5 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-3">Document Info</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-500">Document Type</span>
                      <span className="text-xs font-bold text-gray-800">Student ID Card</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-500">Document Quality</span>
                      <span className="text-xs font-bold text-gray-800">Good</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-500">Extracted On</span>
                      <span className="text-[10px] font-bold text-gray-800">
                        {user.identityVerification.verifiedAt ? new Date(user.identityVerification.verifiedAt).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Success Banner */}
            <div className="mt-6 bg-blue-600 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-blue-600/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Shield size={20} className="text-white" />
                </div>
                <p className="text-sm font-medium text-blue-50">
                  <strong className="text-white font-bold block sm:inline">All checks completed successfully.</strong> This identity has been verified and is trusted.
                </p>
              </div>
              <button className="w-full sm:w-auto px-5 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap">
                <Download size={14} /> Download Report (PDF)
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Edit Profile Modal */}
      <EditProfileModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} />

      {/* OTP Verification Modal */}
      <OtpVerificationModal isOpen={isOtpModalOpen} onClose={() => setIsOtpModalOpen(false)} onVerify={handleVerifyOtp} email={user.email} />

      {/* Identity Verification Modal */}
      <IdentityVerificationModal isOpen={isIdentityModalOpen} onClose={() => setIsIdentityModalOpen(false)} />

      {/* Request Organizer Modal */}
      <RequestOrganizerModal isOpen={isOrganizerModalOpen} onClose={() => setIsOrganizerModalOpen(false)} />
    </div>
  );
}