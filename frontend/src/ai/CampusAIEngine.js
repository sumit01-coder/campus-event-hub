/**
 * CampusAI Engine v2 - Own AI NLP Brain
 * Pure JavaScript NLP with intent classification, entity extraction,
 * confidence scoring, pronoun resolution, and 10-turn context memory.
 *
 * Python Bridge: When the Python microservice (/api/ai/*) is available,
 * this engine automatically uses it for superior TF-IDF ranking, cosine
 * similarity recommendations, and deeper entity resolution. Falls back
 * to pure-JS analysis if the Python service is offline.
 */

// ─── PYTHON AI BRIDGE ────────────────────────────────────────────────────────
class PythonAIBridge {
    constructor() {
        this._available = null;  // null = unknown, true/false after first check
        this._lastCheck = 0;
        this.RECHECK_INTERVAL_MS = 30000; // re-ping every 30 seconds
    }

    /**
     * Check if Python service is reachable (cached for 30s).
     */
    async isAvailable() {
        const now = Date.now();
        if (this._available !== null && now - this._lastCheck < this.RECHECK_INTERVAL_MS) {
            return this._available;
        }
        try {
            const res = await fetch('/api/ai/health', { signal: AbortSignal.timeout(1500) });
            this._available = res.ok;
        } catch {
            this._available = false;
        }
        this._lastCheck = now;
        return this._available;
    }

    /**
     * Analyze a message using the Python NLP service.
     * Returns the same shape as CampusAIEngine.parse() for drop-in use.
     */
    async analyze(message, conversationHistory = [], userInterests = [], currentPath = null) {
        const res = await fetch('/api/ai/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, conversation_history: conversationHistory, user_interests: userInterests, current_path: currentPath }),
            signal: AbortSignal.timeout(6000),
        });
        if (!res.ok) throw new Error(`Python /analyze failed: ${res.status}`);
        const data = await res.json();
        // Normalize to the same shape CampusAIEngine.parse() returns
        return {
            intent: data.intent,
            intents: data.intents || [data.intent],
            confidence: data.confidence,
            entities: {
                categories: data.entities?.categories || [],
                dateRef: data.entities?.date_ref || null,
                timeRef: data.entities?.time_ref || null,
                eventNameHint: data.entities?.event_name_hint || null,
                numberRef: data.entities?.number_ref || null,
                locationRef: data.entities?.location_ref || null,
                resolvedEventId: data.context?.last_mentioned_event?._id || null,
                resolvedEventTitle: data.context?.last_mentioned_event?.title || null,
                inheritedCategory: data.context?.inherited_category || null,
            },
            sentiment: data.sentiment,
            rawText: message,
            resolvedEvent: data.context?.last_mentioned_event || null,
            userInterests,
            currentPath: data.current_path || null,
            needsClarification: data.needs_clarification,
            _pythonMs: data.processing_ms,
            _source: 'python',
        };
    }

    /**
     * Get TF-IDF ranked events from Python.
     */
    async rankEvents(query, topK = 10) {
        const res = await fetch('/api/ai/rank', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, top_k: topK }),
            signal: AbortSignal.timeout(6000),
        });
        if (!res.ok) throw new Error(`Python /rank failed: ${res.status}`);
        return res.json();
    }

    /**
     * Get content-based event recommendations from Python.
     */
    async recommend(userInterests = [], registeredCategories = [], topK = 5) {
        const res = await fetch('/api/ai/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_interests: userInterests, registered_categories: registeredCategories, top_k: topK }),
            signal: AbortSignal.timeout(6000),
        });
        if (!res.ok) throw new Error(`Python /recommend failed: ${res.status}`);
        return res.json();
    }

    /**
     * Get platform-level event insights from Python.
     */
    async getInsights() {
        const res = await fetch('/api/ai/insights', {
            signal: AbortSignal.timeout(6000)
        });
        if (!res.ok) throw new Error(`Python /insights failed: ${res.status}`);
        return res.json();
    }
}

export const pythonBridge = new PythonAIBridge();

