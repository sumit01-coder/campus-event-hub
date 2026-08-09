import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowRight, Calendar, User } from 'lucide-react';

export default function Blog() {
  const posts = [
    { title: "10 Tips for Hosting a Killer Campus Hackathon", category: "Event Tips", date: "Aug 12, 2026", author: "Sarah Jenkins", image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80" },
    { title: "How CampusEventHub is Revolutionizing Student Life", category: "Product News", date: "Aug 05, 2026", author: "Team CEH", image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80" },
    { title: "The Ultimate Guide to Selling Out Your Club Events", category: "Marketing", date: "Jul 28, 2026", author: "Alex Johnson", image: "https://images.unsplash.com/photo-1475721025592-5696d34e6221?auto=format&fit=crop&q=80" },
    { title: "Introducing Team Registration: Register Together", category: "Product News", date: "Jul 15, 2026", author: "Team CEH", image: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full pt-32 pb-24 px-4 relative">
        <div className="max-w-7xl mx-auto mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
            The CampusEventHub <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Blog</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
            Tips, stories, and updates from the team building the future of campus experiences.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {posts.map((post, index) => (
            <div key={index} className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100">
              <div className="h-64 overflow-hidden relative">
                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-700">
                  {post.category}
                </div>
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-4 text-sm font-medium text-gray-400 mb-4">
                  <span className="flex items-center gap-1.5"><Calendar size={16} /> {post.date}</span>
                  <span className="flex items-center gap-1.5"><User size={16} /> {post.author}</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors leading-snug">{post.title}</h3>
                <button className="text-indigo-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                  Read Article <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}