import React, { useState } from 'react';
import { Search, Book, User, Settings, Calendar, CreditCard, HelpCircle, ChevronDown, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const categories = [
    { icon: <Book size={24} />, title: "Getting Started", description: "Learn the basics of CampusEventHub" },
    { icon: <User size={24} />, title: "Account & Profile", description: "Manage your personal information" },
    { icon: <Calendar size={24} />, title: "Hosting Events", description: "Everything about creating and managing events" },
    { icon: <CreditCard size={24} />, title: "Billing & Pricing", description: "Invoices, plans, and payments" },
    { icon: <Settings size={24} />, title: "Integrations", description: "Connect with other campus tools" },
    { icon: <HelpCircle size={24} />, title: "Troubleshooting", description: "Fix common issues and errors" },
  ];

  const faqs = [
    {
      question: "How do I create my first event?",
      answer: "Click the 'Host Event' button in your dashboard. Fill out the event details, upload a banner, and choose whether it's free or paid. You can then publish it immediately or save as draft."
    },
    {
      question: "How do group registrations work?",
      answer: "When a team leader registers, they can select a group size. The total price will automatically multiply by the number of members, and they'll receive a single group pass or individual passes to distribute."
    },
    {
      question: "How do I scan QR codes at the door?",
      answer: "As an event organizer, open your event dashboard on a mobile device and click 'Scan Tickets'. This uses your device's camera to instantly verify and check-in attendees."
    },
    {
      question: "Can I upgrade or downgrade my pricing plan?",
      answer: "Yes! You can change your plan at any time from your Account Settings. If you upgrade, you'll be prorated for the remainder of your billing cycle."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      {/* Hero Section with Search */}
      <main className="flex-1 w-full pt-28 pb-20">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 py-20 px-4 relative overflow-hidden">
          {/* Abstract background shapes */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[120%] bg-blue-400/20 blur-[100px] rounded-full"></div>
          </div>
          
          <div className="max-w-3xl mx-auto relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
              How can we help you today?
            </h1>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400">
                <Search size={22} />
              </div>
              <input
                type="text"
                placeholder="Search for articles, guides, or FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-lg focus:ring-4 focus:ring-white/20 outline-none transition-all"
              />
              <button className="absolute inset-y-2 right-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 rounded-xl transition-colors">
                Search
              </button>
            </div>
            
            <p className="text-indigo-100 mt-6 font-medium">
              Popular: <span className="underline cursor-pointer hover:text-white transition-colors">QR check-ins</span>, <span className="underline cursor-pointer hover:text-white transition-colors">Team registrations</span>, <span className="underline cursor-pointer hover:text-white transition-colors">Refunds</span>
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
          
          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {categories.map((category, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/40 border border-gray-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-gray-500 font-medium">{category.description}</p>
              </div>
            ))}
          </div>

          {/* FAQs Section */}
          <div className="max-w-3xl mx-auto mb-24">
            <h2 className="text-3xl font-black text-center text-gray-900 mb-10">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${openFaq === index ? 'border-indigo-500 shadow-md' : 'border-gray-200'}`}
                >
                  <button 
                    className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="font-bold text-lg text-gray-900">{faq.question}</span>
                    <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${openFaq === index ? 'rotate-180 text-indigo-500' : ''}`} />
                  </button>
                  <div 
                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <p className="text-gray-600 font-medium">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Contact Support CTA */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-12 text-center max-w-4xl mx-auto">
            <div className="w-16 h-16 bg-white text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <MessageCircle size={32} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Can't find what you're looking for?</h2>
            <p className="text-gray-600 font-medium mb-8 max-w-lg mx-auto">
              Our support team is available 24/7 to help you with any issues you might encounter on CampusEventHub.
            </p>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-indigo-500/30">
              Contact Support
            </button>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}