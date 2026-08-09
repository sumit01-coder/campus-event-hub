import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Guidelines() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full pt-32 pb-24 px-4 relative">
        <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-sm border border-gray-200 p-8 md:p-16">
          <div className="mb-12 border-b border-gray-100 pb-8">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Community Guidelines</h1>
            <p className="text-lg text-gray-500 font-medium">Keep our campus communities safe and welcoming.</p>
          </div>
          
          <div className="prose prose-lg prose-indigo max-w-none text-gray-600">
            <p className="font-bold text-gray-900">CampusEventHub is built on trust, respect, and community. We want everyone to feel safe and welcome when discovering and attending events.</p>
            
            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Respect Others</h3>
            <p>Treat all members of the community with respect. We do not tolerate harassment, discrimination, hate speech, or bullying of any kind.</p>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Honest Event Listings</h3>
            <p>When hosting an event, be clear and truthful about what attendees can expect. Do not mislead users about the nature of the event, location, or associated costs.</p>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Safety First</h3>
            <p>The safety of our community is our top priority. Do not use the platform to organize or promote any activities that are illegal, dangerous, or put attendees at risk.</p>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Reporting Violations</h3>
            <p>If you see an event or a user that violates these guidelines, please report it to our team immediately. We review all reports and take appropriate action, including suspending accounts.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}