import { useEffect, useState, createContext, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';

import Layout from './components/Layout';
import HomePage from './components/HomePage';
import CountryPage from './components/CountryPage';
import ArtistsPage from './components/ArtistsPage';
import ArtistProfile from './components/ArtistProfile';


import Music from './pages/Music/Music';
import NowPlaying from './pages/Music/NowPlaying';
import HomeVR from './pages/HomeVR/HomeVR';
import Bioscope from './pages/Bioscope/Bioscope';
import Biographer from './pages/Bioscope/Biographer';
import MusicVideos from './pages/Bioscope/MusicVideos';
import Albums from './pages/Bioscope/Albums';


import LoginPage from './pages/Auth/LoginPage';
import SignUpPage from './pages/Auth/SignUpPage';
import {
  ForgotPasswordPage,
  ResetPasswordPage,
} from './pages/Auth/ForgotPasswordPage';

// ─── DASHBOARD & APPLICATION IMPORTS ──────────────────────
import ArtistDashboard from './pages/ArtistDashboard/ArtistDashboard';
import CustomerDashboard from './pages/CustomerDashboard/CustomerDashboard';
import ArtistApplicationForm from './pages/ArtistApplication/ArtistApplicationForm';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';

const SessionContext = createContext(null);

export const useSession = () => useContext(SessionContext);

function ProtectedRoute({ children }) {
  const session = useSession();
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrentSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getCurrentSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#1a0d06',
          color: '#fff',
          fontSize: '20px',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <SessionContext.Provider value={session}>
      <Routes>
        {/* Public Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Home page – public landing */}
        <Route path="/" element={<HomePage />} />


        {/* Protected pages WITH Layout (global header) */}

        {/* ============================================================ */}
        {/* BIOSCOPE ROUTES - MOVED OUTSIDE LAYOUT TO FIX NAVIGATION    */}
        {/* ============================================================ */}
        <Route
          path="/bioscope/biography/:artistId"
          element={
            <ProtectedRoute>
              <Biographer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bioscope/biography"
          element={
            <ProtectedRoute>
              <Biographer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bioscope/music-videos"
          element={
            <ProtectedRoute>
              <MusicVideos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bioscope/albums"
          element={
            <ProtectedRoute>
              <Albums />
            </ProtectedRoute>
          }
        />

        {/* Protected pages with Layout (which renders the header) */}

        <Route element={<Layout session={session} />}>
          {/* Country / Culture / Artist browsing – still needed */}
          <Route
            path="/country/:countryId"
            element={
              <ProtectedRoute>
                <CountryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/country/:countryId/culture/:cultureId/artists"
            element={
              <ProtectedRoute>
                <ArtistsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/artist/:artistId"
            element={
              <ProtectedRoute>
                <ArtistProfile />
              </ProtectedRoute>
            }
          />

          {/* ─── DASHBOARDS ─────────────────────────────────────── */}
          <Route
            path="/artist-dashboard"
            element={
              <ProtectedRoute>
                <ArtistDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer-dashboard"
            element={
              <ProtectedRoute>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/artist-application"
            element={
              <ProtectedRoute>
                <ArtistApplicationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Old pages are removed (Music, NowPlaying, HomeVR, Bioscope, NFTs, OnlineStore) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SessionContext.Provider>
  );
}

export default App;
