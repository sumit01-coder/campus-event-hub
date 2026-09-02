import api from '../services/api';

class WebMCPManager {
    constructor() {
        this.tools = new Map();
        this.listeners = [];
        this.setupModelContext();
        this.registerCoreTools();
    }

    setupModelContext() {
        if (typeof window !== 'undefined') {
            window.document.modelContext = window.document.modelContext || {
                registerTool: (tool) => this.registerTool(tool),
                getTools: () => Array.from(this.tools.values())
            };
        }
    }

    registerTool(tool) {
        // Intercept execute to add logging and human-in-the-loop confirmation
        const originalExecute = tool.execute;
        
        tool.execute = async (input) => {
            this.emitEvent('tool_start', { name: tool.name, input });
            
            try {
                // For destructive actions, we would inject a confirmation modal here.
                // In a hackathon demo, we might mock this or implement a callback system.
                // For now, we execute directly.
                const result = await originalExecute(input);
                this.emitEvent('tool_success', { name: tool.name, input, result });
                return result;
            } catch (error) {
                this.emitEvent('tool_error', { name: tool.name, input, error: error.message });
                throw error;
            }
        };

        this.tools.set(tool.name, tool);
    }

    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    emitEvent(type, payload) {
        this.listeners.forEach(cb => cb({ type, ...payload, timestamp: new Date() }));
    }

