import { useEffect } from 'react';

function Hero() {
  useEffect(() => {
    const starsContainer = document.getElementById("stars");
    if (!starsContainer) return;
    starsContainer.innerHTML = '';
    for (let i = 0; i < 80; i++) {
      const star = document.createElement("div");
      star.classList.add("star");
      const size = Math.random() * 2.5 + 1;
      star.style.cssText =
        "width:" + size + "px; height:" + size + "px;" +
        "top:" + (Math.random() * 70) + "%;" +
        "left:" + (Math.random() * 100) + "%;" +
        "--dur:" + ((Math.random() * 3 + 2).toFixed(1)) + "s;" +
        "animation-delay:" + ((Math.random() * 3).toFixed(1)) + "s;";
      starsContainer.appendChild(star);
    }
  }, []);

  return (
    <section className="hero" id="home">
      <div className="stars" id="stars"></div>
      <div className="hero-content">
        <p className="hero-tagline">Welcome to</p>
        <h1 className="hero-title">Kwa Khanye</h1>
        <p className="hero-sub">A digital home where culture lives — music, art, stories & more</p>
        <a href="#sections" className="hero-btn">Enter the Kraal</a>
      </div>
      <div className="hut-hero">
        <svg viewBox="0 0 300 260" width="340" height="290" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="150" cy="230" rx="120" ry="30" fill="#C8732A" opacity="0.25"/>
          <ellipse cx="150" cy="185" rx="100" ry="90" fill="#C8732A"/>
          <ellipse cx="150" cy="185" rx="95" ry="85" fill="#D4895A"/>
          <polyline points="55,175 65,163 75,175 85,163 95,175 105,163 115,175 125,163 135,175 145,163 155,175 165,163 175,175 185,163 195,175 205,163 215,175 225,163 235,175 245,163" fill="none" stroke="#8B3A0F" strokeWidth="2.5"/>
          <g fill="#8B3A0F">
            <circle cx="65" cy="168" r="3"/><circle cx="85" cy="168" r="3"/>
            <circle cx="105" cy="168" r="3"/><circle cx="125" cy="168" r="3"/>
            <circle cx="145" cy="168" r="3"/><circle cx="165" cy="168" r="3"/>
            <circle cx="185" cy="168" r="3"/><circle cx="205" cy="168" r="3"/>
            <circle cx="225" cy="168" r="3"/>
          </g>
          <rect x="75" y="155" width="28" height="22" rx="4" fill="#6B2D0A"/>
          <rect x="78" y="158" width="22" height="16" rx="3" fill="#8B3A10"/>
          <rect x="197" y="155" width="28" height="22" rx="4" fill="#6B2D0A"/>
          <rect x="200" y="158" width="22" height="16" rx="3" fill="#8B3A10"/>
          <rect x="132" y="183" width="36" height="52" rx="18" fill="#6B2D0A"/>
          <rect x="136" y="187" width="28" height="44" rx="15" fill="#8B3A10"/>
          <polygon points="150,20 50,175 250,175" fill="#8B6914"/>
          <g stroke="#6B4F0A" strokeWidth="1.2" opacity="0.7">
            <line x1="150" y1="20" x2="50" y2="175"/>
            <line x1="150" y1="20" x2="70" y2="175"/>
            <line x1="150" y1="20" x2="90" y2="175"/>
            <line x1="150" y1="20" x2="110" y2="175"/>
            <line x1="150" y1="20" x2="130" y2="175"/>
            <line x1="150" y1="20" x2="170" y2="175"/>
            <line x1="150" y1="20" x2="190" y2="175"/>
            <line x1="150" y1="20" x2="210" y2="175"/>
            <line x1="150" y1="20" x2="230" y2="175"/>
            <line x1="150" y1="20" x2="250" y2="175"/>
          </g>
          <rect x="46" y="171" width="208" height="8" rx="3" fill="#5C4208"/>
          <circle cx="150" cy="20" r="10" fill="#5C4208"/>
          <circle cx="150" cy="20" r="6" fill="#8B6914"/>
          <ellipse cx="150" cy="248" rx="28" ry="8" fill="#E8863A" opacity="0.4"/>
          <ellipse cx="150" cy="244" rx="15" ry="6" fill="#F4C274" opacity="0.6"/>
        </svg>
      </div>
      <div className="scroll-hint" id="scrollHint">
        <span>Scroll down</span>
        <div className="scroll-arrow"></div>
      </div>
    </section>
  );
}

export default Hero;
