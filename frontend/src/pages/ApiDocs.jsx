import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-textPrimary mb-4">API Documentation</h1>
        <p className="text-lg text-textSecondary mb-12">Build with the CampusEventHub API.</p>
        <div className="saas-card p-12">
          <p className="text-textSecondary">This page is currently under construction. Check back soon!</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}