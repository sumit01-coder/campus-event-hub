const fs = require('fs');
const pages = [
  { name: 'MyEvents', title: 'My Events', desc: 'Events you have registered for.' },
  { name: 'Profile', title: 'My Profile', desc: 'Manage your personal and academic details.' },
  { name: 'Settings', title: 'Account Settings', desc: 'Manage your preferences and security.' },
  { name: 'HostEvent', title: 'Host an Event', desc: 'Create and publish a new event.' },
  { name: 'HostedEvents', title: 'My Hosted Events', desc: 'Manage events you have created.' }
];

pages.forEach(p => {
  const content = `import React from 'react';
import Sidebar from '../components/Sidebar';
import { Sparkles } from 'lucide-react';

export default function ${p.name}() {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto animate-fade-in-up">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-textPrimary mb-3 tracking-tight">${p.title}</h1>
          <p className="text-lg text-textSecondary">${p.desc}</p>
        </header>
        
        <div className="glass-panel p-16 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-inner relative z-10">
            <Sparkles className="text-primary" size={48} />
          </div>
          <h3 className="text-3xl font-extrabold text-textPrimary mb-4 relative z-10">Coming Soon</h3>
          <p className="text-lg text-textSecondary max-w-md mx-auto relative z-10 leading-relaxed">
            We're putting the finishing touches on this section. It will be available in the next major update!
          </p>
        </div>
      </main>
    </div>
  );
}`;
  fs.writeFileSync('frontend/src/pages/' + p.name + '.jsx', content);
});
console.log('Created 5 sidebar pages successfully!');
