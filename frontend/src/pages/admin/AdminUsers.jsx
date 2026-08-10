import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';
import { Loader2, Search, Users, Shield, User as UserIcon, Mail, Phone, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/admin/users');
        setUsers(data);
      } catch (error) {
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto animate-fade-in-up">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100/50">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">User Management</h1>
            <p className="text-gray-500 font-medium text-sm">View and manage all registered accounts on the platform</p>
          </div>
          
          <div className="relative w-full md:w-80 shadow-sm rounded-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
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
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[32px] flex items-center justify-center mb-6 shadow-inner border border-indigo-100/50">
                <Users className="text-indigo-400" size={48} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">No Users Found</h3>
              <p className="text-gray-500 font-medium max-w-sm">There are no users matching your current search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-5 text-xs font-extrabold text-gray-500 uppercase tracking-widest">User</th>
                    <th className="px-8 py-5 text-xs font-extrabold text-gray-500 uppercase tracking-widest">Contact Information</th>
                    <th className="px-8 py-5 text-xs font-extrabold text-gray-500 uppercase tracking-widest">Roles & Capabilities</th>
                    <th className="px-8 py-5 text-xs font-extrabold text-gray-500 uppercase tracking-widest text-right">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-700 font-black text-lg shadow-inner border border-indigo-200/50 group-hover:scale-110 transition-transform">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 mb-0.5">{user.name}</p>
                            <div className="flex items-center text-xs text-gray-500 font-medium">
                              <GraduationCap size={12} className="mr-1 opacity-70" /> {user.profile?.college || 'No college provided'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 font-bold mb-0.5">
                          <Mail size={14} className="mr-2 text-indigo-400" /> {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center text-xs text-gray-500 font-medium">
                            <Phone size={12} className="mr-2 text-indigo-300" /> {user.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex gap-2">
                          {user.capabilities?.participant && (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
                              <UserIcon size={12} className="mr-1.5" /> Attendee
                            </span>
                          )}
                          {user.capabilities?.organizer && (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-sm">
                              <Shield size={12} className="mr-1.5" /> Organizer
                            </span>
                          )}
                          {user.capabilities?.volunteer && (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
                              <Shield size={12} className="mr-1.5" /> Volunteer
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right text-sm text-gray-500 font-bold">
                        {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
