import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const nav = document.getElementById('navbar');
      if (nav) {
        if (window.scrollY > 60) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <nav id="navbar">
        <div className="nav-logo">
          <svg width="36" height="36" viewBox="0 0 100 100">
            <polygon points="50,5 10,55 90,55" fill="#8B6914"/>
            <rect x="8" y="53" width="84" height="6" rx="2" fill="#5C4208"/>
            <ellipse cx="50" cy="72" rx="32" ry="22" fill="#D4895A"/>
            <polyline points="18,55 24,47 30,55 36,47 42,55 48,47 54,55 60,47 66,55 72,47 78,55 84,47" fill="none" stroke="#8B3A0F" strokeWidth="2"/>
            <rect x="42" y="68" width="16" height="20" rx="8" fill="#6B2D0A"/>
            <circle cx="50" cy="5" r="5" fill="#5C4208"/>
          </svg>
          <span className="nav-brand">Kwa Khanye</span>
        </div>
        <ul className="nav-links">
          <li><Link to="/music">Music</Link></li>
          <li><Link to="/homevr">Home VR</Link></li>
          <li><Link to="/bioscope">Bioscope</Link></li>
          <li><a href="#store">Store</a></li>
        </ul>
        <button className={`hamburger ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
          <span></span><span></span><span></span>
        </button>
      </nav>
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <Link to="/music" onClick={closeMenu}>Music</Link>
        <Link to="/homevr" onClick={closeMenu}>Home VR</Link>
        <Link to="/bioscope" onClick={closeMenu}>Bioscope</Link>
        <a href="#store" onClick={closeMenu}>Store</a>
      </div>
    </>
  );
}

export default Navbar;
