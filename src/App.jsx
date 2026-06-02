import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Hero from './components/Hero.jsx';
import HomePage from './components/HomePage.jsx';
import Music from './pages/Music/Music.jsx';
import HomeVR from './pages/HomeVR/HomeVR.jsx';
import Bioscope from './pages/Bioscope/Bioscope.jsx';
import LoginPage from './pages/Auth/LoginPage.jsx';
import SignUpPage from './pages/Auth/SignUpPage.jsx';
import ForgotPasswordPage, { ResetPasswordPage } from './pages/Auth/ForgotPasswordPage.jsx';

function Home({ session }) {
  const navigate = useNavigate();

  const handleProtectedClick = (path) => {
    if (session) {
      navigate(path);
    } else {
      navigate('/signup');
    }
  };

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
          <div onClick={() => handleProtectedClick('/music')} className="pot-card" id="music" style={{ cursor: 'pointer' }}>
            <div className="pot-img-wrap">
              <img src="/assets/images/pot_music.png" alt="Music pot" className="pot-img" />
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
          </div>

          {/* HOME VR POT */}
          <div onClick={() => handleProtectedClick('/homevr')} className="pot-card featured" id="homevr" style={{ cursor: 'pointer' }}>
            <div className="pot-img-wrap">
              <img src="/assets/images/pot_homevr.png" alt="Home VR pot" className="pot-img" />
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
          </div>

          {/* BIOSCOPE POT */}
          <div onClick={() => handleProtectedClick('/bioscope')} className="pot-card" id="bioscope" style={{ cursor: 'pointer' }}>
            <div className="pot-img-wrap">
              <img src="/assets/images/pot_bioscope.png" alt="Bioscope pot" className="pot-img" />
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
          </div>
        </div>
      </section>
    </>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  const ProtectedRoute = ({ children }) => {
    if (!session) {
      navigate('/signup');
      return null;
    }
    return children;
  };

  const hideNavFooter = location.pathname === '/login' || 
                        location.pathname === '/signup' || 
                        location.pathname === '/forgot-password' || 
                        location.pathname === '/reset-password';

  return (
    <>
      {!hideNavFooter && <Navbar session={session} />}
      <Routes>
        <Route path="/" element={<Home session={session} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/music" element={<ProtectedRoute><Music /></ProtectedRoute>} />
        <Route path="/homevr" element={<ProtectedRoute><HomeVR /></ProtectedRoute>} />
        <Route path="/bioscope" element={<ProtectedRoute><Bioscope /></ProtectedRoute>} />
      </Routes>
      {!hideNavFooter && <Footer />}
    </>
  );
}

export default App;