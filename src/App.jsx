import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { supabase } from './supabase';
import HomePage from './components/HomePage.jsx';
import Music from './pages/Music/Music.jsx';
import HomeVR from './pages/HomeVR/HomeVR.jsx';
import Bioscope from './pages/Bioscope/Bioscope.jsx';
import LoginPage from './pages/Auth/LoginPage.jsx';
import SignUpPage from './pages/Auth/SignUpPage.jsx';
import { ForgotPasswordPage, ResetPasswordPage } from './pages/Auth/ForgotPasswordPage.jsx';
import NFTs from './pages/HomeVR/NFTs.jsx';
import OnlineStore from './pages/HomeVR/OnlineStore.jsx';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<HomePage session={session} />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/music" element={<Music />} />
      <Route path="/homevr" element={<HomeVR />} />
      <Route path="/bioscope" element={<Bioscope />} />
      <Route path="/nft" element={<NFTs />} />
      <Route path="/store" element={<OnlineStore />} />
    </Routes>
  );
}

export default App;