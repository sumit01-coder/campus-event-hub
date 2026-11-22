/**
 * WebMCP Orchestrator v2
 * =======================
 * Takes parsed AI intent + entities, decides which tools to call,
 * chains them, and returns a structured result for the AI to summarize.
 *
 * Python Bridge Integration:
 *   - SEARCH_EVENTS → Python TF-IDF /rank for better relevance sorting
 *   - RECOMMEND     → Python cosine-similarity /recommend
 *   - Both fall back to JS tool calls if Python is offline.
 */
import webMCPManager from './WebMCPManager';
import { pythonBridge } from '../ai/CampusAIEngine';

const getTools = () => window.document.modelContext.getTools();
const getTool = (name) => getTools().find(t => t.name === name);

class WebMCPOrchestrator {
    constructor() {
        this.activeTask = null; // Used for multi-turn form filling
    }

    /**
     * Main entry — routes parsed intent to the right tool chain.
     * Returns { response: string, events: [], rawResults: {} }
     */
    async execute(parsed) {
        // Intercept if we are in the middle of a multi-turn task
        if (this.activeTask) {
            return await this._handleActiveTask(parsed);
        }

        const intents = parsed.intents && parsed.intents.length > 0 ? parsed.intents : [parsed.intent];
        let combinedResponse = "";
        let combinedEvents = [];
        let combinedError = false;

        for (const intent of intents) {
            const ctx = { intent, entities: parsed.entities, resolvedEvent: parsed.resolvedEvent, userInterests: parsed.userInterests };
            let result;
            try {
                switch (intent) {
                    case 'SEARCH_EVENTS':  result = await this._handleSearch(ctx); break;
                    case 'REGISTER':       result = await this._handleRegister(ctx); break;
                    case 'CANCEL_REGISTRATION': result = await this._handleCancel(ctx); break;
                    case 'MY_EVENTS':      result = await this._handleMyEvents(ctx); break;
                    case 'HOSTED_EVENTS':  result = await this._handleHostedEvents(); break;
                    case 'RECOMMEND':      result = await this._handleRecommend(ctx); break;
                    case 'TRENDING':       result = await this._handleTrending(ctx); break;
                    case 'ANALYTICS':      result = await this._handleAnalytics(ctx); break;
                    case 'SCHEDULE':       result = await this._handleSchedule(ctx); break;
                    case 'SIMILAR_EVENTS': result = await this._handleSimilar(ctx); break;
                    case 'USER_PROFILE':   result = await this._handleProfile(ctx); break;
                    case 'CREATE_EVENT':   result = await this._handleCreateEvent(ctx); break;
                    case 'NAVIGATE':       result = await this._handleNavigate(parsed); break;
                    case 'HELP':           result = this._handleHelp(); break;
                    case 'UNKNOWN':
                    default:               result = this._handleUnknown(parsed.rawText); break;
                }
                
                if (result.response) {
                    combinedResponse += (combinedResponse ? "\n\n" : "") + result.response;
                }
                if (result.events) {
                    combinedEvents = [...combinedEvents, ...result.events];
                }
                if (result.error) combinedError = true;

            } catch (error) {
                combinedResponse += (combinedResponse ? "\n\n" : "") + `I ran into an error processing a step: ${error.message}.`;
                combinedError = true;
            }
        }

        // Deduplicate events by _id if multiple intents return the same event
        const uniqueEvents = Array.from(new Map(combinedEvents.map(e => [e._id, e])).values());

        return { 
            response: combinedResponse || "I couldn't process that request.", 
            events: uniqueEvents, 
            error: combinedError 
        };
    }

