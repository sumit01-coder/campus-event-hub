import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Starter",
      description: "Perfect for student clubs just getting started.",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        "Up to 2 active events",
        "Max 100 registrations/event",
        "Basic QR ticketing",
        "Standard email support",
      ],
      notIncluded: [
        "Custom branding",
        "Advanced analytics",
        "Team registrations"
      ],
      buttonText: "Get Started Free",
      popular: false,
    },
    {
      name: "Pro Organizer",
      description: "Everything you need to host massive campus events.",
      monthlyPrice: 99,
      annualPrice: 99,
      features: [
        "Unlimited active events",
        "Unlimited registrations",
        "Advanced QR & team ticketing",
        "Custom branding & certificates",
        "Priority 24/7 support",
        "Advanced analytics dashboard"
      ],
      notIncluded: [],
      buttonText: "Start 14-Day Free Trial",
      popular: true,
    },
    {
      name: "University",
      description: "Enterprise-grade solution for entire universities.",
      monthlyPrice: "Custom",
      annualPrice: "Custom",
      features: [
        "Everything in Pro Organizer",
        "Multi-department management",
        "SSO & Custom integrations",
        "Dedicated account manager",
        "SLA guarantee",
        "On-premise deployment options"
      ],
      notIncluded: [],
      buttonText: "Contact Sales",
      popular: false,
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <main className="flex-1 w-full pt-32 pb-24 px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[120%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[100%] bg-purple-500/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
              Simple, transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">pricing</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
              Whether you're a small club or a massive university, we have the perfect plan to scale your events.
            </p>
            
            {/* Billing Toggle */}
            <div className="mt-12 flex items-center justify-center gap-4">
              <span className={`text-sm font-bold ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>Monthly Billing</span>
              <button 
                onClick={() => setIsAnnual(!isAnnual)}
                className="w-16 h-8 bg-indigo-600 rounded-full relative p-1 cursor-pointer transition-colors focus:outline-none"
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out ${isAnnual ? 'translate-x-8' : 'translate-x-0'}`} />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>Annual Billing</span>
                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-black rounded-full uppercase tracking-wider">Save 20%</span>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative bg-white rounded-[2rem] p-8 transition-all duration-300 hover:-translate-y-2 ${
                  plan.popular 
                    ? 'shadow-[0_20px_60px_rgba(79,70,229,0.15)] border-2 border-indigo-500 md:-mt-4 md:mb-4' 
                    : 'shadow-xl shadow-gray-200/50 border border-gray-100'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                    <Sparkles size={16} /> Most Popular
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-500 text-sm font-medium h-10">{plan.description}</p>
                </div>
                
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-gray-900">
                      {typeof plan.monthlyPrice === 'string' ? plan.monthlyPrice : `₹${isAnnual ? plan.annualPrice : plan.monthlyPrice}`}
                    </span>
                    {typeof plan.monthlyPrice === 'number' && (
                      <span className="text-gray-500 font-bold">/mo</span>
                    )}
                  </div>
                  {isAnnual && typeof plan.monthlyPrice === 'number' && plan.monthlyPrice > 0 && (
                    <p className="text-sm text-indigo-600 font-bold mt-2">Billed ₹{plan.annualPrice * 12} yearly</p>
                  )}
                </div>
                
                <Link to="/register" className="block w-full">
                  <button className={`w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                  }`}>
                    {plan.buttonText} <ArrowRight size={18} />
                  </button>
                </Link>
                
                <div className="mt-8 space-y-4">
                  <p className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">What's included</p>
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-indigo-600 shrink-0 mt-0.5" />
                      <span className="text-gray-600 font-medium text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.notIncluded.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 opacity-50">
                      <XCircle size={20} className="text-gray-400 shrink-0 mt-0.5" />
                      <span className="text-gray-500 font-medium text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* FAQ or Trust Section */}
          <div className="mt-32 max-w-4xl mx-auto text-center bg-indigo-50 rounded-3xl p-12 border border-indigo-100">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Still have questions?</h2>
            <p className="text-gray-600 font-medium mb-8">We're here to help you find the perfect plan for your organization's needs.</p>
            <Link to="/help">
              <button className="bg-white border-2 border-indigo-200 hover:border-indigo-600 hover:text-indigo-600 text-gray-700 font-bold py-3 px-8 rounded-xl transition-all shadow-sm">
                Visit Help Center
              </button>
            </Link>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}