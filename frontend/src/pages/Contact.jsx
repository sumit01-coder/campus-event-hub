import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, MapPin, Phone, Send, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Message sent successfully! We'll get back to you soon.");
      setIsSubmitting(false);
      e.target.reset();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 w-full pt-32 pb-24 px-4 relative">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 bg-white rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">
          
          {/* Contact Info (Left Side) */}
          <div className="w-full lg:w-2/5 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-12 text-white relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
            
            <div className="relative z-10 mb-12">
              <h2 className="text-4xl font-black mb-4">Get in touch</h2>
              <p className="text-indigo-100 font-medium text-lg">
                We'd love to hear from you. Our friendly team is always here to chat.
              </p>
            </div>

            <div className="space-y-8 relative z-10 flex-1">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                  <Mail size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Chat to us</h3>
                  <p className="text-indigo-100 text-sm mb-1">Our friendly team is here to help.</p>
                  <a href="mailto:hello@campuseventhub.com" className="font-bold hover:underline">hello@campuseventhub.com</a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                  <MapPin size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Office</h3>
                  <p className="text-indigo-100 text-sm mb-1">Come say hello at our campus HQ.</p>
                  <p className="font-bold">100 University Ave<br/>Innovation Center, Room 404</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                  <Phone size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Phone</h3>
                  <p className="text-indigo-100 text-sm mb-1">Mon-Fri from 8am to 5pm.</p>
                  <a href="tel:+11234567890" className="font-bold hover:underline">+1 (123) 456-7890</a>
                </div>
              </div>
            </div>
            
            <div className="relative z-10 mt-12 pt-8 border-t border-white/20">
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-indigo-600 transition-colors">
                  <span className="font-bold text-sm">X</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-indigo-600 transition-colors">
                  <span className="font-bold text-sm">IG</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-indigo-600 transition-colors">
                  <span className="font-bold text-sm">LI</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form (Right Side) */}
          <div className="w-full lg:w-3/5 p-8 md:p-12 lg:p-16 bg-white">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-2">
                <MessageSquare className="text-indigo-600" /> Send us a message
              </h2>
              <p className="text-gray-500 font-medium">We usually respond within 24 hours.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">First name</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium" placeholder="First name" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Last name</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium" placeholder="Last name" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                <input type="email" required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium" placeholder="you@university.edu" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">How can we help?</label>
                <textarea required rows="4" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium resize-none" placeholder="Tell us a little about your project or issue..."></textarea>
              </div>
              
              <div className="flex items-start gap-3">
                <input type="checkbox" id="privacy" className="mt-1 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer" required />
                <label htmlFor="privacy" className="text-sm text-gray-500 cursor-pointer">
                  You agree to our friendly <a href="/privacy" className="text-indigo-600 font-bold hover:underline">privacy policy</a>.
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Sending...' : 'Send message'} {!isSubmitting && <Send size={18} />}
              </button>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
