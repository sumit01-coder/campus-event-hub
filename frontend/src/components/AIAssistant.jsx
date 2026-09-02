import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    MessageSquare, X, Send, Bot, User, Loader2, CheckCircle2,
    Zap, TrendingUp, Calendar, Star, Brain, ChevronDown, RotateCcw,
    AlertCircle, Ticket, Cpu, Mic
} from 'lucide-react';
import webMCPManager from '../webmcp/WebMCPManager';
import campusAI, { pythonBridge } from '../ai/CampusAIEngine';
import orchestrator from '../webmcp/WebMCPOrchestrator';

// ─── SIMPLE MARKDOWN RENDERER ─────────────────────────────────────────────
const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements = [];
    let key = 0;

    for (const line of lines) {
        if (!line.trim()) { elements.push(<div key={key++} className="h-1.5" />); continue; }

        // Heading
        if (line.startsWith('**') && line.endsWith('**') && !line.slice(2, -2).includes('**')) {
            elements.push(<p key={key++} className="font-bold text-gray-800 text-sm">{line.slice(2, -2)}</p>);
            continue;
        }

        // List item
        if (line.startsWith('- ') || line.match(/^\d+\.\s/)) {
            const content = line.replace(/^[-\d.]+\s/, '');
            elements.push(
                <div key={key++} className="flex gap-2 items-start text-sm text-gray-700">
                    <span className="text-indigo-400 mt-0.5 shrink-0">•</span>
                    <span>{parseBold(content)}</span>
                </div>
            );
            continue;
        }

        elements.push(<p key={key++} className="text-sm text-gray-700 leading-relaxed">{parseBold(line)}</p>);
    }

    return elements;
};

const parseBold = (text) => {
    const parts = text.split(/\*\*(.+?)\*\*/g);
    return parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900">{part}</strong> : part
    );
};

