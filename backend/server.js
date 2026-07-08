const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the frontend's dist folder (one level up)
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

// ---- API Proxy routes ----
app.get('/api/deezer/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Missing search query' });
    }
    try {
        console.log(`Proxying Deezer search: ${query}`);
        const response = await fetch(
            `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=30`
        );
        if (!response.ok) {
            throw new Error(`Deezer API error: ${response.status}`);
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(500).json({ error: 'Failed to fetch from Deezer', details: error.message });
    }
});

app.get('/api/deezer/track/:id', async (req, res) => {
    const trackId = req.params.id;
    if (!trackId) {
        return res.status(400).json({ error: 'Missing track ID' });
    }
    try {
        console.log(`Proxying Deezer track: ${trackId}`);
        const response = await fetch(`https://api.deezer.com/track/${trackId}`);
        if (!response.ok) {
            throw new Error(`Deezer API error: ${response.status}`);
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Track proxy error:', error.message);
        res.status(500).json({ error: 'Failed to fetch track details' });
    }
});

// ---- Catch‑all: serve index.html for any non-API route ----
// Use app.use instead of app.get('*', ...) to avoid path-to-regexp parsing issues.
app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});