    async _handleSearch({ entities }) {
        const searchTool = getTool('search_events');
        const category = entities.categories[0] || entities.inheritedCategory || '';
        const queryText = entities.eventNameHint || category || 'events';

        let rankedEvents = null;
        let usedPython = false;

        // Try Python TF-IDF ranking first
        try {
            if (await pythonBridge.isAvailable()) {
                const pyResult = await pythonBridge.rankEvents(queryText, 10);
                rankedEvents = (pyResult.ranked_events || []).filter(e => new Date(e.date) >= new Date());
                usedPython = true;
            }
        } catch {
            // Python offline — fall through to JS
        }

        // JS fallback
        if (!rankedEvents || rankedEvents.length === 0) {
            const events = await searchTool.execute({ query: queryText, category });
            rankedEvents = (events || []).filter(e => new Date(e.date) >= new Date());
        }

        if (!rankedEvents.length) {
            return {
                response: `I couldn't find any upcoming events${category ? ` in **${category}**` : ''}. Try a different category or check back later.`,
                events: [],
            };
        }

        const eventList = rankedEvents.slice(0, 5).map(e => {
            const d = new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const score = e._relevance_score ? ` _(relevance: ${(e._relevance_score * 100).toFixed(0)}%)_` : '';
            return `- **${e.title}** — ${d} at ${e.time || 'TBD'}, ${e.venue || 'TBD'}${score}`;
        }).join('\n');

        const engine = usedPython ? ' _(ranked by Python TF-IDF)_' : '';
        return {
            response: `I found **${rankedEvents.length}** upcoming event(s)${category ? ` in **${category}**` : ''}${engine}:\n\n${eventList}\n\nWould you like to register for one, or should I check availability?`,
            events: rankedEvents.slice(0, 5),
        };
    }

    async _handleRegister({ entities, resolvedEvent }) {
        const eventId = entities.resolvedEventId || (resolvedEvent?._id);
        
        if (!eventId) {
            // No specific event — show list to pick from
            const searchTool = getTool('search_events');
            const category = entities.categories[0] || '';
            const events = await searchTool.execute({ category });
            const upcoming = (events || []).filter(e => new Date(e.date) >= new Date()).slice(0, 5);
            
            if (!upcoming.length) {
                return { response: "I couldn't find any events to register for. Try searching first!", events: [] };
            }

            return {
                response: `Which event would you like to register for? Here are some upcoming options:`,
                events: upcoming,
                awaitingSelection: true,
            };
        }

        const regTool = getTool('register_for_event');
        const result = await regTool.execute({ event_id: eventId });

        if (result.success) {
            // Also check availability after registration
            try {
                const analyticsTool = getTool('get_event_analytics');
                const analytics = await analyticsTool.execute({ event_id: eventId });
                return {
                    response: `✅ **Registration successful!**\n\nYou're in for **${analytics.event_title}**. There are **${analytics.available_seats}** seats remaining (${analytics.fill_rate_percent}% full). Check your dashboard for your pass!`,
                    events: [],
                };
            } catch {
                return { response: `✅ **Registration successful!** Check your dashboard for your pass.`, events: [] };
            }
        } else {
            return { response: `❌ Registration failed: ${result.message}`, events: [] };
        }
    }

    async _handleCancel({ entities, resolvedEvent }) {
        const eventId = entities.resolvedEventId || resolvedEvent?._id;
        if (!eventId) {
            const myEventsTool = getTool('get_my_events');
            const myEvents = await myEventsTool.execute({});
            if (!myEvents.length) return { response: "You have no registered events to cancel.", events: [] };

            return {
                response: "Which registration would you like to cancel? Here are your current events:",
                events: myEvents.map(r => r.eventId).filter(Boolean),
                awaitingSelection: true,
                action: 'cancel',
            };
        }

        const cancelTool = getTool('cancel_registration');
        await cancelTool.execute({ event_id: eventId });
        return { response: `✅ Your registration has been cancelled successfully.`, events: [] };
    }

