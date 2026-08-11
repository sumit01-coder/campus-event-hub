import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SidebarContext } from '../context/SidebarContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  User, Bell, Shield, AlertTriangle, 
  Settings as SettingsIcon, Globe, 
  Smartphone, Mail, Lock, Key, Trash2, 
  CreditCard, FileText, CheckCircle, ExternalLink, Download,
  X, Building, MapPin, Briefcase
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user, logout, updateUser } = useContext(AuthContext);
  const { isOpen } = useContext(SidebarContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [upiId, setUpiId] = useState(user?.paymentConfig?.upiId || '');
  const [qrCodeUrl, setQrCodeUrl] = useState(user?.paymentConfig?.qrCode || '');
  
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password to confirm');
      return;
    }
    
    try {
      await api.delete('/users/profile', {
        data: { password: deletePassword }
      });
      toast.success('Account completely deleted');
      logout();
      navigate('/login');
    } catch (error) {
      let errorMessage = 'Failed to delete account';
      if (!error.response) {
        errorMessage = 'Network error. Please make sure the backend server is running.';
      } else if (error.response.status === 404 && typeof error.response.data === 'string' && error.response.data.includes('Cannot DELETE')) {
        errorMessage = 'Route not found. Please restart your backend server to load the new delete feature.';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    }
  };

  const [eventNotifications, setEventNotifications] = useState({
    registration: { email: true, push: true },
    reminder: { email: true, push: true },
    cancellation: { email: true, push: true },
    changes: { email: true, push: true },
    approval: { email: true, push: true },
    certificate: { email: true, push: true },
  });

  const toggleEventNotification = (type, channel) => {
    setEventNotifications(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [channel]: !prev[type][channel]
      }
    }));
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
      
      const newQrUrl = `http://localhost:5000${data.imageUrl}`;
      setQrCodeUrl(newQrUrl);
      toast.success('QR Code uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload QR Code');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSavePaymentConfig = async () => {
    try {
      if (!qrCodeUrl || !upiId) {
        toast.error('Both QR Code and UPI ID are required');
        return;
      }
      const res = await api.put('/users/profile', {
        paymentConfig: { qrCode: qrCodeUrl, upiId: upiId }
      });
      updateUser(res.data);
      toast.success('Payment settings saved successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save payment settings');
    }
  };

  const tabs = [
    { id: 'account', label: 'Account Preferences', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ];

  return (
    <div className={`min-h-screen bg-[#F8FAFC] flex pt-20 transition-all duration-300 pl-0 ${isOpen ? 'md:pl-64' : 'md:pl-[72px]'}`}>
      <Navbar />
      <Sidebar />
      <main className="flex-1 w-full p-6 lg:p-8 overflow-y-auto animate-fade-in-up">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <SettingsIcon size={32} className="text-indigo-600" />
              Settings
            </h1>
            <p className="mt-2 text-gray-500">Manage your account preferences and security settings.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Settings Navigation (Sidebar) */}
            <div className="w-full lg:w-64 shrink-0">
              <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 hide-scrollbar">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
                        isActive 
                          ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
                      }`}
                    >
                      <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-gray-400'} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Settings Content Area */}
            <div className="flex-1">
              
              {/* Account Preferences Tab */}
              {activeTab === 'account' && (
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 animate-fade-in-up">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Account Preferences</h3>
                  
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between pb-6 border-b border-gray-50">
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">Language</h4>
                        <p className="text-xs text-gray-500 mt-1">Select your preferred language for the dashboard.</p>
                      </div>
                      <select className="px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option>English (US)</option>
                        <option>Spanish</option>
                        <option>French</option>
                      </select>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between pb-6 border-b border-gray-50">
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">Timezone</h4>
                        <p className="text-xs text-gray-500 mt-1">Set your local timezone for event timings.</p>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm font-medium">
                        <Globe size={16} className="text-gray-400" />
                        <select className="bg-transparent focus:outline-none">
                          <option>Asia/Kolkata (IST)</option>
                          <option>America/New_York (EST)</option>
                          <option>Europe/London (GMT)</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button className="px-6 py-2 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 animate-fade-in-up">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Notification Settings</h3>
                  <p className="text-sm text-gray-500 mb-6">Give users granular control over event notifications.</p>
                  
                  <div className="overflow-hidden rounded-2xl border border-gray-200">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Event Notifications</th>
                          <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-32">Email</th>
                          <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-32">Push</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        
                        {[
                          { key: 'registration', label: 'Event registration' },
                          { key: 'reminder', label: 'Event reminder' },
                          { key: 'cancellation', label: 'Event cancellation' },
                          { key: 'changes', label: 'Event changes' },
                          { key: 'approval', label: 'Registration approval' },
                          { key: 'certificate', label: 'Certificate available' },
                        ].map((item) => (
                          <tr key={item.key} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 px-6 text-sm font-semibold text-gray-800">{item.label}</td>
                            <td className="py-4 px-6 text-center">
                              <button 
                                onClick={() => toggleEventNotification(item.key, 'email')}
                                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none mx-auto block ${eventNotifications[item.key].email ? 'bg-green-500' : 'bg-gray-300'}`}
                              >
                                <div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5 transition-transform ${eventNotifications[item.key].email ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                              </button>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <button 
                                onClick={() => toggleEventNotification(item.key, 'push')}
                                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none mx-auto block ${eventNotifications[item.key].push ? 'bg-green-500' : 'bg-gray-300'}`}
                              >
                                <div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5 transition-transform ${eventNotifications[item.key].push ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                              </button>
                            </td>
                          </tr>
                        ))}

                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === 'payments' && (
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 animate-fade-in-up">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Settings</h3>
                  
                  {/* Organizer Payment Onboarding (Shown only to organizers) */}
                  {user.capabilities?.organizer && (
                    <div className="mb-8 p-6 rounded-2xl border-2 border-indigo-100 bg-indigo-50/30">
                      <div className="flex flex-col gap-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-inner bg-indigo-100 text-indigo-600">
                            <CreditCard size={24} />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">Manual Payment Verification (UPI)</h4>
                            <p className="text-sm text-gray-600 mt-1">Upload your UPI QR code and enter your UPI ID to receive payments directly from students. You will need to manually verify their payment proofs.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-gray-200">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">UPI ID</label>
                            <input 
                              type="text" 
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="e.g. john@okicici"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Payment QR Code</label>
                            <div className="flex items-center gap-4">
                              {qrCodeUrl ? (
                                <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24 object-contain border border-gray-200 rounded-lg p-1 bg-white" />
                              ) : (
                                <div className="w-24 h-24 border border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                  <FileText size={24} />
                                </div>
                              )}
                              <div className="relative overflow-hidden inline-block">
                                <button className="px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-200 font-bold text-sm rounded-lg hover:bg-indigo-100 transition-colors">
                                  {isUploading ? 'Uploading...' : 'Upload Image'}
                                </button>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  disabled={isUploading}
                                  className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end mt-2">
                          <button 
                            onClick={handleSavePaymentConfig}
                            className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-sm"
                          >
                            Save Payment Details
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 animate-fade-in-up">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Lock size={16} className="text-indigo-600" /> Change Password
                      </h4>
                      <div className="grid gap-4 max-w-md">
                        <input type="password" placeholder="Current Password" className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50" />
                        <input type="password" placeholder="New Password" className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50" />
                        <input type="password" placeholder="Confirm New Password" className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50" />
                        <button className="w-max px-6 py-2 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-colors mt-2">
                          Update Password
                        </button>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                      <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl mt-0.5"><Key size={18} /></div>
                          <div>
                            <h4 className="text-sm font-bold text-indigo-900">Two-Factor Authentication</h4>
                            <p className="text-xs text-indigo-700/70 mt-1">Add an extra layer of security to your account.</p>
                          </div>
                        </div>
                        <button className="px-4 py-1.5 bg-white border border-indigo-200 text-indigo-700 font-bold text-xs rounded-lg hover:bg-indigo-50 transition-colors">
                          Enable
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Danger Zone Tab */}
              {activeTab === 'danger' && (
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-red-100 animate-fade-in-up">
                  <h3 className="text-xl font-bold text-red-600 mb-6 flex items-center gap-2">
                    <AlertTriangle size={24} /> Danger Zone
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="p-5 border border-red-100 rounded-2xl bg-red-50/30 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Deactivate Account</h4>
                        <p className="text-xs text-gray-500 mt-1">Temporarily disable your profile and events.</p>
                      </div>
                      <button className="px-5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-xl transition-colors whitespace-nowrap">
                        Deactivate
                      </button>
                    </div>

                    <div className="p-5 border border-red-200 rounded-2xl bg-red-50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-red-900">Delete Account Permanently</h4>
                        <p className="text-xs text-red-700/70 mt-1">This action cannot be undone. All data will be lost.</p>
                      </div>
                      {!isDeletingAccount ? (
                        <button onClick={() => setIsDeletingAccount(true)} className="px-5 py-2 bg-red-600 text-white hover:bg-red-700 font-bold text-xs rounded-xl transition-colors whitespace-nowrap flex items-center gap-2">
                          <Trash2 size={14} /> Delete Account
                        </button>
                      ) : (
                        <div className="w-full sm:w-auto flex flex-col gap-2">
                          <input 
                            type="password" 
                            placeholder="Enter password to confirm" 
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            className="px-3 py-2 border border-red-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500 bg-white w-full sm:w-48"
                          />
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => { setIsDeletingAccount(false); setDeletePassword(''); }} className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-lg transition-colors">
                              Cancel
                            </button>
                            <button onClick={handleDeleteAccount} className="px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 font-bold text-xs rounded-lg transition-colors">
                              Confirm
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>


    </div>
  );
}