import React, { useState, useContext } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, Clock, XCircle, Send, Image as ImageIcon, Calendar as CalendarIcon, MapPin, Tag, Users, DollarSign, Loader2, Upload, Bold, Italic, Underline, List, ListOrdered, Link2, LayoutList, ChevronRight, ChevronDown, CheckCircle, Info, PenTool, Eye, Edit3, ArrowRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { SidebarContext } from '../context/SidebarContext';

export default function HostEvent() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { isOpen } = useContext(SidebarContext);
  
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(today - offset)).toISOString().slice(0, 16); 
  const todayDateString = localISOTime.split('T')[0];
  const currentTimeString = localISOTime.split('T')[1];
  const currentDateTimeString = localISOTime;

  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [deadlineError, setDeadlineError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    image: '',
    category: '',
    price: '',
    capacity: '',
    registrationDeadline: '',
    participationType: 'individual',
    maxGroupSize: 1,
    isHackathon: false
  });

  // Verification Checks
  const isOrganizer = user?.capabilities?.organizer;
  const verifyStatus = user?.organizerProfile?.verificationStatus;

  // Not an organizer
  if (!isOrganizer) {
    return (
      <div className={`min-h-screen bg-[#F5F5F7] pt-20 transition-all duration-300 pl-0 ${isOpen ? 'md:pl-64' : 'md:pl-[72px]'}`}>
        <Navbar />
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 p-8 flex flex-col overflow-y-auto">
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-white p-16 rounded-[24px] text-center max-w-lg shadow-[0_4px_6px_rgba(0,0,0,0.02)] border border-gray-100">
                <ShieldAlert className="w-16 h-16 text-orange-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-textPrimary mb-3 tracking-tight">Organizer Access Required</h2>
                <p className="text-textSecondary mb-8 leading-relaxed">You need to upgrade your account to "Host Events" before you can publish events to the platform.</p>
                <button onClick={() => navigate('/profile?edit=true')} className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm">
                  Upgrade Account
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Pending Verification
  if (verifyStatus === 'pending') {
    return (
      <div className={`min-h-screen bg-[#F5F5F7] pt-20 transition-all duration-300 pl-0 ${isOpen ? 'md:pl-64' : 'md:pl-[72px]'}`}>
        <Navbar />
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 p-8 flex flex-col overflow-y-auto">
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-white p-16 rounded-[24px] text-center max-w-lg shadow-[0_4px_6px_rgba(0,0,0,0.02)] border border-gray-100">
                <Clock className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-textPrimary mb-3 tracking-tight">Application Pending</h2>
                <p className="text-textSecondary leading-relaxed">Your request to become an organizer is currently under review by our moderation team. You will be able to host events once approved.</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Rejected Verification
  if (verifyStatus === 'rejected') {
    return (
      <div className={`min-h-screen bg-[#F5F5F7] pt-20 transition-all duration-300 pl-0 ${isOpen ? 'md:pl-64' : 'md:pl-[72px]'}`}>
        <Navbar />
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 p-8 flex flex-col overflow-y-auto">
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-white p-16 rounded-[24px] text-center max-w-lg shadow-[0_4px_6px_rgba(0,0,0,0.02)] border border-gray-100">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-textPrimary mb-3 tracking-tight">Application Declined</h2>
                <p className="text-textSecondary mb-8 leading-relaxed">Unfortunately, your request to host events has been declined by the administration.</p>
                <button onClick={() => navigate('/support')} className="bg-white border border-gray-200 text-textPrimary px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm">
                  Contact Support
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // --- Verified Organizer Flow ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      if (name === 'date' || name === 'time' || name === 'registrationDeadline') {
        validateDates(newData.date, newData.time, newData.registrationDeadline);
      }
      return newData;
    });
  };

  const validateDates = (date, time, deadline) => {
    let isValid = true;
    setDateError('');
    setTimeError('');
    setDeadlineError('');

    if (date && date < todayDateString) {
      setDateError('Event date cannot be in the past');
      isValid = false;
    }

    if (date === todayDateString && time && time < currentTimeString) {
      setTimeError('Event time cannot be in the past');
      isValid = false;
    }

    if (deadline && deadline < currentDateTimeString) {
      setDeadlineError('Deadline cannot be in the past');
      isValid = false;
    }

    if (date && time && deadline) {
      const eventDateTime = `${date}T${time}`;
      if (deadline >= eventDateTime) {
        setDeadlineError('Deadline must be before the event starts');
        isValid = false;
      }
    }
    return isValid;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    setIsUploading(true);
    try {
      // Create a specific config for multipart/form-data
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      // Important: Use the full api path or a new axios instance if api config overrides Content-Type
      const { data } = await api.post('/upload', uploadData, config);
      
      // Update form data with the new URL (prepend backend URL if needed, but relative should work if proxy handles it)
      // Actually we will use the full backend URL in case images break, or just relative
      setFormData({ ...formData, image: `http://localhost:5000${data.imageUrl}` });
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateDates(formData.date, formData.time, formData.registrationDeadline)) {
      toast.error('Please fix the date/time errors before publishing.');
      return;
    }
    setIsSubmitting(true);
    
    try {
      await api.post('/events', formData);
      toast.success('Event published successfully!');
      navigate('/dashboard'); // or /my-events
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 flex pt-20 transition-all duration-300 pl-0 ${isOpen ? 'md:pl-64' : 'md:pl-[72px]'}`}>
      <Navbar />
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        
        <main className="flex-1 p-6 overflow-y-auto flex gap-6 max-w-[1600px] mx-auto w-full">
          
          {/* Main Form Column */}
          <div className="flex-1 max-w-4xl">
            {/* Header with Stepper */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white text-[#2563EB] rounded-2xl flex items-center justify-center border border-blue-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                  <CalendarIcon size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Host an Event</h1>
                  <p className="text-sm text-gray-500">Fill in the details below to create your event.</p>
                </div>
              </div>
              
              {/* Stepper */}
              <div className="hidden md:flex items-center mt-4 sm:mt-0 relative w-[360px] justify-between">
                {/* Connecting Line */}
                <div className="absolute top-[14px] left-10 right-10 h-[1px] bg-gray-200 z-0"></div>
                
                {/* Step 1 */}
                <div className="flex flex-col items-center relative z-10 w-24">
                  <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[11px] font-bold mb-2 shadow-sm ring-8 ring-[#F5F6FA]">1</div>
                  <span className="text-[11px] font-bold text-[#2563EB] bg-[#F5F6FA] px-1">Event Details</span>
                </div>
                
                {/* Step 2 */}
                <div className="flex flex-col items-center relative z-10 w-24">
                  <div className="w-7 h-7 flex items-center justify-center text-[11px] font-bold text-gray-400 mb-2 bg-[#F5F6FA] ring-8 ring-[#F5F6FA]">2</div>
                  <span className="text-[11px] font-bold text-gray-400 bg-[#F5F6FA] px-1">Additional Info</span>
                </div>
                
                {/* Step 3 */}
                <div className="flex flex-col items-center relative z-10 w-24">
                  <div className="w-7 h-7 flex items-center justify-center text-[11px] font-bold text-gray-400 mb-2 bg-[#F5F6FA] ring-8 ring-[#F5F6FA]">3</div>
                  <span className="text-[11px] font-bold text-gray-400 bg-[#F5F6FA] px-1 whitespace-nowrap">Review & Publish</span>
                </div>
              </div>
            </div>

            {/* Verified Organizer Banner */}
            {verifyStatus === 'verified' && (
              <div className="mb-8 bg-green-50 border border-green-200 rounded-[20px] p-5 flex items-start gap-4">
                <div className="p-2 bg-green-100 text-green-600 rounded-full flex-shrink-0">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <h3 className="text-green-800 font-bold mb-1">Verified Organizer Status Active</h3>
                  <p className="text-green-700 text-sm">Your organizer account has been verified by the administration. Events you publish will be highlighted with a verified badge to attendees.</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-[16px] border border-gray-100 p-8 shadow-[0_2px_10px_rgb(0,0,0,0.02)] space-y-10">
              
              {/* Section 1: Basic Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <LayoutList className="text-primary" size={18} />
                  <h3 className="font-bold text-gray-900">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Event Title <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="title" 
                      value={formData.title} 
                      onChange={handleChange} 
                      required 
                      className="w-full bg-white border border-gray-200 py-2.5 px-3 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all" 
                      placeholder="e.g. Annual Tech Symposium 2026"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={16} />
                      <select 
                        name="category" 
                        value={formData.category} 
                        onChange={handleChange} 
                        required
                        className="w-full pl-9 pr-10 bg-white border border-gray-200 py-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm appearance-none cursor-pointer relative z-0 transition-shadow hover:border-gray-300"
                      >
                        <option value="" disabled>Select a category</option>
                        <option value="technology">Technology</option>
                        <option value="music">Music & Arts</option>
                        <option value="business">Business & Networking</option>
                        <option value="sports">Sports</option>
                        <option value="workshop">Workshop / Seminar</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Date <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="date" 
                        name="date" 
                        value={formData.date} 
                        onChange={handleChange} 
                        min={todayDateString}
                        required 
                        className={`w-full pl-3 pr-9 bg-white border ${dateError ? 'border-red-500' : 'border-gray-200'} py-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-gray-500`} 
                      />
                    </div>
                    {dateError && <p className="text-xs text-red-500 mt-1">{dateError}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Time (IST) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="time" 
                        name="time" 
                        value={formData.time} 
                        onChange={handleChange} 
                        required 
                        className={`w-full pl-3 pr-9 bg-white border ${timeError ? 'border-red-500' : 'border-gray-200'} py-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-gray-500`} 
                      />
                    </div>
                    {timeError && <p className="text-xs text-red-500 mt-1">{timeError}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Venue <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="text" 
                        name="venue" 
                        value={formData.venue} 
                        onChange={handleChange} 
                        required 
                        placeholder="e.g. Main Auditorium"
                        className="w-full pl-9 pr-3 bg-white border border-gray-200 py-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Section 2: Event Image */}
              <div className="space-y-4">
                <div className="flex flex-col mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <ImageIcon className="text-primary" size={18} />
                    <h3 className="font-bold text-gray-900">Event Image</h3>
                  </div>
                  <p className="text-xs text-gray-500">Upload an attractive image that represents your event.</p>
                </div>
                
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50 transition-colors relative">
                  <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center mb-4 border border-gray-100 text-primary">
                    <ImageIcon size={24} />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Drag & drop an image here</p>
                  <p className="text-xs text-gray-400 mb-4">or</p>
                  
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploading}
                    />
                    <button type="button" className="bg-white border border-gray-200 text-primary font-bold text-xs px-4 py-2 rounded-md hover:bg-gray-50 flex items-center gap-2">
                      {isUploading ? <><Loader2 size={14} className="animate-spin"/> Uploading...</> : <><Upload size={14} /> Upload Image</>}
                    </button>
                  </div>
                  
                  <p className="text-[10px] text-gray-400 mt-4">Recommended: 1200 x 628px (JPG, PNG) • Max size: 5MB</p>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Section 3: Participation & Tickets */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="text-primary" size={18} />
                  <h3 className="font-bold text-gray-900">Participation & Tickets</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Participation Type <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={16} />
                      <select 
                        name="participationType" 
                        value={formData.participationType} 
                        onChange={handleChange} 
                        className="w-full pl-9 pr-10 bg-white border border-gray-200 py-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm appearance-none cursor-pointer text-gray-700 relative z-0 transition-shadow hover:border-gray-300" 
                      >
                        <option value="individual">Individual</option>
                        <option value="group">Group</option>
                        <option value="both">Both</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Max Capacity <span className="text-red-500">*</span></label>
                    <div className="relative mb-1">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="number" 
                        name="capacity" 
                        value={formData.capacity} 
                        onChange={handleChange} 
                        required 
                        min="1"
                        placeholder="e.g. 500"
                        className="w-full pl-9 pr-3 bg-white border border-gray-200 py-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" 
                      />
                    </div>
                    <p className="text-[10px] text-gray-500">Total registration capacity for the entire event</p>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Ticket Price (₹)</label>
                    <div className="relative mb-1">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="number" 
                        name="price" 
                        value={formData.price} 
                        onChange={handleChange} 
                        min="0"
                        step="0.01"
                        placeholder="e.g. 150.00"
                        className="w-full pl-9 pr-3 bg-white border border-gray-200 py-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" 
                      />
                    </div>
                    <p className="text-[10px] text-gray-500">Leave 0 for Free events</p>
                  </div>
                  
                  {(formData.participationType === 'group' || formData.participationType === 'both') && (
                    <div className="md:col-span-1">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Max Members per Group <span className="text-red-500">*</span></label>
                      <div className="relative mb-1">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                          type="number" 
                          name="maxGroupSize" 
                          value={formData.maxGroupSize} 
                          onChange={handleChange} 
                          required 
                          min="2"
                          placeholder="e.g. 5"
                          className="w-full pl-9 pr-3 bg-white border border-gray-200 py-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" 
                        />
                      </div>
                      <p className="text-[10px] text-gray-500">Maximum team size allowed</p>
                    </div>
                  )}
                  
                  <div className={formData.participationType === 'group' || formData.participationType === 'both' ? 'md:col-span-4 lg:col-span-1' : ''}>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Registration Deadline <span className="text-red-500">*</span></label>
                    <div className="relative mb-1">
                      <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="datetime-local" 
                        name="registrationDeadline" 
                        value={formData.registrationDeadline} 
                        onChange={handleChange} 
                        min={currentDateTimeString}
                        max={formData.date && formData.time ? `${formData.date}T${formData.time}` : undefined}
                        required
                        className={`w-full pl-3 pr-9 bg-white border ${deadlineError ? 'border-red-500' : 'border-gray-200'} py-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-gray-500`} 
                      />
                    </div>
                    {deadlineError ? (
                      <p className="text-xs text-red-500">{deadlineError}</p>
                    ) : (
                      <p className="text-[10px] text-gray-500">Last date to register</p>
                    )}
                  </div>
                </div>

                {/* Hackathon Toggle */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl border border-purple-100 flex items-start gap-4 mt-6">
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      id="isHackathon"
                      name="isHackathon"
                      checked={formData.isHackathon}
                      onChange={(e) => setFormData(prev => ({ ...prev, isHackathon: e.target.checked }))}
                      className="w-5 h-5 text-purple-600 rounded border-purple-300 focus:ring-purple-500 mt-1"
                    />
                  </div>
                  <div>
                    <label htmlFor="isHackathon" className="block text-sm font-bold text-purple-900 cursor-pointer">
                      This is a Hackathon / Project-based Event
                    </label>
                    <p className="text-xs text-purple-700 mt-1 leading-relaxed">
                      Enabling this allows you to define Problem Statements, collect preferences from teams, assign problems, and receive GitHub/Demo links through the platform.
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Section 4: About the Event */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="text-primary" size={18} />
                  <h3 className="font-bold text-gray-900">About the Event</h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Event Description <span className="text-red-500">*</span></label>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                    {/* Mocked Rich Text Toolbar */}
                    <div className="bg-gray-50 border-b border-gray-200 py-2 px-3 flex items-center gap-4 text-gray-500">
                      <div className="flex items-center gap-2">
                        <button type="button" className="hover:text-gray-900 hover:bg-gray-200 p-1 rounded"><Bold size={16} /></button>
                        <button type="button" className="hover:text-gray-900 hover:bg-gray-200 p-1 rounded"><Italic size={16} /></button>
                        <button type="button" className="hover:text-gray-900 hover:bg-gray-200 p-1 rounded"><Underline size={16} /></button>
                      </div>
                      <div className="w-[1px] h-4 bg-gray-300"></div>
                      <div className="flex items-center gap-2">
                        <button type="button" className="hover:text-gray-900 hover:bg-gray-200 p-1 rounded"><List size={16} /></button>
                        <button type="button" className="hover:text-gray-900 hover:bg-gray-200 p-1 rounded"><ListOrdered size={16} /></button>
                      </div>
                      <div className="w-[1px] h-4 bg-gray-300"></div>
                      <div className="flex items-center gap-2">
                        <button type="button" className="hover:text-gray-900 hover:bg-gray-200 p-1 rounded"><Link2 size={16} /></button>
                        <button type="button" className="hover:text-gray-900 hover:bg-gray-200 p-1 rounded"><ImageIcon size={16} /></button>
                      </div>
                    </div>
                    
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleChange} 
                      required 
                      rows="6"
                      placeholder="Describe your event, agenda, highlights, and what participants can expect..."
                      className="w-full bg-white py-3 px-4 focus:outline-none text-sm resize-none" 
                    ></textarea>
                    
                    <div className="bg-white border-t border-gray-100 py-2 px-4 flex justify-end">
                      <span className="text-[10px] text-gray-400">0/2000</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button type="button" onClick={() => navigate('/dashboard')} className="px-6 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-primary text-white px-6 py-2.5 text-sm rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-70"
                >
                  {isSubmitting ? <><Loader2 className="animate-spin" size={16} /> Publishing...</> : <>Next: Additional Info <ArrowRight size={16} /></>}
                </button>
              </div>

            </form>
          </div>

          {/* Right Sidebar Column */}
          <div className="hidden lg:flex flex-col w-80 space-y-6">
            
            {/* Event Preview Widget */}
            <div className="bg-white rounded-[16px] border border-gray-100 p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="text-gray-700" size={18} />
                <h3 className="font-bold text-gray-900 text-sm">Event Preview</h3>
              </div>
              
              <div className="w-full h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                {formData.image ? (
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <CalendarIcon className="text-white/50" size={32} />
                )}
              </div>
              
              <h4 className="font-bold text-gray-900 text-lg mb-2">{formData.title || 'Event Title'}</h4>
              <div className="inline-block bg-blue-50 text-primary text-xs font-bold px-2.5 py-1 rounded-md mb-4 capitalize">
                {formData.category || 'Category'}
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CalendarIcon size={16} className="text-gray-400" />
                  <span>{formData.date ? `${formData.date} & ${formData.time}` : 'Date & Time'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="truncate">{formData.venue || 'Venue'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Users size={16} className="text-gray-400" />
                  <span>{formData.capacity ? `${formData.capacity} Capacity` : '0 / Capacity'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Tag size={16} className="text-gray-400" />
                  <span>{formData.price && formData.price > 0 ? `₹${formData.price}` : '₹0 - Free Event'}</span>
                </div>
              </div>
              
              <button type="button" className="w-full py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg flex justify-center items-center gap-2 hover:bg-blue-700 transition-colors">
                View Full Preview <ExternalLink size={14} />
              </button>
            </div>
            
            {/* Tips Widget */}
            <div className="bg-white rounded-[16px] border border-gray-100 p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
              <div className="flex items-center gap-2 mb-6">
                <PenTool className="text-gray-700" size={18} />
                <h3 className="font-bold text-gray-900 text-sm">Tips for a Great Event</h3>
              </div>
              
              <div className="space-y-5">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    <Edit3 size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-0.5">Choose a catchy title</h4>
                    <p className="text-[10px] text-gray-500 leading-tight">A great title grabs attention!</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center shrink-0">
                    <ImageIcon size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-0.5">Use a high-quality image</h4>
                    <p className="text-[10px] text-gray-500 leading-tight">Images increase engagement.</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0">
                    <CheckCircle size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-0.5">Provide clear details</h4>
                    <p className="text-[10px] text-gray-500 leading-tight">Help attendees know what to expect.</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                    <CalendarIcon size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-0.5">Promote early</h4>
                    <p className="text-[10px] text-gray-500 leading-tight">Give people time to register.</p>
                  </div>
                </div>
              </div>
              
              <a href="#" className="inline-flex items-center gap-1 text-xs font-bold text-primary mt-6 hover:underline">
                View guidelines <ArrowRight size={12} />
              </a>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}