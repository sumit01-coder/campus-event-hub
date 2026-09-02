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
    /**
     * Main entry — routes parsed intent to the right tool chain.
     * Returns { response: string, events: [], rawResults: {} }
     */
    async execute(parsed) {
        const { intent, entities, resolvedEvent, userInterests } = parsed;
        const ctx = { intent, entities, resolvedEvent, userInterests };

        try {
            switch (intent) {
                case 'SEARCH_EVENTS':  return await this._handleSearch(ctx);
                case 'REGISTER':       return await this._handleRegister(ctx);
                case 'CANCEL_REGISTRATION': return await this._handleCancel(ctx);
                case 'MY_EVENTS':      return await this._handleMyEvents(ctx);
                case 'RECOMMEND':      return await this._handleRecommend(ctx);
                case 'TRENDING':       return await this._handleTrending(ctx);
                case 'ANALYTICS':      return await this._handleAnalytics(ctx);
                case 'SCHEDULE':       return await this._handleSchedule(ctx);
                case 'SIMILAR_EVENTS': return await this._handleSimilar(ctx);
                case 'USER_PROFILE':   return await this._handleProfile(ctx);
                case 'CREATE_EVENT':   return await this._handleCreateEvent(ctx);
                case 'HELP':           return this._handleHelp();
                default:               return this._handleUnknown(parsed.rawText);
            }
        } catch (error) {
            return { response: `I ran into an error: ${error.message}. Please try again.`, events: [], error: true };
        }
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

    _handleUnknown(text) {
        return {
            response: `I'm not quite sure what you mean by "${text}". I can help you find events, register for them, manage your schedule, get personalized recommendations, and even create events! Try saying "recommend some tech events" or "create a workshop tomorrow".`,
            events: []
        };
    }

    async _handleCreateEvent({ entities }) {
        const createTool = getTool('create_event');
        
        // Ensure user is organizer/admin (create_event tool will throw if not, but we can pre-check or just let it fail)
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            return {
                response: "You need to be logged in as an Organizer to create events.",
                events: []
            };
        }

        const title = entities.eventNameHint;
        const category = entities.categories[0];
        const date = entities.date_ref;
        const time = entities.time_ref;
        const location = entities.location_ref;
        const capacity = entities.number_ref;

        // Check for missing required fields for the AI
        const missing = [];
        if (!title) missing.push("title");
        if (!date) missing.push("date");
        if (!time) missing.push("time");
        
        if (missing.length > 0) {
            return {
                response: `I'd love to help you create that event! I'm just missing the **${missing.join(', ')}**.\nCould you provide those details? (e.g. "Create a tech meetup called Code Jam on October 15 at 10:00")`,
                events: []
            };
        }

        // Construct event payload
        const eventPayload = {
            title,
            description: `Auto-generated event: ${title}`,
            category: category || "other",
            date,
            start_time: time,
            end_time: time, // Default to same, user can edit later
            location: location || "TBD",
            capacity: capacity || 100,
            participationType: "individual",
            isPaid: false,
            price: 0
        };

        try {
            const result = await createTool.execute(eventPayload);
            if (result.success) {
                return {
                    response: `🎉 **Success!** I've created the event **${title}** on ${date} at ${time}.\nLocation: ${eventPayload.location}\nCapacity: ${eventPayload.capacity}\n\nIt is now live and students can start registering!`,
                    events: [result.event]
                };
            } else {
                return {
                    response: `I tried to create the event, but encountered an error: ${result.message}`,
                    events: []
                };
            }
        } catch (error) {
             return {
                response: `Failed to create event: ${error.message}`,
                events: []
            };
        }
    }
}

const orchestrator = new WebMCPOrchestrator();
export default orchestrator;
