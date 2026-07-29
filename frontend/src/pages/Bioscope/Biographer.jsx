// Biographer.jsx — wiki-style artist biography page for the Bioscope experience
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../../supabase';
import './Bioscope.css';

export default function Biographer() {
  const navigate = useNavigate();
  const { artistId } = useParams();
  const [searchParams] = useSearchParams();
  const artistName = searchParams.get('artist');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [artist, setArtist] = useState(null);
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login', { replace: true });
        return;
      }
      await fetchArtistAndBio();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, artistId, artistName]);

  const fetchArtistAndBio = async () => {
    try {
      setLoading(true);
      setError('');

      let artistRow = null;

      if (artistId) {
        const { data, error: err } = await supabase
          .from('artists')
          .select('*')
          .eq('id', artistId)
          .maybeSingle();
        if (err) throw err;
        artistRow = data;
      } else if (artistName) {
        const { data, error: err } = await supabase
          .from('artists')
          .select('*')
          .ilike('name', `%${artistName}%`)
          .maybeSingle();
        if (err) throw err;
        artistRow = data;
      }

      if (!artistRow) {
        setError('No artist selected. Choose an artist to view their biography.');
        setLoading(false);
        return;
      }

      setArtist(artistRow);

      // Biography content lives in bioscope_content as separate wiki-style
      // sections (title + body), so a biography can have multiple parts
      // (Early Life, Career, Legacy, etc.) rather than one big blob.
      const { data: bioRows, error: bioErr } = await supabase
        .from('bioscope_content')
        .select('*')
        .eq('artist_id', artistRow.id)
        .eq('content_type', 'biography')
        .order('created_at', { ascending: true });

      if (bioErr && bioErr.code !== '42P01') {
        console.error('Biography fetch error:', bioErr);
      }

      let builtSections = (bioRows || []).map((row, i) => ({
        id: row.id || `section-${i}`,
        title: row.title || `Section ${i + 1}`,
        body: row.description || row.body || '',
      }));

      // Fallback: if there's no dedicated bioscope_content, but the artist
      // row itself carries a bio-like field, show that as a single section.
      if (builtSections.length === 0) {
        const fallbackBio = artistRow.bio || artistRow.biography || artistRow.description;
        if (fallbackBio) {
          builtSections = [{ id: 'overview', title: 'Overview', body: fallbackBio }];
        }
      }

      setSections(builtSections);
      setActiveSection(builtSections[0]?.id || null);
    } catch (err) {
      console.error('Error in fetchArtistAndBio:', err);
      setError('Failed to load this biography. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = document.getElementById(`bsc-wiki-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className="bsc-root" style={{ background: '#140a05' }}>
        <div className="bsc-loading">
          <div className="bsc-dot" />
          <div className="bsc-dot" />
          <div className="bsc-dot" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bsc-root" style={{ background: '#140a05' }}>
        <div className="bsc-empty">
          <div className="bsc-empty-icon">📖</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#f4d090' }}>{error}</h2>
          <button className="bsc-modal-action" style={{ marginTop: '1.25rem', border: 'none' }} onClick={() => navigate('/artists')}>
            Browse Artists
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bsc-root" style={{ background: '#140a05' }}>
      <div className="bsc-hero" style={{ padding: '3rem 1.5rem 1.5rem' }}>
        <div className="bsc-hero-eyebrow">📖 Biographer</div>
        <h1>{artist.name}</h1>
        {(artist.country_id || artist.culture_id) && (
          <p>Explore the life and legacy of {artist.name}.</p>
        )}
      </div>

      <div className="bsc-wiki-container">
        <aside className="bsc-wiki-toc">
          <div className="bsc-wiki-toc-title">Contents</div>
          <ul className="bsc-wiki-toc-list">
            {sections.map((s) => (
              <li key={s.id}>
                <button
                  className={`bsc-wiki-toc-item ${activeSection === s.id ? 'active' : ''}`}
                  onClick={() => scrollToSection(s.id)}
                >
                  {s.title}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <article className="bsc-wiki-article">
          <div className="bsc-wiki-infobox">
            <div className="bsc-wiki-infobox-title">{artist.name}</div>
            <div className="bsc-wiki-infobox-row">
              <span>Country</span>
              <span>{artist.country_id ? artist.country_id : '—'}</span>
            </div>
            <div className="bsc-wiki-infobox-row">
              <span>Culture</span>
              <span>{artist.culture_id ? artist.culture_id : '—'}</span>
            </div>
          </div>

          {sections.length === 0 ? (
            <div className="bsc-empty" style={{ margin: 0 }}>
              <div className="bsc-empty-icon">✍️</div>
              <p>No biography has been written for {artist.name} yet.</p>
            </div>
          ) : (
            sections.map((s) => (
              <section key={s.id} id={`bsc-wiki-${s.id}`} className="bsc-wiki-section">
                <h2>{s.title}</h2>
                <p>{s.body}</p>
              </section>
            ))
          )}
        </article>
      </div>
    </div>
  );
}