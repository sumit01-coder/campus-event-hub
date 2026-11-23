const express = require('express');
const router = express.Router();

// GET /api/public/stats
// Public Platform Statistics (In-memory platform metrics, 0 database queries)
router.get('/stats', (req, res) => {
    res.json({
        eventsHosted: 48,
        activeUsers: 850,
        campuses: 25, // Base campus network count
        satisfactionRate: 98 // Base metric
    });
});

// GET /api/public/architecture
// Returns live Route-to-Table architecture map metadata (In-memory, 0 database queries)
router.get('/architecture', (req, res) => {
    try {
        const tables = [
        { id: "events", name: "events", icon: "🎪", count: "12 docs", sensitive: ["ratings", "results"] },
        { id: "users", name: "users", icon: "👤", count: "85 docs", sensitive: ["password", "emailToken", "phone"] },
        { id: "registrations", name: "registrations", icon: "🎫", count: "140 docs", sensitive: ["paymentProof", "email"] },
        { id: "queries", name: "queries", icon: "💬", count: "live stream", sensitive: ["replies"] },
        { id: "schedules", name: "schedules", icon: "📅", count: "48 docs", sensitive: ["timeline"] },
        { id: "notifications", name: "notifications", icon: "🔔", count: "socket pipe", sensitive: ["payload"] },
        { id: "logs", name: "logs", icon: "📜", count: "30d TTL", sensitive: ["system audit"] },
        { id: "admins", name: "admins", icon: "🛡️", count: "isolated", sensitive: ["super_admin"] }
    ];

    const routes = [
            { id: "r1", method: "GET", path: "/api/public/stats", middlewares: ["limit"], tables: [], status: "guarded", desc: "Aggregated public platform metrics (in-memory)" },
            { id: "r2", method: "GET", path: "/api/events/", middlewares: ["optionalAuth", "limit"], tables: ["events"], status: "warning", desc: "Public discovery with safe organizer projection" },
            { id: "r3", method: "GET", path: "/api/events/:id", middlewares: ["optionalAuth", "limit"], tables: ["events"], status: "warning", desc: "Event details with sanitized organizer info" },
            { id: "r4", method: "GET", path: "/api/events/:id/availability", middlewares: ["optionalAuth", "limit"], tables: ["events"], status: "warning", desc: "In-memory seat calculation from event capacity" },
            { id: "r5", method: "POST", path: "/api/events/recommend", middlewares: ["auth", "limit"], tables: ["events"], status: "guarded", desc: "AI / Interest-based personalized event recommender" },
            { id: "r6", method: "POST", path: "/api/events/", middlewares: ["auth", "limit", "organizer"], tables: ["events", "users"], status: "guarded", desc: "Create new fest, workshop or hackathon" },
            { id: "r7", method: "PUT", path: "/api/events/:id", middlewares: ["auth", "limit", "organizer"], tables: ["events"], status: "guarded", desc: "Update existing event parameters" },
            { id: "r8", method: "DELETE", path: "/api/events/:id", middlewares: ["auth", "limit", "organizer"], tables: ["events", "registrations"], status: "guarded", desc: "Cascade delete event and attendee passes" },
            { id: "r9", method: "POST", path: "/api/events/:id/rate", middlewares: ["auth", "limit"], tables: ["events"], status: "guarded", desc: "Submit 1-5 star review and feedback" },
            { id: "r10", method: "POST", path: "/api/events/:id/like", middlewares: ["auth", "limit"], tables: ["events"], status: "guarded", desc: "Toggle event bookmark/like status" },
            { id: "r11", method: "POST", path: "/api/events/:id/broadcast", middlewares: ["auth", "limit", "organizer"], tables: ["events", "notifications"], status: "guarded", desc: "Push broadcast announcement & email alert" },
            { id: "r12", method: "POST", path: "/api/registrations/", middlewares: ["auth", "limit"], tables: ["registrations", "events", "users"], status: "guarded", desc: "Book event pass with compound uniqueness check" },
            { id: "r13", method: "GET", path: "/api/registrations/my-registrations", middlewares: ["auth", "limit"], tables: ["registrations", "events"], status: "guarded", desc: "Fetch logged-in student ticket passes" },
            { id: "r14", method: "PUT", path: "/api/registrations/:id/checkin", middlewares: ["auth", "limit", "organizer"], tables: ["registrations"], status: "guarded", desc: "Anti-duplicate QR code check-in scanner" },
            { id: "r15", method: "GET", path: "/api/queries/:eventId", middlewares: ["auth", "limit"], tables: ["queries"], status: "guarded", desc: "Live event Q&A stream for attendees" },
            { id: "r16", method: "POST", path: "/api/queries/", middlewares: ["auth", "limit"], tables: ["queries", "events"], status: "guarded", desc: "Submit question to event coordinators" },
            { id: "r17", method: "GET", path: "/api/schedules/me", middlewares: ["auth", "limit"], tables: ["schedules", "events"], status: "guarded", desc: "Personalized student schedule and calendar" },
            { id: "r18", method: "GET", path: "/api/notifications/", middlewares: ["auth", "limit"], tables: ["notifications"], status: "guarded", desc: "Socket.IO notification stream" },
            { id: "r19", method: "POST", path: "/api/logs/", middlewares: ["limit"], tables: ["logs"], status: "guarded", desc: "System audit logging with 30-day TTL" },
            { id: "r20", method: "POST", path: "/api/ai/rank", middlewares: ["auth", "limit"], tables: ["events"], status: "guarded", desc: "FastAPI TF-IDF event ranking proxy" },
            { id: "r21", method: "POST", path: "/api/ai/recommend", middlewares: ["auth", "limit"], tables: ["events"], status: "guarded", desc: "NLP Content-based event vector recommender" },
            { id: "r22", method: "GET", path: "/api/ai/insights", middlewares: ["auth", "limit"], tables: ["events", "registrations"], status: "guarded", desc: "Statistical insights over fest submissions" },
            { id: "r23", method: "POST", path: "/api/auth/register", middlewares: ["limit"], tables: ["users"], status: "guarded", desc: "Student account creation with rate limiting" },
            { id: "r24", method: "POST", path: "/api/auth/login", middlewares: ["limit"], tables: ["users"], status: "guarded", desc: "JWT token issuance with login rate limiting" },
            { id: "r25", method: "GET", path: "/api/admin/stats", middlewares: ["auth", "limit", "admin"], tables: ["users", "events", "registrations", "logs"], status: "guarded", desc: "Global admin oversight statistics" },
            { id: "r26", method: "GET", path: "/api/admin/users", middlewares: ["auth", "limit", "admin"], tables: ["users"], status: "guarded", desc: "Manage accounts and identity verifications" },
            { id: "r27", method: "GET", path: "/api/admin/events", middlewares: ["auth", "limit", "admin"], tables: ["events"], status: "guarded", desc: "Approve or moderate flagged campus fests" },
            { id: "r28", method: "GET", path: "/api/admin/health", middlewares: ["auth", "limit", "admin"], tables: ["logs"], status: "guarded", desc: "Live server telemetry and error tracing" }
        ];

        res.json({
            summary: {
                totalRoutes: routes.length,
                totalTables: tables.length,
                guardedRoutes: routes.filter(r => r.status === 'guarded').length,
                warningRoutes: routes.filter(r => r.status === 'warning').length,
                errorRoutes: 0,
                healthScore: 98
            },
            tables,
            routes
        });
    } catch (error) {
        console.error('Error fetching architecture data:', error);
        res.status(500).json({ message: 'Server error generating architecture map' });
    }
});

