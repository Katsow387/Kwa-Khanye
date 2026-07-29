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
            `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=30`,
            {
                headers: {
                    // Some upstream APIs (Deezer included) are more likely to
                    // reject requests with no User-Agent as bot traffic.
                    'User-Agent': 'Mozilla/5.0 (compatible; KraalCulture/1.0)',
                },
            }
        );

        // Log the raw status + body BEFORE deciding it's an error,
        // so Render logs tell us exactly what Deezer said.
        const rawText = await response.text();
        console.log(`Deezer responded ${response.status} for "${query}":`, rawText.slice(0, 300));

        if (!response.ok) {
            // Don't throw a generic error — pass Deezer's actual status/body through
            // so the frontend (and your Render logs) show the real cause.
            return res.status(response.status).json({
                error: 'Deezer API error',
                deezerStatus: response.status,
                deezerBody: rawText.slice(0, 500),
            });
        }

        const data = JSON.parse(rawText);

        // Deezer can return HTTP 200 with an embedded error object
        // (e.g. quota/rate-limit exceeded) — surface that too.
        if (data.error) {
            console.error('Deezer returned an error payload:', data.error);
            return res.status(502).json({
                error: 'Deezer API error',
                deezerError: data.error,
            });
        }

        res.json(data);
    } catch (error) {
        // This only fires now for genuine network/parsing failures,
        // not for every non-2xx Deezer response.
        console.error('Proxy error:', error.message);
        res.status(500).json({ error: 'Failed to fetch from Deezer', detail: error.message });
    }
});

// Track details endpoint (for now-playing)
app.get('/api/deezer/track/:id', async (req, res) => {
    const trackId = req.params.id;
    try {
        const response = await fetch(`https://api.deezer.com/track/${trackId}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KraalCulture/1.0)' },
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Track proxy error:', error.message);
        res.status(500).json({ error: 'Failed to fetch track details', detail: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Backend proxy running on port ${PORT}`);
});