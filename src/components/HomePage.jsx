import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import backgroundImage from '../assets/images/Background.png';
import potMusicImg from '../assets/images/pot_music.png';
import potHomeVrImg from '../assets/images/pot_homevr.png';
import potBioscopeImg from '../assets/images/pot_bioscope.png';

export default function HomePage() {
  const navigate = useNavigate();
  const [doorOpen, setDoorOpen] = useState(false);

  const handleHomeVrClick = (e) => {
    e.preventDefault();
    if (doorOpen) return;
    setDoorOpen(true);
    setTimeout(() => {
      navigate('/homevr');
    }, 600);
  };

  return (
    <div className="homepage-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      {/* Dark overlay */}
      <div className="homepage-overlay"></div>

      {/* ── NAVBAR ── */}
      <nav className="hp-navbar">
        <div className="hp-nav-logo">
          <span className="hp-nav-logo-icon">🏺</span>
          <span className="hp-nav-logo-text">KWA KHANYE</span>
        </div>
        <div className="hp-nav-links">
          <Link to="/music" className="hp-nav-link">MUSIC</Link>
          <div className="hp-nav-link-group">
            <a href="/homevr" onClick={handleHomeVrClick} className="hp-nav-link hp-nav-link--active">HOME VR</a>
            <span className="hp-nav-sub">EXPLORE THE KRAAL</span>
          </div>
          <Link to="/bioscope" className="hp-nav-link">BIOSCOPE</Link>
        </div>
        <Link to="/homevr" className="hp-nav-cta">ENTER THE KRAAL</Link>
      </nav>

      {/* Door animation */}
      {doorOpen && (
        <div className="door-overlay">
          <div className="kraal-door">
            <div className="door-left">
              <div className="wood-plank"></div>
              <div className="wood-plank"></div>
              <div className="wood-plank"></div>
              <div className="iron-hinge"></div>
              <div className="iron-hinge"></div>
            </div>
            <div className="door-right">
              <div className="wood-plank"></div>
              <div className="wood-plank"></div>
              <div className="wood-plank"></div>
              <div className="iron-hinge"></div>
              <div className="iron-hinge"></div>
              <div className="door-handle"></div>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO CONTENT ── */}
      <div className="homepage-content">
        <h1 className="hp-hero-title">Everything Lives Here</h1>
        <p className="hp-hero-subtitle">Music, art, stories and more — gathered around one fire</p>

        {/* ── YARD PORTS (CIRCULAR GOLD FRAMES) ── */}
        <div className="yard-ports-container">
          {/* Music */}
          <Link to="/music" className="yard-port-item">
            <div className="circular-frame">
              <img src={potMusicImg} alt="Music" />
            </div>
            <h3 className="yard-port-title">MUSIC</h3>
            <span className="yard-port-subtitle">LISTEN</span>
          </Link>

          {/* Home VR (with door animation) */}
          <a href="/homevr" onClick={handleHomeVrClick} className="yard-port-item">
            <div className="circular-frame">
              <img src={potHomeVrImg} alt="Home VR" />
            </div>
            <h3 className="yard-port-title">HOME VR</h3>
            <span className="yard-port-subtitle">EXPERIENCE</span>
          </a>

          {/* Bioscope */}
          <Link to="/bioscope" className="yard-port-item">
            <div className="circular-frame">
              <img src={potBioscopeImg} alt="Bioscope" />
            </div>
            <h3 className="yard-port-title">BIOSCOPE</h3>
            <span className="yard-port-subtitle">WATCH</span>
          </Link>
        </div>

        {/* CTA Button */}
        <button className="hp-cta-btn" onClick={() => navigate('/homevr')}>
          Discover Our World
        </button>

        {/* Ubuntu Quote */}
        <div className="hp-quote">
          <p className="hp-quote-text">
            Umuntu ngumuntu ngabantu — A person is a person through other persons.<br />
            This is the spirit of Kwa Khanye.
          </p>
          <p className="hp-quote-author">UBUNTU — AFRICAN PHILOSOPHY</p>
        </div>
      </div>
    </div>
  );
}