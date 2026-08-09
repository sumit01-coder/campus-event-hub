import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full pt-32 pb-24 px-4 relative">
        <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-sm border border-gray-200 p-8 md:p-16">
          <div className="mb-12 border-b border-gray-100 pb-8">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Cookie Policy</h1>
            <p className="text-lg text-gray-500 font-medium">Last updated: August 9, 2026</p>
          </div>
          
          <div className="prose prose-lg prose-indigo max-w-none text-gray-600">
            <p className="font-bold text-gray-900">This Cookie Policy explains how CampusEventHub uses cookies and similar technologies.</p>
            
            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. What are cookies?</h3>
            <p>Cookies are small text files that are stored on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site.</p>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How we use cookies</h3>
            <p>We use cookies for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li><strong>Essential Cookies:</strong> Required to enable core site functionality, such as logging in securely.</li>
              <li><strong>Analytics Cookies:</strong> To help us understand how you use our platform so we can improve it.</li>
              <li><strong>Preference Cookies:</strong> To remember your settings and preferences.</li>
            </ul>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Managing cookies</h3>
            <p>You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of this platform may become inaccessible or not function properly.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}