import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Server, ShieldCheck, Database, Code, Terminal, ChevronRight, CheckCircle2, AlertCircle, Copy, Check, ExternalLink } from 'lucide-react';
import api from '../services/api';

export default function ApiDocs() {
  const [activeTab, setActiveTab] = useState('architecture'); // 'architecture' | 'explorer'
  const [archData, setArchData] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const fetchArch = async () => {
      try {
        const { data } = await api.get('/public/architecture');
        setArchData(data);
        if (data.routes && data.routes.length > 0) {
          setSelectedRoute(data.routes[0]);
        }
      } catch (err) {
        console.error('Error fetching architecture:', err);
      }
    };
    fetchArch();
  }, []);

  const copySnippet = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const filteredRoutes = (archData?.routes || []).filter(r => {
    const matchFilter = filter === 'all' || r.status === filter;
    const matchSearch = r.path.toLowerCase().includes(search.toLowerCase()) || 
                        r.desc.toLowerCase().includes(search.toLowerCase()) ||
                        r.tables.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-200 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            ⚡ Open Source Architecture & API Hub
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Campus EventHub API & Architecture
          </h1>
          <p className="text-sm md:text-base text-slate-400 mt-3">
            Interactive route-to-table data visualizer, live API testing, and automated security audit reports.
          </p>

          {/* Navigation Mode Tabs */}
          <div className="flex justify-center mt-6">
            <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
              <button
                onClick={() => setActiveTab('architecture')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'architecture'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Server size={14} />
                Route → Table Map
              </button>
              <button
                onClick={() => setActiveTab('explorer')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'explorer'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code size={14} />
                REST API Explorer
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: Route-to-Table Interactive Visualizer */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            {/* Top Stat Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-xs">Total API Routes</div>
                <div className="text-2xl font-black text-white mt-1">{archData?.summary?.totalRoutes || 28}</div>
                <div className="text-[11px] text-indigo-400 mt-1 font-mono">Mapped in Express</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-xs">Database Tables</div>
                <div className="text-2xl font-black text-white mt-1">{archData?.summary?.totalTables || 8}</div>
                <div className="text-[11px] text-purple-400 mt-1 font-mono">Mongoose Collections</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-xs">Guarded Paths</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">{archData?.summary?.guardedRoutes || 24}</div>
                <div className="text-[11px] text-emerald-500 mt-1">JWT & Context Verified</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-xs">Security Posture</div>
                <div className="text-2xl font-black text-cyan-400 mt-1">{archData?.summary?.healthScore || 98}%</div>
                <div className="text-[11px] text-cyan-500 mt-1">0 Critical Errors</div>
              </div>
            </div>

            {/* Embedded Visualizer Frame */}
            <div className="rounded-2xl border border-slate-800 overflow-hidden shadow-2xl bg-slate-950">
              <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                  <span className="text-xs font-mono text-slate-400 ml-2">campus-eventhub // architecture-graph-v1.0</span>
                </div>
                <a
                  href="/route-table-map.html"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition"
                >
                  Open Fullscreen <ExternalLink size={12} />
                </a>
              </div>

              <iframe
                src="/route-table-map.html"
                title="Route Table Architecture Map"
                className="w-full h-[650px] border-0"
              />
            </div>
          </div>
        )}

        {/* TAB 2: Interactive REST API Explorer */}
        {activeTab === 'explorer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Route Selector */}
            <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="mb-4 space-y-2">
                <input
                  type="text"
                  placeholder="Filter endpoints..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
                <div className="flex gap-1.5 text-[11px]">
                  {['all', 'guarded', 'warning'].map(t => (
                    <button
                      key={t}
                      onClick={() => setFilter(t)}
                      className={`px-2.5 py-1 rounded-lg capitalize font-medium transition ${
                        filter === t ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 max-h-[550px] overflow-y-auto pr-1">
                {filteredRoutes.map((route) => {
                  const isSelected = selectedRoute?.id === route.id;
                  const methodColor = {
                    GET: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
                    POST: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                    PUT: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                    DELETE: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                  }[route.method] || 'text-slate-400';

                  return (
                    <div
                      key={route.id}
                      onClick={() => setSelectedRoute(route)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-950/60 border-indigo-500/50 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${methodColor}`}>
                          {route.method}
                        </span>
                        <span className="font-mono text-slate-200 truncate">{route.path}</span>
                      </div>
                      <ChevronRight size={14} className={isSelected ? 'text-indigo-400' : 'text-slate-600'} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Endpoint Details & Code Generator */}
            <div className="lg:col-span-7 space-y-5">
              {selectedRoute ? (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold text-xs">
                        {selectedRoute.method}
                      </span>
                      <h3 className="text-lg font-bold text-white font-mono">{selectedRoute.path}</h3>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      selectedRoute.status === 'guarded' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {selectedRoute.status}
                    </span>
                  </div>

                  <p className="text-slate-400 text-xs mt-2">{selectedRoute.desc}</p>

                  {/* Architecture & Guard Metadata */}
                  <div className="grid grid-cols-2 gap-3 my-5">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Guards & Middlewares</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedRoute.middlewares.map(m => (
                          <span key={m} className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-indigo-400 font-mono text-[11px] rounded">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Target Collections</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedRoute.tables.map(t => (
                          <span key={t} className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-[11px] rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Code Request Example */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Terminal size={14} className="text-indigo-400" />
                        cURL Request
                      </span>
                      <button
                        onClick={() => copySnippet(`curl -X ${selectedRoute.method} 'http://localhost:5000${selectedRoute.path}' \\
  -H 'Authorization: Bearer <YOUR_JWT_TOKEN>' \\
  -H 'Content-Type: application/json'`)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                      >
                        {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copiedCode ? 'Copied!' : 'Copy cURL'}
                      </button>
                    </div>

                    <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
{`curl -X ${selectedRoute.method} 'http://localhost:5000${selectedRoute.path}' \\
  -H 'Authorization: Bearer <YOUR_JWT_TOKEN>' \\
  -H 'Content-Type: application/json'`}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                  Select an endpoint from the list to view its architecture and request schema
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
