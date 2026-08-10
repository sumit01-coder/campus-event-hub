import React from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function AdminPlaceholder({ title, description }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto animate-fade-in-up">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">{title}</h1>
          <p className="text-lg text-gray-500 font-medium">{description || 'This section is currently under development.'}</p>
        </header>
        
        <div className="bg-white p-20 rounded-[40px] flex flex-col items-center justify-center text-center relative overflow-hidden border border-gray-100/50 shadow-[0_8px_32px_rgba(0,0,0,0.03)]">
          {/* Dynamic Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full blur-[100px] opacity-60 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100 rounded-full blur-[100px] opacity-60 pointer-events-none"></div>
          
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-indigo-100 border-4 border-indigo-50 relative z-10 group hover:scale-105 transition-transform duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
            <Sparkles className="text-indigo-500 relative z-10" size={56} strokeWidth={1.5} />
          </div>
          
          <h3 className="text-4xl font-black text-gray-900 mb-6 relative z-10 tracking-tight">Coming Soon</h3>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto relative z-10 leading-relaxed font-medium mb-10">
            We're putting the finishing touches on the <span className="text-indigo-600 font-bold">{title}</span> module. It will feature powerful new tools and beautiful data visualizations in our next major update.
          </p>
          
          <button className="relative z-10 bg-white border border-gray-200 text-gray-900 px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-all shadow-sm active:scale-95 group">
            Return to Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </main>
    </div>
  );
}
