import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Users, Target, Shield, Heart } from 'lucide-react';

export default function AboutUs() {
  const values = [
    { icon: <Target size={24} />, title: "Mission Driven", description: "We believe in empowering students to build thriving campus communities." },
    { icon: <Users size={24} />, title: "Community First", description: "Everything we build is designed to bring people together." },
    { icon: <Shield size={24} />, title: "Trust & Safety", description: "Providing a secure platform for all campus activities." },
    { icon: <Heart size={24} />, title: "Student Centric", description: "Built by students, for students. We know what campus life needs." }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 w-full pt-28 pb-20">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 mb-20 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
            Connecting campuses, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">one event at a time.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto font-medium">
            CampusEventHub was founded with a simple goal: to make organizing and discovering college events completely effortless. We are redefining how student life is managed.
          </p>
        </div>

        {/* Image Grid */}
        <div className="max-w-6xl mx-auto px-4 mb-24 hidden md:block">
          <div className="grid grid-cols-3 gap-6 h-[400px]">
            <div className="col-span-2 rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80" alt="Students" className="w-full h-full object-cover opacity-80 mix-blend-overlay" />
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100 relative">
               <div className="absolute inset-0 flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80" alt="Campus" className="w-full h-full object-cover opacity-80 mix-blend-overlay" />
              </div>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-gray-900 mb-4">Our Core Values</h2>
              <p className="text-gray-500 font-medium max-w-2xl mx-auto">The principles that guide everything we do.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 group">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-500 font-medium">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* CTA */}
        <div className="max-w-4xl mx-auto px-4 mt-24 text-center">
          <div className="bg-indigo-600 rounded-3xl p-12 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <h2 className="text-3xl font-black mb-6 relative z-10">Join the movement.</h2>
            <p className="text-indigo-100 font-medium mb-8 max-w-xl mx-auto relative z-10">
              Thousands of students are already using CampusEventHub to discover their next favorite memory.
            </p>
            <button className="bg-white text-indigo-600 font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 relative z-10">
              Host Your First Event
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
