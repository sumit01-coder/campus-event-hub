import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, Users, QrCode, Shield, Zap, TrendingUp, Search, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Features() {
  const features = [
    {
      icon: <Calendar className="text-indigo-600" size={32} />,
      title: 'Effortless Event Hosting',
      description: 'Create and publish events in minutes. Set capacities, pricing, deadlines, and group sizes with an intuitive dashboard designed for organizers.',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100'
    },
    {
      icon: <Users className="text-blue-600" size={32} />,
      title: 'Dynamic Team Registration',
      description: 'Register as an individual or bring your whole squad. Leaders can secure spots for their entire team with a single payment and share unique invite codes.',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100'
    },
    {
      icon: <QrCode className="text-purple-600" size={32} />,
      title: 'Instant QR Code Passes',
      description: 'No more paper tickets. Get instant access to your personalized digital pass with a scannable QR code right on your mobile device.',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100'
    },
    {
      icon: <Shield className="text-emerald-600" size={32} />,
      title: 'Secure & Verified Ecosystem',
      description: 'Verified organizers ensure authentic events. Our robust backend handles secure ticketing and strictly enforces capacity limits to prevent overcrowding.',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100'
    },
    {
      icon: <TrendingUp className="text-orange-600" size={32} />,
      title: 'Real-Time Analytics',
      description: 'Organizers get access to real-time dashboards tracking registrations, popular trends, and attendance metrics to optimize future events.',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100'
    },
    {
      icon: <Search className="text-pink-600" size={32} />,
      title: 'Smart Discovery',
      description: 'Easily find the best campus activities. Filter by categories like Technology, Music, or Sports, and discover what’s trending right now.',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-40">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-20 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm tracking-wide mb-4 border border-indigo-200 shadow-sm">
            Everything You Need
          </span>
          <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight mb-6">
            Powerful Features for a <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Vibrant Campus Life
            </span>
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto font-medium">
            Whether you're hosting a 500-person tech symposium or joining a weekend hackathon with your team, CampusEventHub gives you the tools to make it extraordinary.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="px-8 py-4 text-lg font-bold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5">
              Get Started for Free
            </Link>
            <Link to="/dashboard" className="px-8 py-4 text-lg font-bold rounded-full text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm transition-all hover:-translate-y-0.5">
              Explore Events
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border ${feature.bgColor} ${feature.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Highlight Section */}
        <div className="mt-24 mb-10 bg-gray-900 rounded-[32px] p-8 md:p-16 overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full filter blur-[100px] opacity-40"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                Stop managing spreadsheets. <br/> Start creating experiences.
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-lg">
                Join thousands of students and organizers who use CampusEventHub to streamline ticketing, maximize attendance, and build community.
              </p>
              <ul className="space-y-4 mb-8">
                {['Zero hidden fees for organizers', 'Instant payouts for ticket sales', '24/7 dedicated support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white font-medium">
                    <div className="bg-indigo-500/20 p-1 rounded-full flex-shrink-0">
                      <Zap className="text-indigo-400" size={16} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-full text-gray-900 bg-white hover:bg-gray-100 transition-all shadow-lg hover:-translate-y-0.5">
                Join CampusEventHub
              </Link>
            </div>
            
            <div className="lg:w-1/2 w-full">
              {/* Mockup / Abstract illustration */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl transform lg:rotate-3 hover:rotate-0 transition-all duration-500">
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-inner">
                      <QrCode className="text-white" size={28} />
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg">TechFest 2026 Pass</div>
                      <div className="text-indigo-300 text-sm font-medium">Admit One • General Access</div>
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">Valid</span>
                </div>
                <div className="space-y-4">
                  <div className="h-3 bg-white/20 rounded-full w-3/4"></div>
                  <div className="h-3 bg-white/20 rounded-full w-1/2"></div>
                  <div className="h-3 bg-white/10 rounded-full w-5/6 mt-8"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}