const INTENT_PATTERNS = [
    {
        intent: 'SEARCH_EVENTS',
        patterns: [
            /\b(find|search|show|list|display|get|fetch|look for|any)\b.*\bevent/i,
            /\bwhat events?\b/i,
            /\bevents?\s+(happening|available|on|today|this week|this month)/i,
            /\bshow me events?\b/i,
            /\bexplore events?\b/i,
        ],
        keywords: ['find', 'search', 'show events', 'list events', 'any events', 'what events', 'browse'],
        weight: 1.0,
    },
    {
        intent: 'REGISTER',
        patterns: [
            /\b(register|sign up|join|enroll|book|participate|apply)\b/i,
            /\bregister (me|for|in)\b/i,
            /\bsign me up\b/i,
            /\bi want to (join|attend|go)\b/i,
        ],
        keywords: ['register', 'sign up', 'join', 'enroll', 'book', 'participate', 'apply', 'attend'],
        weight: 1.2,
    },
    {
        intent: 'CANCEL_REGISTRATION',
        patterns: [
            /\b(cancel|unregister|withdraw|drop|remove me from)\b/i,
        ],
        keywords: ['cancel', 'unregister', 'withdraw', 'drop out', 'remove me'],
        weight: 1.2,
    },
    {
        intent: 'MY_EVENTS',
        patterns: [
            /\bmy (past |upcoming )?(events?|schedule|registrations?|tickets?|bookings?)\b/i,
            /\bwhat (am i|have i registered)\b/i,
            /\bshow my (past |upcoming )?(events?|schedule)\b/i,
        ],
        keywords: ['my events', 'my schedule', 'my registrations', 'what am i attending', 'my tickets', 'past events', 'upcoming events'],
        weight: 1.0,
    },
    {
        intent: 'HOSTED_EVENTS',
        patterns: [
            /\bmy (hosted|created|organized) events?\b/i,
            /\b(events? i (host|hosted|created|organized))\b/i,
            /\b(last|previous) host(ed)? event\b/i,
            /\bshows? previous host event\b/i,
        ],
        keywords: ['hosted events', 'my hosted event', 'events i host', 'events i created', 'last host event', 'previous host event'],
        weight: 1.2,
    },
    {
        intent: 'RECOMMEND',
        patterns: [
            /\b(recommend|suggest|what should i|any good)\b/i,
            /\bwhat('s| is) (good|popular|worth attending)\b/i,
            /\bbest events?\b/i,
            /\bi (like|enjoy|love|am interested in)\b/i,
        ],
        keywords: ['recommend', 'suggest', 'best events', 'interested in'],
        weight: 1.1,
    },
    {
        intent: 'CREATE_EVENT',
        patterns: [
            /\b(create|host|organize|set up|make|add)\b.{0,20}\b(event|workshop|seminar|hackathon|tournament|meetup)\b/i,
            /\bnew event\b/i,
        ],
        keywords: ['create event', 'host an event', 'organize an event', 'set up an event'],
        weight: 1.4,
    },
    {
        intent: 'TRENDING',
        patterns: [
            /\b(trending|popular|most registered|top events?|hot events?)\b/i,
            /\bwhat's popular\b/i,
            /\bmost attended\b/i,
        ],
        keywords: ['trending', 'popular', 'top events', 'most registered', 'hottest'],
        weight: 1.0,
    },
    {
        intent: 'ANALYTICS',
        patterns: [
            /\b(how many|stats?|statistics?|seats? (left|available|remaining)|capacity|attendees?)\b/i,
            /\bregistration (count|numbers?|stats?)\b/i,
            /\bhow full\b/i,
        ],
        keywords: ['how many', 'stats', 'statistics', 'seats left', 'capacity', 'attendees', 'registration count'],
        weight: 1.0,
    },
    {
        intent: 'SCHEDULE',
        patterns: [
            /\b(add to schedule|create schedule|my calendar|schedule this)\b/i,
            /\bsave (to|in) (my )?(calendar|schedule)\b/i,
        ],
        keywords: ['add to schedule', 'create schedule', 'calendar', 'save to schedule'],
        weight: 1.0,
    },
    {
        intent: 'SIMILAR_EVENTS',
        patterns: [
            /\b(similar|like this|related|more (like|of these)|same (type|kind|category))\b/i,
        ],
        keywords: ['similar', 'like this', 'related events', 'same type', 'more like these'],
        weight: 1.0,
    },
    {
        intent: 'USER_PROFILE',
        patterns: [
            /\bmy (profile|interests?|history|activity|summary)\b/i,
            /\bwhat do you know about me\b/i,
        ],
        keywords: ['my profile', 'my interests', 'my history', 'what do you know'],
        weight: 1.0,
    },
    {
        intent: 'NAVIGATE',
        patterns: [
            /\b(go to|take me to|open|show me (the )?page|navigate to)\b/i,
        ],
        keywords: ['go to', 'take me to', 'open page', 'navigate to'],
        weight: 1.3,
    },
    {
        intent: 'HELP',
        patterns: [
            /\b(help|how do i|what can you|commands|capabilities|guide me)\b/i,
            /\bwhat (can|do) you (do|know|help)\b/i,
        ],
        keywords: ['help', 'how do I', 'what can you do', 'commands', 'guide', 'capabilities'],
        weight: 0.8,
    },
];

const CATEGORY_KEYWORDS = {
    technology: ['tech', 'technology', 'coding', 'programming', 'software', 'computer', 'ai', 'ml', 'data', 'cyber', 'hackathon', 'it', 'digital'],
    cultural: ['cultural', 'culture', 'art', 'music', 'dance', 'performance', 'festival', 'theatre', 'drama', 'fest'],
    sports: ['sports', 'sport', 'game', 'tournament', 'athletics', 'cricket', 'football', 'basketball', 'gym', 'fitness'],
    workshop: ['workshop', 'hands-on', 'practical', 'lab', 'training', 'bootcamp', 'session'],
    seminar: ['seminar', 'talk', 'lecture', 'speaker', 'presentation', 'conference', 'webinar', 'panel'],
    hackathon: ['hackathon', 'hack', 'build', 'innovate', 'competition', 'challenge', 'project'],
};

const DATE_PATTERNS = [
    { pattern: /\btoday\b/i, resolve: () => { const d = new Date(); return d.toISOString().split('T')[0]; } },
    { pattern: /\btomorrow\b/i, resolve: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; } },
    { pattern: /\bthis week\b/i, resolve: () => 'THIS_WEEK' },
    { pattern: /\bnext week\b/i, resolve: () => 'NEXT_WEEK' },
    { pattern: /\bthis weekend\b/i, resolve: () => 'THIS_WEEKEND' },
    { pattern: /\bthis month\b/i, resolve: () => 'THIS_MONTH' },
];

