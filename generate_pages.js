const fs = require('fs');
const pages = [
  { name: 'Pricing', title: 'Pricing Plans', desc: 'Choose the right plan for your campus.' },
  { name: 'Features', title: 'Platform Features', desc: 'Everything you need to manage events seamlessly.' },
  { name: 'HelpCenter', title: 'Help Center', desc: 'Find answers and support for CampusEventHub.' },
  { name: 'Guidelines', title: 'Community Guidelines', desc: 'Rules and best practices for our community.' },
  { name: 'ApiDocs', title: 'API Documentation', desc: 'Build with the CampusEventHub API.' },
  { name: 'Blog', title: 'CampusEventHub Blog', desc: 'Latest news, tips, and campus stories.' },
  { name: 'PrivacyPolicy', title: 'Privacy Policy', desc: 'How we protect and manage your data.' },
  { name: 'TermsOfService', title: 'Terms of Service', desc: 'The rules that govern our platform.' },
  { name: 'CookiePolicy', title: 'Cookie Policy', desc: 'How we use cookies to improve your experience.' }
];

pages.forEach(p => {
  const content = `import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ${p.name}() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-textPrimary mb-4">${p.title}</h1>
        <p className="text-lg text-textSecondary mb-12">${p.desc}</p>
        <div className="saas-card p-12">
          <p className="text-textSecondary">This page is currently under construction. Check back soon!</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}`;
  fs.writeFileSync('frontend/src/pages/' + p.name + '.jsx', content);
});
console.log('Created 9 pages successfully!');
