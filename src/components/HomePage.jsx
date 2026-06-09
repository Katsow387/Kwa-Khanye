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
    <div className="hero-viewport" style={{ backgroundImage: `url(${backgroundImage})` }}>
      {/* Door overlay */}
      {doorOpen && (
        <div className="door-overlay">
          <div className="kraal-door">
            <div className="door-left"><div className="wood-plank"></div><div className="wood-plank"></div><div className="wood-plank"></div><div className="iron-hinge"></div><div className="iron-hinge"></div></div>
            <div className="door-right"><div className="wood-plank"></div><div className="wood-plank"></div><div className="wood-plank"></div><div className="iron-hinge"></div><div className="iron-hinge"></div><div className="door-handle"></div></div>
          </div>
        </div>
      )}

      {/* Main content with visible calabash circles */}
      <div className="main-content">
        <h1 className="main-title">EVERYTHING LIVES HERE</h1>
        <p className="sub-title">EMBARK ON A JOURNEY. THE KRAAL IS OPEN.</p>

        <div className="calabash-container">
          <Link to="/music" className="calabash">
            <div className="gold-ring">
              <div className="calabash-inner">
                <img src={potMusicImg} alt="Music" />
              </div>
            </div>
            <h3 className="calabash-title">MUSIC</h3>
            <span className="calabash-action">LISTEN</span>
          </Link>

          <a href="/homevr" onClick={handleHomeVrClick} className="calabash">
            <div className="gold-ring">
              <div className="calabash-inner">
                <img src={potHomeVrImg} alt="Home VR" />
              </div>
            </div>
            <h3 className="calabash-title">HOME VR</h3>
            <span className="calabash-action">EXPERIENCE</span>
          </a>

          <Link to="/bioscope" className="calabash">
            <div className="gold-ring">
              <div className="calabash-inner">
                <img src={potBioscopeImg} alt="Bioscope" />
              </div>
            </div>
            <h3 className="calabash-title">BIOSCOPE</h3>
            <span className="calabash-action">WATCH</span>
          </Link>
        </div>

        <button className="discover-btn" onClick={() => navigate('/homevr')}>Discover Our World</button>

        <div className="quote-box">
          <p>Umuntu ngumuntu ngabantu — A person is a person through other persons.</p>
          <p>This is the spirit of Kwa Khanye.</p>
          <span>UBUNTU — AFRICAN PHILOSOPHY</span>
        </div>
      </div>
    </div>
  );
}