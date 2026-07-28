import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { COUNTRIES } from '../../constants/countries';
import './CustomerDashboard.css';

// ── Import culture images ──
import ZuluImg from '../../assets/images/Zulu.jpg';
import XitsongaImg from '../../assets/images/Xitsonga.jpg';
import VendaImg from '../../assets/images/Venda.jpg';
import SothoImg from '../../assets/images/Sotho.jpg';
import SetswanaImg from '../../assets/images/Setswana.jpg';
import NdebeleImg from '../../assets/images/Ndebele.jpg';
import BapediImg from '../../assets/images/Bapedi.jpg';
import SwatiImg from '../../assets/images/swati.webp';
import XhosaImg from '../../assets/images/xhosa.webp';
import BoereImg from '../../assets/images/boere.webp';

const imageMap = {
  'Zulu.jpg': ZuluImg,
  'Xitsonga.jpg': XitsongaImg,
  'Venda.jpg': VendaImg,
  'Sotho.jpg': SothoImg,
  'Setswana.jpg': SetswanaImg,
  'Ndebele.jpg': NdebeleImg,
  'Bapedi.jpg': BapediImg,
  'swati.webp': SwatiImg,
  'xhosa.webp': XhosaImg,
  'boere.webp': BoereImg,
};

function getCultureImage(filename) {
  return imageMap[filename] || null;
}

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [uploads, setUploads] = useState({ songs: [], vr: [], bioscope: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCulture, setSelectedCulture] = useState(null);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const { data, error } = await supabase
          .from('artist_uploads')
          .select('*, artists(name, country_id, culture_id)')
          .order('created_at', { ascending: false });
        if (error) throw error;
        const groups = { songs: [], vr: [], bioscope: [] };
        data.forEach(item => {
          if (item.category === 'song') groups.songs.push(item);
          else if (item.category === 'vr') groups.vr.push(item);
          else if (item.category === 'bioscope') groups.bioscope.push(item);
        });
        setUploads(groups);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUploads();
  }, []);

  const getFilteredUploads = () => {
    if (!selectedCountry && !selectedCulture) return uploads;
    let filtered = { songs: [], vr: [], bioscope: [] };
    const allItems = [...uploads.songs, ...uploads.vr, ...uploads.bioscope];
    const filteredItems = allItems.filter(item => {
      if (selectedCountry && item.artists?.country_id !== selectedCountry.id) return false;
      if (selectedCulture && item.artists?.culture_id !== selectedCulture.id) return false;
      return true;
    });
    filtered.songs = filteredItems.filter(i => i.category === 'song');
    filtered.vr = filteredItems.filter(i => i.category === 'vr');
    filtered.bioscope = filteredItems.filter(i => i.category === 'bioscope');
    return filtered;
  };

  const filteredUploads = getFilteredUploads();

  // ✅ FIXED: correct template literal
  const handleCultureSelect = (countryId, cultureId) => {
    navigate(`/country/${countryId}/culture/${cultureId}/artists`);
  };

  if (loading) return <div className="customer-dashboard">Loading...</div>;
  if (error) return <div className="customer-dashboard">Error: {error}</div>;

  return (
    <div className="customer-dashboard">
      <h1>👥 Customer Dashboard</h1>
      <p>Explore countries, cultures, and uploaded content.</p>

      <section className="dashboard-section">
        <h2 className="section-title">🌍 Explore by Country & Culture</h2>
        <div className="country-grid">
          {COUNTRIES.filter(c => c.available).map(country => (
            <div key={country.id} className="country-card">
              <div className="country-header" onClick={() => setSelectedCountry(selectedCountry?.id === country.id ? null : country)}>
                {/* ✅ FIXED: flag URL with template literal */}
                <img src={`https://flagcdn.com/${country.id}.svg`} alt={country.name} className="country-flag" />
                <span className="country-name">{country.name}</span>
                <span className="country-code">{country.code}</span>
              </div>
              {selectedCountry?.id === country.id && (
                <div className="culture-grid">
                  {country.cultures.map(culture => {
                    const imgSrc = getCultureImage(culture.image);
                    return (
                      <div
                        key={culture.id}
                        className="culture-card"
                        onClick={() => handleCultureSelect(country.id, culture.id)}
                      >
                        {imgSrc ? (
                          <img src={imgSrc} alt={culture.name} className="culture-image" />
                        ) : (
                          <div className="culture-symbol">{culture.symbol}</div>
                        )}
                        <span className="culture-name">{culture.name}</span>
                        <span className="culture-aka">{culture.aka}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="section-title">
          🎵 Uploaded Content
          {(selectedCountry || selectedCulture) && (
            <span className="filter-badge">
              Filtered by {selectedCountry?.name || selectedCulture?.name}
              <button className="clear-filter" onClick={() => { setSelectedCountry(null); setSelectedCulture(null); }}>✕</button>
            </span>
          )}
        </h2>

        <div className="content-category">
          <h3>🎵 Songs</h3>
          {filteredUploads.songs.length ? (
            <ul>
              {filteredUploads.songs.map(item => (
                <li key={item.id}>
                  {item.title} – {item.artists?.name || 'Unknown artist'}
                  {item.artists?.country_id && (
                    <span className="meta-badge">📍 {COUNTRIES.find(c => c.id === item.artists.country_id)?.name}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : <p>No songs uploaded yet.</p>}
        </div>

        <div className="content-category">
          <h3>🥽 VR Experiences</h3>
          {filteredUploads.vr.length ? (
            <ul>
              {filteredUploads.vr.map(item => (
                <li key={item.id}>
                  {item.title} – {item.artists?.name || 'Unknown artist'}
                  {item.artists?.country_id && (
                    <span className="meta-badge">📍 {COUNTRIES.find(c => c.id === item.artists.country_id)?.name}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : <p>No VR content yet.</p>}
        </div>

        <div className="content-category">
          <h3>🎬 Bioscope</h3>
          {filteredUploads.bioscope.length ? (
            <ul>
              {filteredUploads.bioscope.map(item => (
                <li key={item.id}>
                  {item.title} – {item.artists?.name || 'Unknown artist'}
                  {item.artists?.country_id && (
                    <span className="meta-badge">📍 {COUNTRIES.find(c => c.id === item.artists.country_id)?.name}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : <p>No bioscope content yet.</p>}
        </div>
      </section>
    </div>
  );
}