    // This method registers all 10 required tools
    registerCoreTools() {
        // 1. search_events
        this.registerTool({
            name: "search_events",
            description: "Search campus events using keywords, categories, dates, locations, and times.",
            inputSchema: {
                type: "object",
                properties: {
                    query: { type: "string" },
                    category: { type: "string" },
                    date: { type: "string" },
                    location: { type: "string" }
                }
            },
            execute: async (input) => {
                const params = new URLSearchParams();
                if (input.query) params.append('search', input.query); // assuming backend supports search or we filter client-side
                if (input.category) params.append('category', input.category);
                // Currently backend GET /api/events doesn't take all these filters directly, but for demo we can fetch all and filter locally, or pass them if backend supports them.
                const { data } = await api.get('/events');
                let events = data.events || data;
                if (input.category) {
                    events = events.filter(e => e.category.toLowerCase() === input.category.toLowerCase());
                }
                if (input.query) {
                    const q = input.query.toLowerCase();
                    events = events.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
                }
                return events;
            }
        });

        // 2. get_event_details
        this.registerTool({
            name: "get_event_details",
            description: "Get detailed information about a specific event.",
            inputSchema: {
                type: "object",
                properties: { event_id: { type: "string" } }
            },
            execute: async ({ event_id }) => {
                const { data } = await api.get(`/events/${event_id}`);
                return data;
            }
        });

        // 3. check_event_availability
        this.registerTool({
            name: "check_event_availability",
            description: "Check the current capacity and registration availability for an event.",
            inputSchema: {
                type: "object",
                properties: { event_id: { type: "string" } }
            },
            execute: async ({ event_id }) => {
                const { data } = await api.get(`/events/${event_id}/availability`);
                return data;
            }
        });

        // 4. register_for_event
        this.registerTool({
            name: "register_for_event",
            description: "Register the current student for an event. Will return success or failure based on capacity.",
            inputSchema: {
                type: "object",
                properties: { event_id: { type: "string" } }
            },
            execute: async ({ event_id }) => {
                // Must be logged in as user
                const userString = localStorage.getItem('user');
                if (!userString) throw new Error("User not authenticated.");
                const user = JSON.parse(userString);
                
                try {
                    const { data } = await api.post('/registrations', {
                        eventId: event_id,
                        participantName: user.name,
                        email: user.email,
                        phone: user.phone || '0000000000'
                    });
                    return { success: true, event_id, registration_id: data._id, message: "Registration successful" };
                } catch (error) {
                    return { success: false, error: "REGISTRATION_FAILED", message: error.response?.data?.message || error.message };
                }
            }
        });

        // 5. cancel_registration
        this.registerTool({
            name: "cancel_registration",
            description: "Cancel the user's registration for an event.",
            inputSchema: {
                type: "object",
                properties: { event_id: { type: "string" } }
            },
            execute: async ({ event_id }) => {
                const { data } = await api.delete(`/registrations/${event_id}`);
                return data;
            }
        });

        // 6. get_my_events
        this.registerTool({
            name: "get_my_events",
            description: "Return all events registered by the current student.",
            inputSchema: { type: "object", properties: {} },
            execute: async () => {
                const { data } = await api.get('/registrations/my-registrations');
                return data;
            }
        });

        // 7. recommend_events
        this.registerTool({
            name: "recommend_events",
            description: "Accept interest, date, category and return suitable events based on actual event data.",
            inputSchema: {
                type: "object",
                properties: {
                    interest: { type: "string" },
                    date: { type: "string" },
                    available_time: { type: "string" },
                    category: { type: "string" }
                }
            },
            execute: async (input) => {
                const { data } = await api.post('/events/recommend', input);
                return data;
            }
        });

        // 8. create_schedule
        this.registerTool({
            name: "create_schedule",
            description: "Allow the agent to create a student's event schedule from selected events. The system detects overlapping events.",
            inputSchema: {
                type: "object",
                properties: { event_id: { type: "string" } }
            },
            execute: async ({ event_id }) => {
                try {
                    const { data } = await api.post('/schedules', { eventId: event_id });
                    return { success: true, data };
                } catch (error) {
                    return { success: false, error: "SCHEDULE_CONFLICT", message: error.response?.data?.message || error.message };
                }
            }
        });

        // 9. create_event (Organizer only)
        this.registerTool({
            name: "create_event",
            description: "Organizer-only tool. Validate all fields before creating the event.",
            inputSchema: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    category: { type: "string" },
                    date: { type: "string" },
                    start_time: { type: "string" },
                    end_time: { type: "string" },
                    location: { type: "string" },
                    capacity: { type: "number" },
                    registration_required: { type: "boolean" }
                }
            },
            execute: async (input) => {
                // Ensure auth as admin
                const adminString = localStorage.getItem('adminToken');
                if (!adminString) throw new Error("Unauthorized. Organizer access required.");
                
                try {
                    const { data } = await api.post('/events', {
                        title: input.title,
                        description: input.description,
                        category: input.category || 'other',
                        date: input.date || new Date().toISOString(),
                        time: input.start_time || '10:00',
                        venue: input.location || 'TBA',
                        capacity: input.capacity || 100,
                        images: ['/uploads/default-event.jpg'], // default image
                        isPaid: false,
                        price: 0
                    }, {
                        headers: { Authorization: `Bearer ${JSON.parse(adminString).token}` }
                    });
                    return { success: true, event: data };
                } catch (error) {
                    return { success: false, error: "EVENT_CREATION_FAILED", message: error.response?.data?.message || error.message };
                }
            }
        });

        // 10. get_event_registrations (Organizer only)
        this.registerTool({
            name: "get_event_registrations",
            description: "Organizer-only. Return total_registrations, capacity, available_seats, attendees.",
            inputSchema: {
                type: "object",
                properties: { event_id: { type: "string" } }
            },
            execute: async ({ event_id }) => {
                const adminString = localStorage.getItem('adminToken');
                if (!adminString) throw new Error("Unauthorized. Organizer access required.");
                
                const authHeader = { headers: { Authorization: `Bearer ${JSON.parse(adminString).token}` } };
                
                const eventRes = await api.get(`/events/${event_id}`, authHeader);
                const regRes = await api.get(`/registrations/event/${event_id}`, authHeader);
                
                const event = eventRes.data;
                const registrations = regRes.data;
                
                return {
                    total_registrations: registrations.length,
                    capacity: event.capacity,
                    available_seats: Math.max(0, event.capacity - registrations.length),
                    attendees: registrations.map(r => ({ name: r.participantName, status: r.status }))
                };
            }
        });

        // ── NEW TOOLS (v2) ────────────────────────────────────────────────────

        // 11. get_trending_events
        this.registerTool({
            name: "get_trending_events",
            description: "Return campus events sorted by popularity (registration count, likes). Identifies what's hot right now.",
            inputSchema: { type: "object", properties: { limit: { type: "number" } } },
            execute: async ({ limit = 5 } = {}) => {
                const { data } = await api.get('/events');
                const events = (data.events || data);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return [...events]
                    .filter(e => new Date(e.date) >= today)
                    .sort((a, b) => {
                        const scoreA = (a.registeredCount || 0) + (a.likes?.length || 0) * 2;
                        const scoreB = (b.registeredCount || 0) + (b.likes?.length || 0) * 2;
                        return scoreB - scoreA;
                    })
                    .slice(0, limit);
            }
        });

        // 12. get_event_analytics
        this.registerTool({
            name: "get_event_analytics",
            description: "Get detailed analytics for a specific event: seat fill rate, percentage, seats remaining.",
            inputSchema: { type: "object", properties: { event_id: { type: "string" } } },
            execute: async ({ event_id }) => {
                const [eventRes, availRes] = await Promise.all([
                    api.get(`/events/${event_id}`),
                    api.get(`/events/${event_id}/availability`)
                ]);
                const event = eventRes.data;
                const avail = availRes.data;
                const registered = event.capacity - (avail.availableSeats ?? avail.available_seats ?? 0);
                const fillRate = event.capacity > 0 ? Math.round((registered / event.capacity) * 100) : 0;
                return {
                    event_title: event.title,
                    capacity: event.capacity,
                    registered,
                    available_seats: avail.availableSeats ?? avail.available_seats ?? 0,
                    fill_rate_percent: fillRate,
                    status: fillRate >= 100 ? 'FULL' : fillRate >= 80 ? 'ALMOST_FULL' : 'AVAILABLE',
                };
            }
        });

        // 13. suggest_similar_events
        this.registerTool({
            name: "suggest_similar_events",
            description: "Given a reference event ID or category, suggest similar upcoming events.",
            inputSchema: {
                type: "object",
                properties: {
                    event_id: { type: "string" },
                    category: { type: "string" }
                }
            },
            execute: async ({ event_id, category }) => {
                const { data } = await api.get('/events');
                const events = (data.events || data);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                let targetCategory = category;

                if (event_id && !targetCategory) {
                    const ref = events.find(e => e._id === event_id);
                    if (ref) targetCategory = ref.category;
                }

                const similar = events
                    .filter(e => new Date(e.date) >= today && e._id !== event_id)
                    .filter(e => !targetCategory || e.category?.toLowerCase() === targetCategory?.toLowerCase())
                    .slice(0, 4);

                return similar;
            }
        });

        // 14. get_user_profile_summary
        this.registerTool({
            name: "get_user_profile_summary",
            description: "Return a personalized summary for the current user: their name, registered events, upcoming events, interests.",
            inputSchema: { type: "object", properties: {} },
            execute: async () => {
                const userString = localStorage.getItem('user');
                if (!userString) throw new Error("User not authenticated.");
                const user = JSON.parse(userString);

                const { data: myRegs } = await api.get('/registrations/my-registrations');
                const today = new Date();

                const upcoming = myRegs
                    .filter(r => r.eventId && new Date(r.eventId.date) >= today)
                    .map(r => ({ title: r.eventId.title, date: r.eventId.date, venue: r.eventId.venue }));

                const past = myRegs
                    .filter(r => r.eventId && new Date(r.eventId.date) < today)
                    .map(r => ({ title: r.eventId.title, category: r.eventId.category }));

                const categoryFreq = {};
                past.forEach(r => {
                    if (r.category) categoryFreq[r.category] = (categoryFreq[r.category] || 0) + 1;
                });
                const interests = Object.entries(categoryFreq).sort((a,b) => b[1]-a[1]).slice(0,3).map(([cat]) => cat);

                return {
                    name: user.name,
                    email: user.email,
                    total_registrations: myRegs.length,
                    upcoming_events: upcoming,
                    past_events_count: past.length,
                    inferred_interests: interests,
                };
            }
        });

        // 15. multi_register
        this.registerTool({
            name: "multi_register",
            description: "Register the current user for multiple events at once. Returns success/failure for each.",
            inputSchema: {
                type: "object",
                properties: {
                    event_ids: { type: "array", items: { type: "string" } }
                }
            },
            execute: async ({ event_ids }) => {
                const userString = localStorage.getItem('user');
                if (!userString) throw new Error("User not authenticated.");
                const user = JSON.parse(userString);

                const results = [];
                for (const event_id of event_ids) {
                    try {
                        const { data } = await api.post('/registrations', {
                            eventId: event_id,
                            participantName: user.name,
                            email: user.email,
                            phone: user.phone || '0000000000'
                        });
                        results.push({ event_id, success: true, registration_id: data._id });
                    } catch (error) {
                        results.push({ event_id, success: false, message: error.response?.data?.message || error.message });
                    }
                }

                const successCount = results.filter(r => r.success).length;
                return {
                    total: event_ids.length,
                    successful: successCount,
                    failed: event_ids.length - successCount,
                    results,
                };
            }
        });
    }
}

// Export a singleton instance
const webMCPManager = new WebMCPManager();
export default webMCPManager;
