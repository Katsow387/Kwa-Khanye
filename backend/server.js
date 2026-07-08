const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check (so you know it's running)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend proxy is running' });
});

// Proxy endpoint for Deezer search
app.get('/api/deezer/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Missing search query' });
    }

    try {
        console.log(`Proxying search for: ${query}`);
        const response = await fetch(
            `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=30`
        );
        
        if (!response.ok) {
            throw new Error(`Deezer API returned ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(500).json({ error: 'Failed to fetch from Deezer' });
    }
});

// Track details endpoint (for now-playing)
app.get('/api/deezer/track/:id', async (req, res) => {
    const trackId = req.params.id;
    try {
        const response = await fetch(`https://api.deezer.com/track/${trackId}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch track details' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Backend proxy running on port ${PORT}`);
});