    async _handleMyEvents() {
        const myEventsTool = getTool('get_my_events');
        const profileTool = getTool('get_user_profile_summary');

        const [myEvents, profile] = await Promise.all([
            myEventsTool.execute({}),
            profileTool.execute({}).catch(() => null),
        ]);

        if (!myEvents.length) {
            return { response: "You haven't registered for any events yet. Want me to find some for you?", events: [] };
        }

        const today = new Date();
        const upcoming = myEvents.filter(r => r.date && new Date(r.date) >= today);
        const past = myEvents.filter(r => r.date && new Date(r.date) < today);

        let response = `📅 **Your Events Summary**\n\n`;
        response += `You have **${upcoming.length}** upcoming and **${past.length}** past event(s).\n`;

        if (upcoming.length > 0) {
            response += `\n**Upcoming:**\n`;
            upcoming.slice(0, 3).forEach(r => {
                const d = new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                response += `- **${r.title}** on ${d}\n`;
            });
        }

        if (past.length > 0) {
            response += `\n**Past:**\n`;
            past.slice(0, 3).forEach(r => {
                const d = new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                response += `- **${r.title}** on ${d}\n`;
            });
        }

        if (profile?.inferred_interests?.length > 0) {
            response += `\n🎯 Based on your history, you seem to enjoy: **${profile.inferred_interests.join(', ')}**`;
        }

        return { response, events: upcoming.slice(0, 3) };
    }

    async _handleHostedEvents() {
        const hostedTool = getTool('get_hosted_events');
        
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            return { response: "You need to be logged in as an Organizer to view hosted events.", events: [] };
        }

