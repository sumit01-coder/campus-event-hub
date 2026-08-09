import React from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { Sparkles } from 'lucide-react';

export default function AdminPlaceholder({ title, description }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto animate-fade-in-up">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">{title}</h1>
          <p className="text-lg text-gray-500">{description || 'This section is currently under development.'}</p>
        </header>
        
        <div className="bg-white p-16 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden border border-gray-100 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent pointer-events-none"></div>
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-inner relative z-10">
            <Sparkles className="text-primary" size={48} />
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900 mb-4 relative z-10">Coming Soon</h3>
          <p className="text-lg text-gray-500 max-w-md mx-auto relative z-10 leading-relaxed">
            We're putting the finishing touches on the {title} module. It will be available in the next major update!
          </p>
        </div>
      </main>
    </div>
  );
}
