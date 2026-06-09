import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import HomePage from './components/HomePage.jsx';
import Music from './pages/Music/Music.jsx';
import HomeVR from './pages/HomeVR/HomeVR.jsx';
import Bioscope from './pages/Bioscope/Bioscope.jsx';
import LoginPage from './pages/Auth/LoginPage.jsx';
import SignUpPage from './pages/Auth/SignUpPage.jsx';
// Import both components from the same file
import { ForgotPasswordPage, ResetPasswordPage } from './pages/Auth/ForgotPasswordPage.jsx';

function App() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

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
    </Routes>
  );
}

export default App;