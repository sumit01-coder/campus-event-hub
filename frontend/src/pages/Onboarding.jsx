import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Building2, UserCircle, GraduationCap, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Onboarding() {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [capabilities, setCapabilities] = useState({ participant: true, organizer: false });
  const [profile, setProfile] = useState({ college: '', department: '', course: '', year: '', studentId: '' });
  const [organizerProfile, setOrganizerProfile] = useState({ organizationName: '', organizationType: 'Student Club', designation: '', description: '' });

  const handleCapabilitiesSubmit = (e) => {
    e.preventDefault();
    if (!capabilities.participant && !capabilities.organizer) {
      return toast.error('Please select at least one way you plan to use the platform');
    }
    setStep(2);
  };

  const handleProfileSubmit = async (e, skip = false) => {
    if (e) e.preventDefault();
    
    // If they aren't an organizer, we can finish onboarding here
    if (!capabilities.organizer) {
      await finishOnboarding();
    } else {
      setStep(3);
    }
  };

  const handleOrganizerSubmit = async (e) => {
    e.preventDefault();
    if (!organizerProfile.organizationName) {
      return toast.error('Organization name is required');
    }
    await finishOnboarding();
  };

  const finishOnboarding = async () => {
    setIsLoading(true);
    try {
      const payload = {
        capabilities,
        profile,
        ...(capabilities.organizer && { organizerProfile })
      };
      
      const { data } = await api.post('/users/onboarding', payload);
      
      updateUser(data);
      toast.success('Profile setup complete!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to save profile information');
    } finally {
      setIsLoading(false);
    }
  };

  // Skip Step 3 logic (since fields aren't strictly required in schema)
  const skipOrganizerStep = async () => {
    await finishOnboarding();
  };

  if (!user) return null; // Protect route

  return (
    <div className="min-h-screen bg-background bg-grid-pattern flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mb-8 flex items-center justify-between px-4">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary items-center justify-center text-white flex text-lg">C</div>
          CampusEventHub
        </h1>
        <div className="text-sm font-medium text-textSecondary bg-white px-4 py-1.5 rounded-full border border-gray-200">
          Step {step} of {capabilities.organizer ? 3 : 2}
        </div>
      </div>

      <div className="saas-card p-8 md:p-12 w-full max-w-2xl relative z-10 bg-white shadow-xl">
        
        {/* STEP 1: CAPABILITIES */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-textPrimary mb-3">Welcome, {user.name.split(' ')[0]}! 👋</h2>
              <p className="text-textSecondary text-lg">How do you plan to use CampusEventHub?</p>
            </div>

            <form onSubmit={handleCapabilitiesSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Participant Option */}
                <label className={`cursor-pointer rounded-2xl border-2 p-6 transition-all ${capabilities.participant ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                  <div className="flex items-start justify-between">
                    <UserCircle className={capabilities.participant ? 'text-primary' : 'text-gray-400'} size={32} />
                    <input type="checkbox" className="w-5 h-5 accent-primary" 
                      checked={capabilities.participant}
                      onChange={(e) => setCapabilities({...capabilities, participant: e.target.checked})}
                    />
                  </div>
                  <h3 className="font-bold text-lg mt-4 mb-2 text-textPrimary">Attend Events</h3>
                  <p className="text-textSecondary text-sm">Discover, register, and participate in campus activities and workshops.</p>
                </label>

                {/* Organizer Option */}
                <label className={`cursor-pointer rounded-2xl border-2 p-6 transition-all ${capabilities.organizer ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                  <div className="flex items-start justify-between">
                    <Building2 className={capabilities.organizer ? 'text-primary' : 'text-gray-400'} size={32} />
                    <input type="checkbox" className="w-5 h-5 accent-primary" 
                      checked={capabilities.organizer}
                      onChange={(e) => setCapabilities({...capabilities, organizer: e.target.checked})}
                    />
                  </div>
                  <h3 className="font-bold text-lg mt-4 mb-2 text-textPrimary">Host Events</h3>
                  <p className="text-textSecondary text-sm">Create events, manage registrations, and issue certificates for your organization.</p>
                </label>

              </div>
              
              <div className="pt-4">
                <button type="submit" className="btn-primary w-full py-4 text-lg flex justify-center items-center gap-2">
                  Continue <ArrowRight size={20} />
                </button>
                <p className="text-center text-sm text-textSecondary mt-4">You can change these capabilities later in your profile settings.</p>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: STUDENT PROFILE */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="text-primary" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-textPrimary">Basic Profile</h2>
              </div>
              <p className="text-textSecondary">Tell us a bit about your academic background.</p>
            </div>

            <form onSubmit={(e) => handleProfileSubmit(e, false)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-1">College / University</label>
                  <input type="text" className="saas-input" placeholder="e.g. Engineering Campus" 
                    value={profile.college} onChange={e => setProfile({...profile, college: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-1">Department</label>
                  <input type="text" className="saas-input" placeholder="e.g. Computer Science" 
                    value={profile.department} onChange={e => setProfile({...profile, department: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-1">Course / Program</label>
                  <input type="text" className="saas-input" placeholder="e.g. B.Tech" 
                    value={profile.course} onChange={e => setProfile({...profile, course: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-1">Year / Semester</label>
                  <input type="text" className="saas-input" placeholder="e.g. 3rd Year" 
                    value={profile.year} onChange={e => setProfile({...profile, year: e.target.value})} 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-textPrimary mb-1">Student ID / Roll No</label>
                  <input type="text" className="saas-input" placeholder="Your unique ID" 
                    value={profile.studentId} onChange={e => setProfile({...profile, studentId: e.target.value})} 
                  />
                </div>
              </div>
              
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => handleProfileSubmit(null, true)} className="btn-secondary flex-1 py-3">
                  Skip for Now
                </button>
                <button type="submit" disabled={isLoading} className="btn-primary flex-1 py-3 flex justify-center items-center gap-2">
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Save & Continue'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: ORGANIZER PROFILE */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Building2 className="text-accent" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-textPrimary">Hosting Onboarding</h2>
              </div>
              <p className="text-textSecondary">Tell us about the organization or club you represent.</p>
            </div>

            <form onSubmit={handleOrganizerSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-textPrimary mb-1">Organization / Club Name *</label>
                  <input type="text" className="saas-input" placeholder="e.g. Tech Innovators Club" required
                    value={organizerProfile.organizationName} onChange={e => setOrganizerProfile({...organizerProfile, organizationName: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-1">Organization Type</label>
                  <select className="saas-input" value={organizerProfile.organizationType} onChange={e => setOrganizerProfile({...organizerProfile, organizationType: e.target.value})}>
                    <option>Student Club</option>
                    <option>College Department</option>
                    <option>Student Organization</option>
                    <option>Faculty</option>
                    <option>External Organization</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-1">Your Designation / Role</label>
                  <input type="text" className="saas-input" placeholder="e.g. President, Event Lead" 
                    value={organizerProfile.designation} onChange={e => setOrganizerProfile({...organizerProfile, designation: e.target.value})} 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-textPrimary mb-1">Organization Description</label>
                  <textarea className="saas-input h-24 resize-none" placeholder="Briefly describe what your organization does..." 
                    value={organizerProfile.description} onChange={e => setOrganizerProfile({...organizerProfile, description: e.target.value})} 
                  ></textarea>
                </div>
              </div>
              
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={skipOrganizerStep} className="btn-secondary flex-1 py-3">
                  Skip for Now
                </button>
                <button type="submit" disabled={isLoading} className="btn-primary flex-1 py-3 flex justify-center items-center gap-2">
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Request Organizer Access'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
