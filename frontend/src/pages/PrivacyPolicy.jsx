import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full pt-32 pb-24 px-4 relative">
        <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-sm border border-gray-200 p-8 md:p-16">
          <div className="mb-12 border-b border-gray-100 pb-8">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Privacy Policy</h1>
            <p className="text-lg text-gray-500 font-medium">Last updated: August 9, 2026</p>
          </div>
          
          <div className="prose prose-lg prose-indigo max-w-none text-gray-600">
            <p className="font-bold text-gray-900">At CampusEventHub, we take your privacy seriously. This policy describes what personal information we collect and how we use it.</p>
            
            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h3>
            <p>We collect information you provide directly to us when you create an account, register for an event, or communicate with us. This may include:</p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>Name and contact data (email address, phone number).</li>
              <li>University affiliation and student ID.</li>
              <li>Payment information (processed securely by our payment partners).</li>
            </ul>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h3>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>Provide, maintain, and improve our platform.</li>
              <li>Process transactions and send related information (e.g., tickets, receipts).</li>
              <li>Send technical notices, updates, security alerts, and support messages.</li>
            </ul>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Sharing of Information</h3>
            <p>We do not sell your personal information. We may share your information with event organizers (only for events you register for) and service providers acting on our behalf.</p>
            
            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@campuseventhub.com" className="text-indigo-600 font-bold hover:underline">privacy@campuseventhub.com</a>.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}