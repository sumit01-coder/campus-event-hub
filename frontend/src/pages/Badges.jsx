import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BadgeCheck, Shield, Award, Users, Mail, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { SidebarContext } from '../context/SidebarContext';

export default function Badges() {
  const { user } = useContext(AuthContext);
  const { isOpen } = useContext(SidebarContext);
  const navigate = useNavigate();
  const [participantCount, setParticipantCount] = useState(0);
  const [organizerCount, setOrganizerCount] = useState(0);

  useEffect(() => {
    if (user) {
      api.get('/registrations/my-registrations')
        .then(res => setParticipantCount(res.data.length))
        .catch(err => console.error("Failed to fetch registrations", err));
        
      api.get(`/events?organizerId=${user._id}`)
        .then(res => setOrganizerCount(res.data.length))
        .catch(err => console.error("Failed to fetch hosted events", err));
    }
  }, [user]);

  if (!user) return null;

  const hasParticipant = user.capabilities?.participant;
  const hasVolunteer = user.capabilities?.volunteer;
  const hasOrganizer = user.capabilities?.organizer;
  const hasVerifiedHost = user.capabilities?.organizer && user.organizerProfile?.verificationStatus === 'verified';
  const hasIdVerified = user.identityVerification?.status === 'verified';
  const hasEmailVerified = user.isEmailVerified;

  const badges = [
    {
      id: 'participant',
      name: participantCount > 0 ? `Participant (${participantCount})` : 'Participant',
      description: 'Earned by registering and participating in any event on the platform.',
      icon: BadgeCheck,
      earned: hasParticipant,
      gradient: 'from-blue-500 to-indigo-500',
      earnedText: 'You are an active participant!'
    },
    {
      id: 'volunteer',
      name: 'Volunteer',
      description: 'Earned by being assigned as a volunteer or student coordinator by an event host.',
      icon: Shield,
      earned: hasVolunteer,
      gradient: 'from-amber-500 to-orange-500',
      earnedText: 'You have helped coordinate events!'
    },
    {
      id: 'organizer',
      name: organizerCount > 0 ? `Organizer (${organizerCount})` : 'Organizer',
      description: 'Earned by completing the organizer onboarding process and creating your profile.',
      icon: Users,
      earned: hasOrganizer,
      gradient: 'from-purple-500 to-fuchsia-500',
      earnedText: 'You are an event organizer!'
    },
    {
      id: 'verified_host',
      name: 'Verified Host',
      description: 'Earned when your organizer profile is officially reviewed and verified by platform admins.',
      icon: BadgeCheck,
      earned: hasVerifiedHost,
      gradient: 'from-emerald-500 to-teal-500',
      earnedText: 'Your organization is verified!'
    },
    {
      id: 'id_verified',
      name: 'ID Verified',
      description: 'Earned by submitting your College ID and having your identity verified securely.',
      icon: CheckCircle2,
      earned: hasIdVerified,
      gradient: 'from-cyan-500 to-blue-500',
      earnedText: 'Your identity is verified!'
    },
    {
      id: 'email_verified',
      name: 'Email Verified',
      description: 'Earned by confirming your registered email address.',
      icon: Mail,
      earned: hasEmailVerified,
      gradient: 'from-teal-500 to-emerald-500',
      earnedText: 'Your email is verified!'
    }
  ];

  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <div className={`min-h-screen bg-[#F8FAFC] flex pt-20 transition-all duration-300 pl-0 ${isOpen ? 'md:pl-64' : 'md:pl-[72px]'}`}>
      <Navbar />
      <Sidebar />
      <main className="flex-1 w-full p-4 md:p-8 overflow-y-auto animate-fade-in-up pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Back button */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 transition-colors font-medium text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          {/* Header */}
          <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-100 to-purple-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-indigo-50">
              <Award size={32} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Your Badges</h1>
            <p className="text-gray-500 max-w-2xl mx-auto font-medium">
              Badges show your reputation and capabilities on the platform. Complete actions to unlock new badges and build your profile!
            </p>
            
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm">
              <span className="text-sm font-bold text-gray-700">Total Earned:</span>
              <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{earnedCount} / {badges.length}</span>
            </div>
          </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map(badge => {
          const Icon = badge.icon;
          return (
            <div 
              key={badge.id}
              className={`relative bg-white rounded-2xl border transition-all duration-300 overflow-hidden group flex flex-col ${
                badge.earned 
                  ? 'border-indigo-100 shadow-xl shadow-indigo-100/50 hover:-translate-y-1' 
                  : 'border-gray-200 shadow-sm opacity-80 hover:opacity-100 grayscale hover:grayscale-0'
              }`}
            >
              {/* Top Banner (Only if earned) */}
              {badge.earned && (
                <div className={`h-2 w-full bg-gradient-to-r ${badge.gradient}`}></div>
              )}
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${
                    badge.earned ? `bg-gradient-to-br ${badge.gradient} text-white` : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}>
                    <Icon size={28} strokeWidth={2} />
                  </div>
                  {badge.earned ? (
                    <div className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-indigo-100">
                      <CheckCircle2 size={14} /> Earned
                    </div>
                  ) : (
                    <div className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-gray-200">
                      <Lock size={14} /> Locked
                    </div>
                  )}
                </div>
                
                <h3 className={`text-xl font-bold mb-2 ${badge.earned ? 'text-gray-900' : 'text-gray-700'}`}>
                  {badge.name}
                </h3>
                
                <p className="text-sm text-gray-500 font-medium leading-relaxed mb-4 flex-1">
                  {badge.description}
                </p>
                
                {/* Footer text */}
                <div className={`mt-auto pt-4 border-t ${badge.earned ? 'border-indigo-50' : 'border-gray-100'}`}>
                  {badge.earned ? (
                    <p className="text-sm font-bold text-indigo-600 flex items-center gap-1.5">
                      {badge.earnedText}
                    </p>
                  ) : (
                    <p className="text-sm font-bold text-gray-400">
                      Complete requirements to unlock
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Call to action */}
      <div className="mt-12 text-center bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-3xl border border-indigo-100/50">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Want to earn more badges?</h2>
        <p className="text-gray-600 font-medium mb-6">Start by exploring new events or applying to host your own!</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/dashboard" className="px-6 py-2.5 bg-white text-indigo-600 font-bold rounded-xl shadow-sm border border-indigo-100 hover:bg-indigo-50 transition-colors">
            Explore Events
          </Link>
          {!hasOrganizer && (
            <Link to="/onboarding" className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg transition-all hover:-translate-y-0.5">
              Become an Organizer
            </Link>
          )}
        </div>
          </div>
        </div>
      </main>
    </div>
  );
}
