import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase, fetchProfile } from './lib/supabase';
import { useAuthStore } from './store';
import './index.css';

import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TrailPage from './pages/TrailPage';
import TrailLessonPage from './pages/TrailLessonPage';
import ExamPage from './pages/ExamPage';
import ResultPage from './pages/ResultPage';
import ProfilePage from './pages/ProfilePage';
import AppLayout from './components/layout/AppLayout';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white" />
        </svg>
      </div>
      <div style={{ width: 32, height: 3, borderRadius: 2, background: 'var(--surface-high)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: '60%', borderRadius: 2, background: 'var(--accent)' }} />
      </div>
    </div>
  );
}

export default function App() {
  const { setUser, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        const { data } = await fetchProfile(session.user.id);
        setProfile(data);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data } = await fetchProfile(session.user.id);
        setProfile(data);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setProfile, setLoading]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="trilha" element={<TrailPage />} />
          <Route path="trilha/:topicId" element={<TrailLessonPage />} />
          <Route path="simulado" element={<ExamPage />} />
          <Route path="resultado" element={<ResultPage />} />
          <Route path="perfil" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