// ─── MINI EVENT CARD ──────────────────────────────────────────────────────
const MiniEventCard = ({ event, onRegister, onCancel, actionLabel = 'Register', isLoading }) => {
    const date = event?.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD';
    const isPast = event?.date && new Date(event.date) < new Date();
    const fillPct = event?.capacity ? Math.min(100, Math.round(((event.registeredCount || 0) / event.capacity) * 100)) : null;

    return (
        <div className="bg-gradient-to-br from-white to-indigo-50/30 border border-indigo-100 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-gray-900 truncate">{event?.title}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{date} · {event?.time || 'TBD'}</p>
                    <p className="text-[10px] text-indigo-600 truncate">{event?.venue || 'TBD'}</p>
                </div>
                {isPast ? (
                    <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-1 rounded-lg shrink-0">Closed</span>
                ) : (
                    <button
                        onClick={() => actionLabel === 'Cancel' ? onCancel?.(event._id) : onRegister?.(event._id)}
                        disabled={isLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm shrink-0 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1"
                    >
                        {isLoading ? <Loader2 size={9} className="animate-spin" /> : null}
                        {actionLabel}
                    </button>
                )}
            </div>
            {fillPct !== null && (
                <div className="mt-2">
                    <div className="flex justify-between text-[9px] text-gray-400 mb-0.5">
                        <span>{event.registeredCount || 0} registered</span>
                        <span>{fillPct}% full</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${fillPct >= 90 ? 'bg-red-400' : fillPct >= 70 ? 'bg-amber-400' : 'bg-green-400'}`}
                            style={{ width: `${fillPct}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── SUGGESTION CHIPS ─────────────────────────────────────────────────────
const SuggestionChips = ({ suggestions, onSelect }) => (
    <div className="flex flex-wrap gap-1.5 mt-2">
        {suggestions.map((s, i) => (
            <button
                key={i}
                onClick={() => onSelect(s)}
                className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-1 rounded-full border border-indigo-200 transition-all hover:scale-105 active:scale-95"
            >
                {s}
            </button>
        ))}
    </div>
);

// ─── STREAMING TEXT EFFECT ─────────────────────────────────────────────────
const useStreamText = (text, isActive) => {
    const [displayed, setDisplayed] = useState('');
    const idxRef = useRef(0);

    useEffect(() => {
        if (!isActive || !text) { setDisplayed(text || ''); return; }
        setDisplayed('');
        idxRef.current = 0;

        const CHUNK = 3;
        const interval = setInterval(() => {
            if (idxRef.current < text.length) {
                setDisplayed(text.slice(0, idxRef.current + CHUNK));
                idxRef.current += CHUNK;
            } else {
                clearInterval(interval);
            }
        }, 12);

        return () => clearInterval(interval);
    }, [text, isActive]);

    return displayed;
};

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────
const MessageBubble = ({ msg, onRegister, onCancel, onSuggestionSelect, registeringId }) => {
    const isUser = msg.role === 'user';
    const isNewest = msg.isNewest;
    const streamed = useStreamText(msg.content, isNewest && !isUser);
    const displayContent = isUser || !isNewest ? msg.content : streamed;

    return (
        <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${isUser ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-indigo-500'}`}>
                {isUser ? <User size={13} /> : <Bot size={13} />}
            </div>
            <div className={`flex flex-col gap-1.5 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                {isUser ? (
                    <div className="bg-indigo-600 text-white px-3.5 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-sm">
                        {msg.content}
                    </div>
                ) : (
                    <div className="bg-white border border-gray-100 px-3.5 py-2.5 rounded-2xl rounded-tl-sm shadow-sm w-full">
                        <div className="space-y-0.5">
                            {renderMarkdown(displayContent)}
                        </div>
                    </div>
                )}

                {/* Event cards */}
                {msg.events?.length > 0 && (
                    <div className="flex flex-col gap-2 w-full mt-1 max-h-56 overflow-y-auto pr-0.5">
                        {msg.events.map(e => e && (
                            <MiniEventCard
                                key={e._id}
                                event={e}
                                onRegister={onRegister}
                                onCancel={onCancel}
                                actionLabel={msg.action === 'cancel' ? 'Cancel' : 'Register'}
                                isLoading={registeringId === e._id}
                            />
                        ))}
                    </div>
                )}

                {/* Suggestion chips */}
                {msg.suggestions?.length > 0 && !isUser && (
                    <SuggestionChips suggestions={msg.suggestions} onSelect={onSuggestionSelect} />
                )}

                {/* Timestamp */}
                <span className="text-[9px] text-gray-300">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
};

// ─── QUICK ACTION BUTTONS ─────────────────────────────────────────────────
const QUICK_ACTIONS = [
    { label: 'Trending', icon: TrendingUp, query: 'show trending events' },
    { label: 'Find Events', icon: Calendar, query: 'find events happening soon' },
    { label: 'Recommend', icon: Star, query: 'recommend something for me' },
    { label: 'My Schedule', icon: Ticket, query: 'show my events' },
];

// ─── MAIN AI ASSISTANT ────────────────────────────────────────────────────
const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Hi there! 👋 I'm **CampusAI v2**, your intelligent campus event assistant.\n\nI understand natural language — just ask me anything! Try:\n- "show me tech events this week"\n- "what's trending?"\n- "register me for the hackathon"`,
            suggestions: ['Find events', 'Show trending', 'My schedule', 'Help'],
            timestamp: Date.now(),
            isNewest: false,
        }
    ]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTools, setActiveTools] = useState([]);
    const [registeringId, setRegisteringId] = useState(null);
    const [memorySummary, setMemorySummary] = useState([]);
    const [pythonOnline, setPythonOnline] = useState(null); // null=checking, true/false
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const recognitionRef = useRef(null);

    // Check Python service on open
    useEffect(() => {
        if (isOpen && pythonOnline === null) {
            pythonBridge.isAvailable().then(avail => setPythonOnline(avail));
        }
    }, [isOpen, pythonOnline]);

    // Initialize Web Speech API
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    transcript += event.results[i][0].transcript;
                }
                setInput(transcript);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
                // We don't auto-send because interimResults might cause premature sending
                // The user can press send when satisfied with the transcript
            };

            recognitionRef.current = recognition;
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert('Speech Recognition is not supported in this browser.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            setInput(''); // Clear input for new speech
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages]);

    useEffect(() => {
        const unsubscribe = webMCPManager.subscribe((event) => {
            if (event.type === 'tool_start') {
                setActiveTools(prev => [...prev.filter(t => t.name !== event.name), { name: event.name, status: 'running' }]);
            } else if (event.type === 'tool_success' || event.type === 'tool_error') {
                setActiveTools(prev => prev.map(t => t.name === event.name ? { ...t, status: event.type === 'tool_success' ? 'success' : 'error' } : t));
                setTimeout(() => setActiveTools(prev => prev.filter(t => t.name !== event.name)), 2500);
            }
        });
        return unsubscribe;
    }, []);

    const addMessage = (role, content, extras = {}) => {
        const newMsg = {
            role,
            content,
            timestamp: Date.now(),
            isNewest: role === 'assistant',
            ...extras,
        };
        setMessages(prev => [
            ...prev.map(m => ({ ...m, isNewest: false })),
            newMsg,
        ]);
        return newMsg;
    };

    const processMessage = useCallback(async (text) => {
        if (!text.trim() || isProcessing) return;

        setIsProcessing(true);
        addMessage('user', text);

        try {
            let parsed;

            // 1a. Try Python deep NLP (superior entity + intent analysis)
            const pyAvail = await pythonBridge.isAvailable();
            if (pyAvail) {
                try {
                    parsed = await pythonBridge.analyze(
                        text,
                        campusAI.contextMemory.slice(-6),
                        campusAI.userInterests
                    );
                    // Also run JS parse to update local memory state
                    const jsParsed = campusAI.parse(text);
                    // Merge: prefer Python intent/entities, use JS memory
                    parsed.resolvedEvent = parsed.resolvedEvent || jsParsed.resolvedEvent;
                    if (!parsed.entities.inheritedCategory) {
                        parsed.entities.inheritedCategory = jsParsed.entities.inheritedCategory;
                    }
                    if (pythonOnline !== true) setPythonOnline(true);
                } catch {
                    // Python failed mid-flight — fall back to JS
                    parsed = campusAI.parse(text);
                    parsed._source = 'js-fallback';
                }
            } else {
                // 1b. Pure JS NLP
                parsed = campusAI.parse(text);
                parsed._source = 'js';
            }

            // 2. Execute through Orchestrator (tools + Python ranking inside)
            const result = await orchestrator.execute(parsed);

            // 3. Record in AI memory
            campusAI.recordAssistantResponse(result.response, result.events || []);

            // 4. Get suggestions
            const suggestions = campusAI.getSuggestions(parsed.intent, (result.events?.length || 0) > 0);

            // 5. Update memory summary
            setMemorySummary(campusAI.getMemorySummary());

            // 6. Annotate with source engine
            const engineLabel = parsed._source === 'python' ? '🐍 Python NLP' : '⚡ JS NLP';

            // 7. Add assistant message
            addMessage('assistant', result.response, {
                events: result.events || [],
                suggestions,
                action: result.action,
                awaitingSelection: result.awaitingSelection,
                engineLabel,
            });

        } catch (error) {
            addMessage('assistant', `Sorry, something went wrong: ${error.message}. Please try again.`, {
                suggestions: ['Find events', 'Help', 'Show trending'],
            });
        } finally {
            setIsProcessing(false);
        }
    }, [isProcessing, pythonOnline]);

    const handleRegisterFromChat = useCallback(async (eventId) => {
        setRegisteringId(eventId);
        try {
            const tools = window.document.modelContext.getTools();
            const regTool = tools.find(t => t.name === 'register_for_event');
            const result = await regTool.execute({ event_id: eventId });

            if (result.success) {
                addMessage('assistant', `✅ **Registration successful!** Your pass has been created. Check your dashboard to view it.`, {
                    suggestions: ['View my events', 'Find more events', 'Show my schedule'],
                });
            } else {
                addMessage('assistant', `❌ Registration failed: ${result.message}`, {
                    suggestions: ['Try another event', 'Help me register', 'Show trending events'],
                });
            }
        } catch (error) {
            addMessage('assistant', `Error: ${error.message}`, { suggestions: ['Try again', 'Help'] });
        } finally {
            setRegisteringId(null);
        }
    }, []);

    const handleCancelFromChat = useCallback(async (eventId) => {
        try {
            const tools = window.document.modelContext.getTools();
            const cancelTool = tools.find(t => t.name === 'cancel_registration');
            await cancelTool.execute({ event_id: eventId });
            addMessage('assistant', `✅ Registration cancelled successfully.`, {
                suggestions: ['Find replacement events', 'Show my events', 'Trending'],
            });
        } catch (error) {
            addMessage('assistant', `Error: ${error.message}`, { suggestions: ['Try again'] });
        }
    }, []);

    const handleSend = (e) => {
        e.preventDefault();
        const text = input.trim();
        if (!text) return;
        setInput('');
        processMessage(text);
    };

    const handleSuggestion = (text) => {
        setInput('');
        processMessage(text);
    };

    const handleClearMemory = () => {
        campusAI.clearMemory();
        setMemorySummary([]);
        setMessages([{
            role: 'assistant',
            content: `Memory cleared! 🧹 Starting fresh. What can I help you with?`,
            suggestions: ['Find events', 'Show trending', 'My schedule'],
            timestamp: Date.now(),
            isNewest: false,
        }]);
    };

    return (
        <>
            {/* FAB */}
            <button
                onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 200); }}
                className={`fixed bottom-6 right-6 p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 transform hover:scale-110 z-40 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
            >
                <div className="relative">
                    <Brain size={22} />
                    <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse border border-white" />
                </div>
            </button>

            {/* Chat Window */}
            <div className={`fixed bottom-6 right-6 w-[420px] h-[620px] bg-gray-50 rounded-3xl shadow-2xl shadow-indigo-500/15 flex flex-col overflow-hidden transition-all duration-300 z-50 border border-white origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>

                {/* Header */}
                <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-4 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Brain size={18} />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">CampusAI v2</h3>
                            <div className="text-[10px] text-white/70 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                NLP Engine · 15 Tools
                                {pythonOnline === true && (
                                    <span className="flex items-center gap-1 bg-green-500/20 border border-green-400/30 text-green-300 px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                                        <Cpu size={8} /> Python AI
                                    </span>
                                )}
                                {pythonOnline === false && (
                                    <span className="flex items-center gap-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                                        ⚡ JS Mode
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleClearMemory}
                            title="Clear conversation memory"
                            className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                        >
                            <RotateCcw size={13} />
                        </button>
                        <button onClick={() => setIsOpen(false)} className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {/* Memory Indicator */}
                {memorySummary.length > 0 && (
                    <div className="bg-violet-50 border-b border-violet-100 px-4 py-2 flex items-center gap-2 shrink-0">
                        <Brain size={11} className="text-violet-500 shrink-0" />
                        <p className="text-[10px] text-violet-600 font-medium truncate">
                            AI Remembers: {memorySummary.join(' · ')}
                        </p>
                    </div>
                )}

                {/* Active Tool Indicator */}
                {activeTools.length > 0 && (
                    <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2 flex items-center gap-2 shrink-0">
                        <Zap size={11} className="text-indigo-500 animate-pulse shrink-0" />
                        <div className="flex items-center gap-2 overflow-hidden">
                            {activeTools.slice(0, 2).map((tool, i) => (
                                <div key={i} className="flex items-center gap-1">
                                    {tool.status === 'running'
                                        ? <Loader2 size={10} className="animate-spin text-indigo-400" />
                                        : tool.status === 'success'
                                            ? <CheckCircle2 size={10} className="text-green-500" />
                                            : <AlertCircle size={10} className="text-red-400" />
                                    }
                                    <span className="font-mono text-[9px] text-indigo-600 truncate max-w-[100px]">{tool.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
                    {messages.map((msg, idx) => (
                        <MessageBubble
                            key={idx}
                            msg={msg}
                            onRegister={handleRegisterFromChat}
                            onCancel={handleCancelFromChat}
                            onSuggestionSelect={handleSuggestion}
                            registeringId={registeringId}
                        />
                    ))}

                    {/* Processing indicator */}
                    {isProcessing && (
                        <div className="flex gap-2">
                            <div className="w-7 h-7 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0">
                                <Brain size={13} className="text-indigo-500 animate-pulse" />
                            </div>
                            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                                    </div>
                                    <span className="text-[10px] text-gray-400">AI thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                <div className="px-4 pb-2 shrink-0">
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                        {QUICK_ACTIONS.map(({ label, icon: Icon, query }) => (
                            <button
                                key={label}
                                onClick={() => handleSuggestion(query)}
                                disabled={isProcessing}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-xl text-[10px] font-semibold text-gray-600 hover:text-indigo-700 transition-all whitespace-nowrap shadow-sm disabled:opacity-40"
                            >
                                <Icon size={10} className="shrink-0" />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0 relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isListening ? "Listening..." : "Ask CampusAI anything..."}
                        disabled={isProcessing}
                        className={`flex-1 bg-gray-50 border ${isListening ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400'} rounded-2xl px-4 py-2.5 text-sm focus:outline-none transition-all disabled:opacity-60 placeholder:text-gray-400`}
                    />
                    
                    {input.trim() || isProcessing ? (
                        <button
                            type="submit"
                            disabled={!input.trim() || isProcessing}
                            className="p-2.5 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md hover:shadow-indigo-500/25"
                        >
                            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={toggleListening}
                            title="Voice input"
                            className={`p-2.5 rounded-2xl transition-all shadow-sm hover:shadow-md flex items-center justify-center ${
                                isListening 
                                ? 'bg-red-500 text-white animate-pulse shadow-red-500/25' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                            }`}
                        >
                            <Mic size={16} />
                        </button>
                    )}
                </form>
            </div>
        </>
    );
};

export default AIAssistant;
