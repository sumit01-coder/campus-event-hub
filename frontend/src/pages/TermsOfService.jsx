import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full pt-32 pb-24 px-4 relative">
        <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-sm border border-gray-200 p-8 md:p-16">
          <div className="mb-12 border-b border-gray-100 pb-8">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Terms of Service</h1>
            <p className="text-lg text-gray-500 font-medium">Last updated: August 9, 2026</p>
          </div>
          
          <div className="prose prose-lg prose-indigo max-w-none text-gray-600">
            <p className="font-bold text-gray-900">Please read these Terms of Service ("Terms") carefully before using the CampusEventHub platform.</p>
            
            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h3>
            <p>By accessing or using our platform, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. User Accounts</h3>
            <p>When you create an account with us, you must provide accurate, complete, and current information at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.</p>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Content and Conduct</h3>
            <p>Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the legality, reliability, and appropriateness of that Content.</p>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>Post any illegal or unauthorized content.</li>
              <li>Harass, abuse, or harm another person.</li>
              <li>Interfere with or disrupt the Service or servers.</li>
            </ul>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Termination</h3>
            <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}