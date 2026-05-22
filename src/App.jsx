import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Footer from './components/Footer.jsx';
import Music from './pages/Music.jsx';
import HomeVR from './pages/HomeVR.jsx';
import Bioscope from './pages/Bioscope.jsx';

function Home() {
  return (
    <>
      <Hero />
      <section className="sections" id="sections">
        <div className="section-intro">
          <h2>What lives here</h2>
          <p>Three rooms in the kraal, each holding something sacred</p>
        </div>
        <div className="pots-row">
          {/* MUSIC POT */}
          <a href="/music" className="pot-card" id="music">
            <div className="pot-img-wrap">
              <img src="/src/assets/images/pot_music.png" alt="Music pot" className="pot-img" />
              <div className="pot-icon-overlay">
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                  <circle cx="26" cy="26" r="24" fill="rgba(0,0,0,0.55)" stroke="#F4C274" strokeWidth="1.5"/>
                  <text x="26" y="33" textAnchor="middle" fontSize="22" fill="#F4C274">♪</text>
                </svg>
              </div>
            </div>
            <h3>Music</h3>
            <p>Albums, singles & the story behind the songs</p>
            <ul className="pot-list">
              <li>The story of the album</li>
              <li>Artist biography</li>
              <li>Music videos</li>
            </ul>
            <span className="pot-enter">Enter →</span>
          </a>

          {/* HOME VR POT */}
          <a href="/homevr" className="pot-card featured" id="homevr">
            <div className="pot-img-wrap">
              <img src="/src/assets/images/pot_homevr.png" alt="Home VR pot" className="pot-img" />
              <div className="pot-icon-overlay">
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                  <circle cx="26" cy="26" r="24" fill="rgba(0,0,0,0.55)" stroke="#F4C274" strokeWidth="1.5"/>
                  <polygon points="26,12 14,24 17,24 17,38 35,38 35,24 38,24" fill="#F4C274"/>
                  <rect x="22" y="28" width="8" height="10" rx="1" fill="rgba(0,0,0,0.5)"/>
                </svg>
              </div>
            </div>
            <h3>Home VR</h3>
            <p>Step inside the virtual kraal — art, museum & store</p>
            <ul className="pot-list">
              <li>NFT art collection</li>
              <li>Virtual museum</li>
              <li>Online store</li>
            </ul>
            <span className="pot-enter">Enter →</span>
          </a>

          {/* BIOSCOPE POT */}
          <a href="/bioscope" className="pot-card" id="bioscope">
            <div className="pot-img-wrap">
              <img src="/src/assets/images/pot_bioscope.png" alt="Bioscope pot" className="pot-img" />
              <div className="pot-icon-overlay">
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                  <circle cx="26" cy="26" r="24" fill="rgba(0,0,0,0.55)" stroke="#F4C274" strokeWidth="1.5"/>
                  <polygon points="20,16 20,36 38,26" fill="#F4C274"/>
                </svg>
              </div>
            </div>
            <h3>Bioscope</h3>
            <p>Watch films, documentaries & original content</p>
            <ul className="pot-list">
              <li>Building the album</li>
              <li>Biography films</li>
              <li>Music videos</li>
            </ul>
            <span className="pot-enter">Enter →</span>
          </a>
        </div>
      </section>
    </>
  );
}

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/music" element={<Music />} />
        <Route path="/homevr" element={<HomeVR />} />
        <Route path="/bioscope" element={<Bioscope />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