        try {
            const hostedEvents = await hostedTool.execute({});
            if (!hostedEvents || hostedEvents.length === 0) {
                return { response: "You haven't hosted any events yet. Want to create one?", events: [] };
            }

            let response = `👑 **Your Hosted Events**\n\nYou have hosted **${hostedEvents.length}** event(s).\n\n`;
            
            hostedEvents.slice(0, 5).forEach(e => {
                const d = new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                response += `- **${e.title}** on ${d} (Capacity: ${e.capacity})\n`;
            });
            
            return { response, events: hostedEvents.slice(0, 5) };
        } catch (err) {
            return { response: "Failed to fetch hosted events. Please make sure you are logged in.", events: [] };
        }
    }

    async _handleRecommend({ entities, userInterests }) {
        const category = entities.categories[0] || entities.inheritedCategory || userInterests[0] || '';
        const registeredCategories = userInterests;

        let recommended = null;
        let usedPython = false;

        // Try Python cosine-similarity recommendations
        try {
            if (await pythonBridge.isAvailable()) {
                const pyResult = await pythonBridge.recommend(
                    category ? [category, ...userInterests] : userInterests,
                    registeredCategories,
                    6
                );
                recommended = (pyResult.recommended_events || []).filter(e => new Date(e.date) >= new Date());
                usedPython = true;
            }
        } catch {
            // Fallback to JS recommend tool
        }

        if (!recommended || recommended.length === 0) {
            const recTool = getTool('recommend_events');
            try {
                const recs = await recTool.execute({ category, interest: category });
                recommended = (recs?.events || recs || []).filter(e => new Date(e.date) >= new Date());
            } catch {
                recommended = [];
            }
        }

        if (!recommended.length) {
            return { response: "I don't have specific recommendations right now, but let me show you what's trending!", events: [] };
        }

        const eventList = recommended.slice(0, 4).map(e => {
            const d = new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const score = e._recommendation_score ? ` _(match: ${(e._recommendation_score * 100).toFixed(0)}%)_` : '';
            return `- **${e.title}** (${e.category}) — ${d}${score}`;
        }).join('\n');

        const engine = usedPython ? ' _(ranked by Python AI)_' : '';
        return {
            response: `🌟 **Recommended for you**${category ? ` (${category})` : ''}${engine}:\n\n${eventList}\n\nWant to register for any of these?`,
            events: recommended.slice(0, 4),
        };
    }

    async _handleTrending() {
        const trendingTool = getTool('get_trending_events');
        const events = await trendingTool.execute({ limit: 5 });

        if (!events.length) {
            return { response: "No trending events right now. Check back later!", events: [] };
        }

        const list = events.map((e, i) => {
            const d = new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const seats = e.capacity ? ` · ${e.registeredCount || 0}/${e.capacity} registered` : '';
            return `${i + 1}. **${e.title}** — ${d}${seats}`;
        }).join('\n');

        return {
            response: `🔥 **Trending Events Right Now**\n\n${list}\n\nWant to register for the top one?`,
            events,
        };
    }

    async _handleAnalytics({ entities, resolvedEvent }) {
        const eventId = entities.resolvedEventId || resolvedEvent?._id;

        if (!eventId) {
            // Find the event by name hint
            const searchTool = getTool('search_events');
            const query = entities.eventNameHint || '';
            const events = await searchTool.execute({ query });
            if (!events.length) return { response: "Which event would you like analytics for? Please mention the event name.", events: [] };

            const analyticsForFirst = await getTool('get_event_analytics').execute({ event_id: events[0]._id });
            return this._formatAnalytics(analyticsForFirst);
        }

        const analytics = await getTool('get_event_analytics').execute({ event_id: eventId });
        return this._formatAnalytics(analytics);
    }

    _formatAnalytics(a) {
        const bar = this._progressBar(a.fill_rate_percent);
        const statusEmoji = a.status === 'FULL' ? '🔴' : a.status === 'ALMOST_FULL' ? '🟡' : '🟢';

        return {
            response: `📊 **Analytics: ${a.event_title}**\n\n${bar} ${a.fill_rate_percent}% Full\n\n- **Capacity:** ${a.capacity}\n- **Registered:** ${a.registered}\n- **Seats Left:** ${a.available_seats}\n- **Status:** ${statusEmoji} ${a.status.replace('_', ' ')}`,
            events: [],
        };
    }

    _progressBar(percent) {
        const filled = Math.round(percent / 10);
        return '█'.repeat(filled) + '░'.repeat(10 - filled);
    }

    async _handleSchedule({ resolvedEvent }) {
        const myEventsTool = getTool('get_my_events');
        const scheduleTool = getTool('create_schedule');

        const myEvents = await myEventsTool.execute({});
        if (!myEvents.length) return { response: "You have no registered events to add to schedule.", events: [] };

        const eventId = resolvedEvent?._id || myEvents[0]?.eventId?._id;
        if (!eventId) return { response: "I couldn't find an event to schedule. Please register for an event first.", events: [] };

        const result = await scheduleTool.execute({ event_id: eventId });
        if (result.success) {
            return { response: `📅 Added to your schedule! I'll make sure you don't have any conflicts.`, events: [] };
        } else {
            return { response: `⚠️ Couldn't add to schedule: ${result.message}`, events: [] };
        }
    }

    async _handleSimilar({ entities, resolvedEvent }) {
        const similarTool = getTool('suggest_similar_events');
        const eventId = entities.resolvedEventId || resolvedEvent?._id;
        const category = entities.categories[0] || entities.inheritedCategory;

        const similar = await similarTool.execute({ event_id: eventId, category });

        if (!similar.length) {
            return { response: "I couldn't find similar events right now. Try searching by category instead!", events: [] };
        }

        const list = similar.map(e => {
            const d = new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return `- **${e.title}** (${e.category}) — ${d}`;
        }).join('\n');

        return {
            response: `🔗 **Similar Events You Might Like**:\n\n${list}`,
            events: similar,
        };
    }

    async _handleProfile() {
        const profileTool = getTool('get_user_profile_summary');
        const profile = await profileTool.execute({});

        let response = `👤 **Your Profile Summary**\n\n`;
        response += `**Name:** ${profile.name}\n`;
        response += `**Total Registrations:** ${profile.total_registrations}\n`;

        if (profile.upcoming_events.length > 0) {
            response += `\n**Upcoming Events:** ${profile.upcoming_events.length}\n`;
            profile.upcoming_events.slice(0, 3).forEach(e => {
                const d = new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                response += `- ${e.title} (${d})\n`;
            });
        }

        if (profile.inferred_interests.length > 0) {
            response += `\n🎯 **Your Interests:** ${profile.inferred_interests.join(', ')}`;
        }

        return { response, events: [] };
    }

    _handleHelp() {
        return {
            response: `🤖 **CampusAI v2 — What I Can Do**\n\n` +
                `- 🔍 **Find Events** — "show me tech events", "events this week"\n` +
                `- 📝 **Register** — "register me for that", "sign me up for the workshop"\n` +
                `- 🔥 **Trending** — "what's popular?", "trending events"\n` +
                `- 🌟 **Recommend** — "suggest something for me", "I like technology"\n` +
                `- 📊 **Analytics** — "how many seats left?", "stats for that event"\n` +
                `- 🔗 **Similar Events** — "show me more like this"\n` +
                `- 📅 **My Schedule** — "my events", "what am I attending?"\n` +
                `- 👤 **My Profile** — "my profile", "what do you know about me"\n\n` +
                `I understand natural language — just ask me anything!`,
            events: [],
        };
    }

    async _handleNavigate(parsed) {
        const text = parsed.rawText.toLowerCase();
        let targetPath = null;
        let pageName = "";

        if (text.includes("dashboard") || text.includes("profile")) {
            targetPath = "/dashboard";
            pageName = "Dashboard";
        } else if (text.includes("home")) {
            targetPath = "/";
            pageName = "Home";
        } else if (text.includes("event") || text.includes("explore")) {
            targetPath = "/events";
            pageName = "Events";
        } else if (text.includes("admin") || text.includes("organizer")) {
            targetPath = "/admin";
            pageName = "Admin";
        } else if (text.includes("help") || text.includes("support")) {
            targetPath = "/help";
            pageName = "Help Center";
        } else if (text.includes("setting")) {
            targetPath = "/settings";
            pageName = "Settings";
        } else if (text.includes("badge")) {
            targetPath = "/badges";
            pageName = "Badges";
        } else if (text.includes("hackathon")) {
            targetPath = "/my-hackathons";
            pageName = "My Hackathons";
        } else if (text.includes("host event") || text.includes("create event")) {
            targetPath = "/host";
            pageName = "Host Event";
        } else if (text.includes("hosted event")) {
            targetPath = "/hosted-events";
            pageName = "Hosted Events";
        } else if (text.includes("pricing") || text.includes("cost")) {
            targetPath = "/pricing";
            pageName = "Pricing";
        } else if (text.includes("feature")) {
            targetPath = "/features";
            pageName = "Features";
        } else if (text.includes("guideline") || text.includes("rules")) {
            targetPath = "/guidelines";
            pageName = "Guidelines";
        } else if (text.includes("api") || text.includes("docs")) {
            targetPath = "/api";
            pageName = "API Documentation";
        } else if (text.includes("blog")) {
            targetPath = "/blog";
            pageName = "Blog";
        } else if (text.includes("about")) {
            targetPath = "/about";
            pageName = "About Us";
        } else if (text.includes("contact")) {
            targetPath = "/contact";
            pageName = "Contact Us";
        } else if (text.includes("career") || text.includes("job")) {
            targetPath = "/careers";
            pageName = "Careers";
        } else if (text.includes("privacy")) {
            targetPath = "/privacy";
            pageName = "Privacy Policy";
        } else if (text.includes("term")) {
            targetPath = "/terms";
            pageName = "Terms of Service";
        } else if (text.includes("cookie")) {
            targetPath = "/cookies";
            pageName = "Cookie Policy";
        }

        if (targetPath) {
            if (parsed.currentPath === targetPath) {
                return { response: `You are already on the **${pageName}** page!`, events: [] };
            }
            const navTool = getTool('navigate_to');
            await navTool.execute({ path: targetPath });
            return { response: `Navigating you to **${pageName}**... 🚀`, events: [] };
        } else {
            return { response: "I'm not sure which page you want to go to. Try saying 'Go to my dashboard' or 'Open events'.", events: [] };
        }
    }

    _handleUnknown(text) {
        return {
            response: `I'm not quite sure what you mean by "${text}". I can help you find events, register for them, manage your schedule, get personalized recommendations, and even create events! Try saying "recommend some tech events" or "create a workshop tomorrow".`,
            events: []
        };
    }

    async _handleCreateEvent({ entities, intent, rawText }) {
        const title = entities.eventNameHint || entities.event_name_hint || '';
        const category = entities.categories?.[0] || entities.inheritedCategory || '';
        const date = entities.dateRef || entities.date_ref || '';
        const time = entities.timeRef || entities.time_ref || '';
        const venue = entities.locationRef || entities.location_ref || '';
        const capacity = entities.numberRef || entities.number_ref || '';

        // Start collecting data
        this.activeTask = {
            type: 'CREATE_EVENT',
            data: { title, category, date, time, venue, capacity },
            step: null
        };

        return await this._progressCreateEventTask();
    }

    async _handleActiveTask(parsed) {
        if (this.activeTask.type === 'CREATE_EVENT') {
            // Check if user wants to cancel
            if (parsed.intent === 'CANCEL_REGISTRATION' || parsed.rawText.toLowerCase().includes('cancel') || parsed.rawText.toLowerCase().includes('stop')) {
                this.activeTask = null;
                return { response: "Event creation cancelled. What else can I help you with?", events: [] };
            }

            // Merge new entities into the active task data
            const e = parsed.entities;
            const data = this.activeTask.data;
            
            if (this.activeTask.step === 'DATE_TIME') {
                if (e.dateRef || e.date_ref) data.date = e.dateRef || e.date_ref;
                if (e.timeRef || e.time_ref) data.time = e.timeRef || e.time_ref;
            } else if (this.activeTask.step === 'VENUE') {
                // For venue, NLP might not extract location perfectly, so we take the raw text if no locationRef
                data.venue = e.locationRef || e.location_ref || parsed.rawText;
            }

            return await this._progressCreateEventTask();
        }

        // Fallback clear
        this.activeTask = null;
        return { response: "Task cancelled.", events: [] };
    }

    async _progressCreateEventTask() {
        const data = this.activeTask.data;

        // Prompt for missing fields sequentially
        if (!data.date || !data.time) {
            this.activeTask.step = 'DATE_TIME';
            return {
                response: `I'd love to set that up! What **date and time** will this take place?`,
                events: []
            };
        }

        if (!data.venue) {
            this.activeTask.step = 'VENUE';
            return {
                response: `Got it! And where is the **venue** for this event?`,
                events: []
            };
        }

        // All fields collected! Auto-fill!
        const description = data.title ? `Auto-generated event setup for: ${data.title}` : '';
        
        const navTool = getTool('navigate_to');
        if (navTool) {
            await navTool.execute({ path: '/host' });
        }

        const fillTool = getTool('fill_event_form');
        if (fillTool) {
            await new Promise(resolve => setTimeout(resolve, 500));
            await fillTool.execute({
                title: data.title,
                description,
                category: data.category,
                date: data.date,
                time: data.time,
                venue: data.venue,
                capacity: data.capacity,
            });
            
            this.activeTask = null; // Clear state
            
            return {
                response: `🚀 I've opened the **Create Event** page and auto-filled the form with the details we discussed!\n\nPlease review, add any images or custom questions, and click **Publish Event** when you're ready!`,
                events: []
            };
        }

        this.activeTask = null;
        return {
            response: `I tried to help you set up the event, but the auto-fill tool is currently unavailable.`,
            events: []
        };
    }
}

const orchestrator = new WebMCPOrchestrator();
export default orchestrator;
