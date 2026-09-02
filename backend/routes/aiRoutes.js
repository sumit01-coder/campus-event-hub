/**
 * AI Proxy Routes  — /api/ai/*
 * =============================
 * Proxies requests to the Python CampusAI NLP microservice (port 8001).
 * Also fetches live event data from MongoDB and injects it into the request
 * so the Python service can do TF-IDF ranking & recommendations over real data.
 */
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

// ─── Helper: forward to Python service ───────────────────────────────────
async function callPython(endpoint, body) {
    const res = await fetch(`${AI_SERVICE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(8000),   // 8-second timeout
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Python service error (${res.status}): ${err}`);
    }
    return res.json();
}

// ─── Health check (ping Python service) ──────────────────────────────────
router.get('/health', async (req, res) => {
    try {
        const r = await fetch(`${AI_SERVICE_URL}/health`, {
            signal: AbortSignal.timeout(3000)
        });
        const data = await r.json();
        res.json({ node: 'ok', python: data });
    } catch (err) {
        res.status(503).json({ node: 'ok', python: 'offline', error: err.message });
    }
});

// ─── POST /api/ai/analyze  ─────────────────────────────────────────────────
// Deep NLP analysis: intent + entities + sentiment + context
router.post('/analyze', async (req, res) => {
    try {
        const { message, conversation_history = [], user_interests = [] } = req.body;
        if (!message) return res.status(400).json({ message: 'message is required' });

        const result = await callPython('/analyze', {
            message,
            conversation_history,
            user_interests,
        });
        res.json(result);
    } catch (err) {
        console.error('[AI /analyze]', err.message);
        // Graceful degradation — return a basic parse so the frontend still works
        res.json({
            intent: 'UNKNOWN',
            confidence: 0,
            entities: { categories: [], date_ref: null },
            sentiment: { label: 'neutral', score: 0 },
            context: {},
            needs_clarification: true,
            error: err.message,
        });
    }
});

// ─── POST /api/ai/rank  ────────────────────────────────────────────────────
// TF-IDF ranking of real DB events against a query
router.post('/rank', async (req, res) => {
    try {
        const { query, top_k = 10 } = req.body;
        if (!query) return res.status(400).json({ message: 'query is required' });

        // Fetch live events from MongoDB
        const events = await Event.find().lean();

        const result = await callPython('/rank', {
            query,
            events,
            top_k,
        });
        res.json(result);
    } catch (err) {
        console.error('[AI /rank]', err.message);
        res.status(500).json({ message: err.message });
    }
});

// ─── POST /api/ai/recommend  ───────────────────────────────────────────────
// Content-based recommendations using user interests
router.post('/recommend', async (req, res) => {
    try {
        const { user_interests = [], registered_categories = [], top_k = 5 } = req.body;

        // Fetch live upcoming events from MongoDB
        const events = await Event.find({ date: { $gte: new Date() } }).lean();

        const result = await callPython('/recommend', {
            user_interests,
            registered_categories,
            events,
            top_k,
        });
        res.json(result);
    } catch (err) {
        console.error('[AI /recommend]', err.message);
        res.status(500).json({ message: err.message });
    }
});

// ─── GET /api/ai/insights  ─────────────────────────────────────────────────
// Statistical insights from all event data
router.get('/insights', async (req, res) => {
    try {
        const events = await Event.find().lean();

        const result = await callPython('/insights', { events, registrations: [] });
        res.json(result);
    } catch (err) {
        console.error('[AI /insights]', err.message);
        res.status(500).json({ message: err.message });
    }
});

// ─── POST /api/ai/sentiment  ───────────────────────────────────────────────
router.post('/sentiment', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'text is required' });
        const result = await callPython('/sentiment', { text });
        res.json(result);
    } catch (err) {
        console.error('[AI /sentiment]', err.message);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
