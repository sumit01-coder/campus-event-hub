import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Briefcase, MapPin, ArrowRight, Zap, Coffee, Globe2, Heart } from 'lucide-react';

export default function Careers() {
  const jobs = [
    { title: "Senior React Engineer", department: "Engineering", location: "India & Remote", type: "Full-time" },
    { title: "Product Designer", department: "Design", location: "India & Remote", type: "Full-time" },
    { title: "Campus Ambassador", department: "Marketing", location: "India & Remote", type: "Part-time" },
    { title: "Customer Success Manager", department: "Support", location: "India & Remote", type: "Full-time" }
  ];

  const perks = [
    { icon: <Globe2 size={24} />, title: "Work Anywhere", desc: "We are a remote-first company." },
    { icon: <Heart size={24} />, title: "Health Coverage", desc: "Top tier medical, dental, and vision." },
    { icon: <Zap size={24} />, title: "Fast Paced", desc: "Ship fast and see your impact immediately." },
    { icon: <Coffee size={24} />, title: "Stipends", desc: "Monthly allowance for coffee and coworking." }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 w-full pt-32 pb-24">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 text-center mb-20 relative">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm tracking-wide">
            We're Hiring
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
            Help us build the future of <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">campus experiences.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
            Join a passionate team of builders, designers, and community leaders who are changing how students connect.
          </p>
        </div>

        {/* Perks Section */}
        <div className="bg-white py-24 mb-24 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-gray-900 mb-4">Why work with us?</h2>
              <p className="text-gray-500 font-medium max-w-2xl mx-auto">We take care of our team so they can focus on doing their best work.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {perks.map((perk, index) => (
                <div key={index} className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-100/50">
                    {perk.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{perk.title}</h3>
                  <p className="text-gray-500 font-medium text-sm">{perk.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Open Positions */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Briefcase className="text-indigo-600" /> Open Positions
            </h2>
            <span className="bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-full text-sm">
              {jobs.length} Roles
            </span>
          </div>

          <div className="space-y-4">
            {jobs.map((job, index) => (
              <div key={index} className="bg-white border border-gray-200 hover:border-indigo-300 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500">
                    <span className="flex items-center gap-1.5"><Briefcase size={16} className="text-gray-400" /> {job.department}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={16} className="text-gray-400" /> {job.location}</span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">{job.type}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <button className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-indigo-600 text-gray-400 group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center bg-indigo-50 border border-indigo-100 rounded-2xl p-8">
             <h3 className="font-bold text-gray-900 mb-2">Don't see a fit?</h3>
             <p className="text-gray-600 font-medium text-sm mb-4">We are always looking for talented people to join our team.</p>
             <a href="mailto:careers@campuseventhub.com" className="text-indigo-600 font-bold hover:underline">Send us your resume</a>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
