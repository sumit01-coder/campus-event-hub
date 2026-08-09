import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, ChevronDown } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8 mb-16">

          {/* Brand & Socials */}
          <div className="w-full lg:w-1/4">
            <Link to="/" className="inline-block mb-6">
              <img src="/logo.png" alt="CampusConnect Hub Logo" className="h-[150px] w-auto object-contain drop-shadow-md" onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }} />
              <div style={{ display: 'none' }} className="w-8 h-8 rounded-lg bg-[#2563EB] items-center justify-center text-white font-bold text-xl">
                C
              </div>
            </Link>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium">
              The all-in-one platform for modern campus event management. Built for organizers, loved by students.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>

          {/* Links Grid */}
          <div className="w-full lg:w-2/4 grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div>
              <h3 className="font-extrabold text-gray-900 text-sm mb-6">Platform</h3>
              <ul className="space-y-4">
                <li><Link to="/dashboard" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">Explore Events</Link></li>
                <li><Link to="/host" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">Host an Event</Link></li>
                <li><Link to="/pricing" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">Pricing</Link></li>
                <li><Link to="/features" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">Features</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-extrabold text-gray-900 text-sm mb-6">Resources</h3>
              <ul className="space-y-4">
                <li><Link to="/help" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">Help Center</Link></li>
                <li><Link to="/guidelines" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">Guidelines</Link></li>
                <li><Link to="/api" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">API Docs</Link></li>
                <li><Link to="/blog" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-extrabold text-gray-900 text-sm mb-6">Company</h3>
              <ul className="space-y-4">
                <li><Link to="/about" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">Contact</Link></li>
                <li><Link to="/careers" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">Careers</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-extrabold text-gray-900 text-sm mb-6">Legal</h3>
              <ul className="space-y-4">
                <li><Link to="/privacy" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">Terms of Service</Link></li>
                <li><Link to="/cookies" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="w-full lg:w-1/4">
            <div className="bg-[#FDFDFD] rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-sm mb-2">Stay in the loop</h3>
              <p className="text-gray-500 text-sm font-medium mb-4">Get updates about new events and features.</p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
                <button
                  type="button"
                  className="w-full bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm shadow-blue-500/20 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs font-semibold">
            &copy; {currentYear} CampusConnect Hub. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900 transition-colors text-xs font-bold">
              <Globe size={14} /> English <ChevronDown size={12} />
            </div>
            <div className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900 transition-colors text-xs font-bold">
              <div className="w-4 h-3 bg-gradient-to-b from-orange-500 via-white to-green-600 border border-gray-200 rounded-sm"></div> India <ChevronDown size={12} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