const PRONOUN_REFS = ['it', 'that one', 'that event', 'this event', 'the event', 'that'];

class CampusAIEngine {
    constructor() {
        this.contextMemory = [];
        this.lastMentionedEvent = null;
        this.userInterests = [];
        this.sessionData = { searchedCategories: [], viewedEvents: [], registeredInSession: [] };
    }

    parse(userMessage, currentPath = null) {
        const text = userMessage.trim();
        const intentResult = this._classifyIntent(text);
        const entities = this._extractEntities(text);
        const resolvedEntities = this._resolvePronouns(text, entities);
        const enrichedEntities = this._enrichFromMemory(resolvedEntities);
        this._updateSession(intentResult.intent, enrichedEntities);

        const parsed = {
            intent: intentResult.intent,
            intents: intentResult.intents,
            confidence: intentResult.confidence,
            entities: enrichedEntities,
            rawText: text,
            resolvedEvent: this.lastMentionedEvent,
            userInterests: [...this.userInterests],
            currentPath,
            needsClarification: intentResult.confidence < 0.4,
        };

        this._addToMemory('user', text, parsed);
        return parsed;
    }

    recordAssistantResponse(content, mentionedEvents = []) {
        this._addToMemory('assistant', content, {});
        if (mentionedEvents.length > 0) {
            this.lastMentionedEvent = mentionedEvents[0];
        }
    }

    clearMemory() {
        this.contextMemory = [];
        this.lastMentionedEvent = null;
    }

    _classifyIntent(text) {
        // Multi-intent splitting for JS engine
        const clauses = text.split(/\b(?:and|then|also)\b/i)
            .map(c => c.trim())
            .filter(c => c.length > 0 && !['and', 'then', 'also'].includes(c.toLowerCase()));
        
        const finalClauses = clauses.length > 0 ? clauses : [text];
        const intentsFound = [];
        const allScoresCombined = {};

        for (const clause of finalClauses) {
            const scores = {};
            for (const intentDef of INTENT_PATTERNS) {
                let score = 0;
                for (const pattern of intentDef.patterns) {
                    if (pattern.test(clause)) score += 2 * intentDef.weight;
                }
                const lowerText = clause.toLowerCase();
                for (const kw of intentDef.keywords) {
                    if (lowerText.includes(kw.toLowerCase())) score += 1 * intentDef.weight;
                }
                if (score > 0) scores[intentDef.intent] = score;
            }

            if (Object.keys(scores).length > 0) {
                const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
                const topIntent = sorted[0][0];
                const topScore = sorted[0][1];
                
                for (const [k, v] of Object.entries(scores)) {
                    allScoresCombined[k] = Math.max(allScoresCombined[k] || 0, v);
                }

                if (topScore > 0 && !intentsFound.includes(topIntent)) {
                    intentsFound.push(topIntent);
                }
            }
        }

        if (intentsFound.length === 0) return { intent: 'UNKNOWN', intents: ['UNKNOWN'], confidence: 0 };

        const topOverallScore = Math.max(...Object.values(allScoresCombined));
        const confidence = Math.min(topOverallScore / 10, 1);
        return { 
            intent: intentsFound[0], 
            intents: intentsFound,
            confidence, 
            allScores: allScoresCombined 
        };
    }

