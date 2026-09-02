const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');

// GET /api/public/stats
router.get('/stats', async (req, res) => {
    try {
        const eventsCount = await Event.countDocuments();
        const usersCount = await User.countDocuments();
        
        // We will return the real counts from the DB. 
        // For campuses and satisfaction rate, we can return some base metrics 
        // since those aren't directly modeled in the DB yet.
        res.json({
            eventsHosted: eventsCount,
            activeUsers: usersCount,
            campuses: 25, // Base mock value
            satisfactionRate: 98 // Base mock value
        });
    } catch (error) {
        console.error('Error fetching public stats:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
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
