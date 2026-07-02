require('dotenv').config();

// Force IPv4 to avoid ECONNRESET on some networks
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ─── MusicBrainz config ────────────────────────────────────────────────
const MUSICBRAINZ_USER_AGENT = 'KwaKhanye/1.0 (contact: your-email@example.com)';
const MUSICBRAINZ_BASE_URL = 'https://musicbrainz.org/ws/2/artist/';

let lastRequestTime = 0;
async function throttledFetch(url, options) {
  const now = Date.now();
  const wait = Math.max(0, 1000 - (now - lastRequestTime));
  if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
  lastRequestTime = Date.now();
  return fetch(url, options);
}

// Culture → MusicBrainz tag mapping
const CULTURE_TAGS = {
  zulu: ['zulu', 'isizulu', 'amazulu'],
  xitsonga: ['xitsonga', 'tsonga', 'shangaan'],
  venda: ['venda', 'tshivenda', 'vhavenda'],
  sotho: ['sotho', 'sesotho', 'basotho'],
  setswana: ['tswana', 'setswana', 'batswana', 'motswana'],
  ndebele: ['ndebele', 'amandebele'],
  bapedi: ['pedi', 'sepedi', 'bapedi'],
};

function buildTagFilter(cultureId) {
  const tags = CULTURE_TAGS[cultureId] || [cultureId];
  return '(' + tags.map(t => `tag:${t}`).join(' OR ') + ')';
}

function buildBroadFilter(cultureId) {
  const tags = CULTURE_TAGS[cultureId] || [cultureId];
  const terms = tags.map(t => `"${t}"`).join(' OR ');
  return `(${terms}) OR comment:(${terms})`;
}

async function searchMusicBrainz(mbQuery, attempt = 1) {
  const url = `${MUSICBRAINZ_BASE_URL}?query=${encodeURIComponent(mbQuery)}&fmt=json&limit=30`;
  let mbRes;
  try {
    mbRes = await throttledFetch(url, {
      headers: { 'User-Agent': MUSICBRAINZ_USER_AGENT },
    });
  } catch (err) {
    const reason = err.cause?.code || err.cause?.message || err.message;
    if (attempt < 3) {
      console.warn(`MusicBrainz request failed (${reason}), retrying... [attempt ${attempt}]`);
      await new Promise(resolve => setTimeout(resolve, 500 * attempt));
      return searchMusicBrainz(mbQuery, attempt + 1);
    }
    throw new Error(`Network error reaching MusicBrainz after ${attempt} attempts: ${reason}`);
  }
  if (!mbRes.ok) {
    const body = await mbRes.text();
    throw new Error(`MusicBrainz search failed: ${mbRes.status} ${body}`);
  }
  const data = await mbRes.json();
  return (data.artists || []).map(a => ({
    id: a.id,
    name: a.name,
    genres: (a.tags || []).map(t => t.name),
    disambiguation: a.disambiguation || null,
    area: a.area?.name || null,
    image_url: null,
    mb_url: `https://musicbrainz.org/artist/${a.id}`,
    source: 'musicbrainz',
  }));
}

// ─── Deezer proxy (using built‑in fetch) ──────────────────────────────
async function searchDeezer(query, limit = 30) {
  const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Deezer search failed: ${res.status} ${text}`);
  }
  return res.json();
}

// ─── Routes ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// MusicBrainz culture search
app.get('/api/artists/culture-search', async (req, res) => {
  const cultureId = (req.query.culture || '').trim().toLowerCase();
  const searchTerm = (req.query.q || '').trim();

  if (!cultureId) {
    return res.status(400).json({ error: 'Missing required "culture" query param' });
  }

  const namePrefix = searchTerm ? `artist:${JSON.stringify(searchTerm)}* AND ` : '';

  let artists;
  try {
    artists = await searchMusicBrainz(namePrefix + buildTagFilter(cultureId));
  } catch (err) {
    console.error('Primary MusicBrainz search failed:', err);
    return res.status(502).json({ error: `MusicBrainz search failed: ${err.message}` });
  }

  let usedFallback = false;
  if (artists.length === 0) {
    try {
      artists = await searchMusicBrainz(namePrefix + buildBroadFilter(cultureId));
      usedFallback = true;
    } catch (err) {
      console.error('Fallback MusicBrainz search failed:', err);
      return res.json({ artists: [], usedFallback: false, warning: `Broader search failed: ${err.message}` });
    }
  }
  res.json({ artists, usedFallback });
});

// Deezer search
app.get('/api/deezer/search', async (req, res) => {
  const query = (req.query.q || '').trim();
  const limit = parseInt(req.query.limit, 10) || 30;

  if (!query) {
    return res.status(400).json({ error: 'Missing "q" query parameter' });
  }

  try {
    const data = await searchDeezer(query, limit);
    res.json(data);
  } catch (err) {
    console.error('Deezer proxy error:', err);
    res.status(502).json({ error: `Deezer search failed: ${err.message}` });
  }
});

// ─── Start server ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});

// ⚠️ Safety net to keep the process alive (remove after confirming it works)
setInterval(() => {}, 1000);