    _extractEntities(text) {
        const entities = { categories: [], dateRef: null, eventNameHint: null, numberRef: null, locationRef: null };
        const lower = text.toLowerCase();

        for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            if (keywords.some(kw => lower.includes(kw))) entities.categories.push(category);
        }

        for (const datePattern of DATE_PATTERNS) {
            if (datePattern.pattern.test(text)) { entities.dateRef = datePattern.resolve(); break; }
        }

        const numMatch = text.match(/\b(\d+)\b/);
        if (numMatch) entities.numberRef = parseInt(numMatch[1], 10);

        const quotedMatch = text.match(/["']([^"']+)["']/);
        if (quotedMatch) entities.eventNameHint = quotedMatch[1];

        const locationKeywords = ['auditorium', 'hall', 'room', 'campus', 'ground', 'lab', 'library'];
        for (const loc of locationKeywords) {
            if (lower.includes(loc)) { entities.locationRef = loc; break; }
        }

        return entities;
    }

    _resolvePronouns(text, entities) {
        const lower = text.toLowerCase();
        const hasPronounRef = PRONOUN_REFS.some(ref => lower.includes(ref));
        if (hasPronounRef && this.lastMentionedEvent && !entities.eventNameHint) {
            return { ...entities, resolvedEventId: this.lastMentionedEvent._id, resolvedEventTitle: this.lastMentionedEvent.title };
        }
        return entities;
    }

    _enrichFromMemory(entities) {
        if (entities.categories.length === 0 && this.contextMemory.length > 0) {
            const recentTurns = this.contextMemory.slice(-3);
            for (const turn of recentTurns.reverse()) {
                if (turn.parsedData?.entities?.categories?.length > 0) {
                    entities.inheritedCategory = turn.parsedData.entities.categories[0];
                    break;
                }
            }
        }
        return entities;
    }

    _updateSession(intent, entities) {
        if (intent === 'SEARCH_EVENTS' || intent === 'RECOMMEND') {
            entities.categories.forEach(cat => {
                if (!this.userInterests.includes(cat)) this.userInterests.push(cat);
                if (!this.sessionData.searchedCategories.includes(cat)) this.sessionData.searchedCategories.push(cat);
            });
        }
    }

    _addToMemory(role, content, parsedData) {
        this.contextMemory.push({ role, content, parsedData, timestamp: Date.now() });
        if (this.contextMemory.length > 10) this.contextMemory.shift();
    }

    getMemorySummary() {
        const facts = [];
        if (this.userInterests.length > 0) facts.push(`interests: ${this.userInterests.join(', ')}`);
        if (this.lastMentionedEvent) facts.push(`last event: ${this.lastMentionedEvent.title}`);
        if (this.sessionData.registeredInSession.length > 0) facts.push(`registered ${this.sessionData.registeredInSession.length} this session`);
        return facts;
    }

    getSuggestions(intent, hasEvents = false) {
        const map = {
            SEARCH_EVENTS: hasEvents ? ['Register for one', 'Show similar events', 'Check availability'] : ['Try another category', 'Show trending events', 'Recommend something'],
            REGISTER: ['View my events', 'Find similar events', 'Check my schedule'],
            MY_EVENTS: ['Add to schedule', 'Find more events', 'Show trending'],
            RECOMMEND: ['Register for one', 'Show more options', 'Filter by date'],
            TRENDING: ['Show tech events', 'Register for top one', 'Recommend for me'],
            ANALYTICS: ['Show event details', 'Find events with seats', 'Register me'],
            HELP: ['Find events', 'Register for an event', 'Show trending events'],
            UNKNOWN: ['Find events', 'Help me register', 'Show trending events'],
        };
        return (map[intent] || map['UNKNOWN']).slice(0, 3);
    }
}

const campusAI = new CampusAIEngine();
export default campusAI;
export { CampusAIEngine };
