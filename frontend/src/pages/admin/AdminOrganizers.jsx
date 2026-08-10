import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';
import { Loader2, Search, Building2, CheckCircle2, XCircle, Clock, ShieldCheck, Mail, Building } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOrganizers() {
  const [organizers, setOrganizers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrganizers = async () => {
    try {
      const { data } = await api.get('/admin/organizers');
      setOrganizers(data);
    } catch (error) {
      toast.error('Failed to load organizers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const handleVerify = async (id, status) => {
    try {
      await api.put(`/admin/organizers/${id}/verify`, { status });
      toast.success(`Organizer successfully marked as ${status}`);
      fetchOrganizers(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const filteredOrganizers = organizers.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (org.organizerProfile?.organizationName && org.organizerProfile.organizationName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case 'verified':
        return <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-green-50 text-green-700 border border-green-200 shadow-sm"><CheckCircle2 size={14} className="mr-1.5" /> Verified</span>;
      case 'pending':
        return <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 shadow-sm"><Clock size={14} className="mr-1.5" /> Pending</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-700 border border-red-200 shadow-sm"><XCircle size={14} className="mr-1.5" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200 shadow-sm">Unsubmitted</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto animate-fade-in-up">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100/50">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Organizer Verifications</h1>
            <p className="text-gray-500 font-medium text-sm">Review and approve event hosting capabilities</p>
          </div>
          
          <div className="relative w-full md:w-80 shadow-sm rounded-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
            <input 
              type="text" 
              placeholder="Search organizations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 bg-gray-50/80 border-gray-200 py-3.5 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium placeholder-gray-400 shadow-inner"
            />
          </div>
        </header>

        <div className="bg-white rounded-[32px] border border-gray-100/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-indigo-500" size={40} />
            </div>
          ) : filteredOrganizers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[32px] flex items-center justify-center mb-6 shadow-inner border border-indigo-100/50">
                <Building2 className="text-indigo-400" size={48} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">No Organizers Found</h3>
              <p className="text-gray-500 font-medium max-w-sm">There are no users requesting organizer capabilities that match your current search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-5 text-xs font-extrabold text-gray-500 uppercase tracking-widest">Applicant</th>
                    <th className="px-8 py-5 text-xs font-extrabold text-gray-500 uppercase tracking-widest">Organization Details</th>
                    <th className="px-8 py-5 text-xs font-extrabold text-gray-500 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-xs font-extrabold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrganizers.map((org) => {
                    const status = org.organizerProfile?.verificationStatus || 'none';
                    return (
                      <tr key={org._id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-black text-lg shadow-inner border border-indigo-200/50 group-hover:scale-110 transition-transform">
                              {org.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900 mb-0.5">{org.name}</p>
                              <div className="flex items-center text-xs text-gray-500 font-medium">
                                <Mail size={12} className="mr-1 opacity-70" /> {org.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-black text-gray-900 mb-0.5">{org.organizerProfile?.organizationName || 'N/A'}</p>
                          <div className="flex items-center text-xs text-gray-500 capitalize font-medium">
                            <Building size={12} className="mr-1 opacity-70" /> {org.organizerProfile?.organizationType || 'Not specified'}
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          {getStatusBadge(status)}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            {status !== 'verified' && (
                              <button 
                                onClick={() => handleVerify(org._id, 'verified')}
                                className="px-4 py-2 bg-white border border-green-200 text-green-700 hover:bg-green-50 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center"
                              >
                                <CheckCircle2 size={14} className="mr-1.5" /> Approve
                              </button>
                            )}
                            {status !== 'rejected' && status !== 'none' && (
                              <button 
                                onClick={() => handleVerify(org._id, 'rejected')}
                                className="px-4 py-2 bg-white border border-red-200 text-red-700 hover:bg-red-50 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center"
                              >
                                <XCircle size={14} className="mr-1.5" /> Reject
                              </button>
                            )}
                            {status === 'verified' && (
                               <span className="px-4 py-2 bg-gray-50 border border-gray-100 text-gray-400 rounded-xl text-xs font-bold flex items-center cursor-not-allowed">
                                 <ShieldCheck size={14} className="mr-1.5" /> Verified
                               </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
