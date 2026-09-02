import React, { useState, useEffect } from 'react';
import webMCPManager from '../webmcp/WebMCPManager';
import { Terminal, X, Minimize2, Maximize2 } from 'lucide-react';

const WebMCPDemoPanel = () => {
    const [events, setEvents] = useState([]);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        const unsubscribe = webMCPManager.subscribe((event) => {
            setEvents(prev => [event, ...prev].slice(0, 50)); // keep last 50 events
        });
        return unsubscribe;
    }, []);

    if (!isOpen) return null;

    return (
        <div className={`fixed bottom-4 right-4 z-50 bg-gray-900 text-green-400 rounded-lg shadow-2xl overflow-hidden transition-all duration-300 border border-gray-700 flex flex-col font-mono text-xs ${isMinimized ? 'w-64 h-12' : 'w-96 h-96'}`}>
            <div className="bg-gray-800 p-2 flex justify-between items-center cursor-pointer border-b border-gray-700 select-none" onClick={() => setIsMinimized(!isMinimized)}>
                <div className="flex items-center gap-2 font-bold text-gray-200">
                    <Terminal size={14} />
                    <span>WebMCP Demo Panel</span>
                </div>
                <div className="flex gap-2 text-gray-400">
                    {isMinimized ? <Maximize2 size={14} className="hover:text-white" /> : <Minimize2 size={14} className="hover:text-white" />}
                    <X size={14} className="hover:text-red-400" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} />
                </div>
            </div>
            
            {!isMinimized && (
                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                    {events.length === 0 ? (
                        <div className="text-gray-500 italic text-center mt-10">Waiting for agent tool calls...</div>
                    ) : (
                        events.map((evt, i) => (
                            <div key={i} className="border-b border-gray-800 pb-2 mb-2 last:border-0 last:mb-0 last:pb-0">
                                <div className="text-gray-500 text-[10px] mb-1">{evt.timestamp.toLocaleTimeString()}</div>
                                <div className="font-semibold text-blue-400">
                                    {evt.type === 'tool_start' ? '▶ EXECUTING TOOL' : evt.type === 'tool_success' ? '✓ TOOL SUCCESS' : '✕ TOOL ERROR'}
                                </div>
                                <div className="text-white mt-1"><span className="text-gray-400">Tool:</span> {evt.name}</div>
                                {evt.input && (
                                    <div className="mt-1">
                                        <span className="text-gray-400">Input:</span>
                                        <pre className="mt-1 bg-gray-950 p-1 rounded text-orange-300 overflow-x-auto">
                                            {JSON.stringify(evt.input, null, 2)}
                                        </pre>
                                    </div>
                                )}
                                {evt.result && (
                                    <div className="mt-1">
                                        <span className="text-gray-400">Result:</span>
                                        <pre className="mt-1 bg-gray-950 p-1 rounded text-green-300 overflow-x-auto max-h-32">
                                            {typeof evt.result === 'object' ? JSON.stringify(evt.result, null, 2) : evt.result}
                                        </pre>
                                    </div>
                                )}
                                {evt.error && (
                                    <div className="mt-1">
                                        <span className="text-red-400">Error:</span> {evt.error}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default WebMCPDemoPanel;