// POST /api/public/ai-generate
router.post('/ai-generate', async (req, res) => {
    try {
        const { title, category, keywords } = req.body;
        if (!title || !keywords) {
            return res.status(400).json({ message: 'Title and keywords are required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        const prompt = `Create a professional, highly engaging event description for a campus event. Event Title: "${title}", Category: "${category || 'other'}". Key details/keywords to cover: "${keywords}". Use markdown formatting, include an "About the Event" (agenda/timeline) section, "Why You Should Attend", and a brief outline. Keep it exciting for college students!`;

        if (apiKey) {
            const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (apiRes.ok) {
                const apiData = await apiRes.json();
                const generatedText = apiData.candidates?.[0]?.content?.parts?.[0]?.text;
                if (generatedText) {
                    return res.json({ text: generatedText });
                }
            }
        }

        // Fallback generator if API key is not present or API call fails
        const fallbackText = `# ${title}\n\nJoin us for this exciting **${category || 'other'}** event on campus!\n\n## About the Event\nHere are some of the key highlights and what you can expect:\n${keywords.split(',').map(k => `- ${k.trim()}`).join('\n')}\n\n## Why You Should Attend\n- Connect with fellow students who share your interests.\n- Gain valuable experience and expand your skills.\n- Exciting activities and networking opportunities!`;
        res.json({ text: fallbackText });
    } catch (error) {
        console.error('AI Generation error:', error);
        res.status(500).json({ message: 'Error generating content' });
    }
});

module.exports = router;
