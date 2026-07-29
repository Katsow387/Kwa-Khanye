import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      if (user.email === 'admin@gmail.com') { setLoading(false); return; }
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error || data?.role !== 'admin') {
        navigate('/');
      } else {
        setLoading(false);
      }
    };
    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    if (!loading) fetchApplications();
  }, [loading]);

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('artist_applications')
      .select('*')
      .order('submitted_at', { ascending: false });
    if (error) {
      console.error(error);
      setMessage('❌ Failed to fetch applications.');
    } else {
      setApplications(data || []);
    }
    setLoading(false);
  };

  const handleAction = async (appId, status, reason = '') => {
    try {
      const { error } = await supabase
        .from('artist_applications')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          rejection_reason: reason,
        })
        .eq('id', appId);

      if (error) throw error;

      // ✅ FIXED: correct template literal
      setMessage(`✅ Application ${status}.`);

      if (status === 'approved') {
        const app = applications.find(a => a.id === appId);
        if (app) {
          const { error: artistError } = await supabase
            .from('artists')
            .insert({
              user_id: app.user_id,
              name: app.stage_name,
            });
          if (artistError) {
            console.error('Failed to create artist:', artistError);
            setMessage('⚠️ Approved but artist record creation failed.');
          } else {
            await supabase.from('user_roles').upsert({
              user_id: app.user_id,
              role: 'artist',
            });
          }
        }
      }
      fetchApplications();
      setSelectedApp(null);
    } catch (err) {
      console.error(err);
      // ✅ FIXED: correct template literal
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  if (loading) return <div className="admin-dashboard">Loading...</div>;

  return (
    <div className="admin-dashboard">
      <h1>⚙️ Admin Dashboard</h1>
      <p>Review pending artist applications.</p>
      {message && <p className="message">{message}</p>}
      <div className="app-list">
        {applications.length === 0 ? (
          <p>No applications.</p>
        ) : (
          applications.map(app => (
            <div key={app.id} className="app-card">
              <div className="app-header">
                <h3>{app.stage_name}</h3>
                {/* ✅ FIXED: proper className interpolation */}
                <span className={`status ${app.status}`}>{app.status}</span>
              </div>
              <p><strong>Full name:</strong> {app.full_name}</p>
              <p><strong>Email:</strong> {app.email}</p>
              <p><strong>Country:</strong> {app.country}</p>
              <p><strong>Genres:</strong> {app.genres?.join(', ')}</p>
              <button onClick={() => setSelectedApp(app)}>View Details</button>
              {app.status === 'pending' && (
                <div className="actions">
                  <button onClick={() => handleAction(app.id, 'approved')} className="approve">✅ Approve</button>
                  <button onClick={() => {
                    const reason = prompt('Rejection reason:');
                    if (reason !== null) handleAction(app.id, 'rejected', reason);
                  }} className="reject">❌ Reject</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      {selectedApp && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setSelectedApp(null)}>&times;</span>
            <h2>{selectedApp.stage_name}</h2>
            <p><strong>Full name:</strong> {selectedApp.full_name}</p>
            <p><strong>Email:</strong> {selectedApp.email}</p>
            <p><strong>Phone:</strong> {selectedApp.phone}</p>
            <p><strong>Country:</strong> {selectedApp.country}</p>
            <p><strong>Culture:</strong> {selectedApp.culture}</p>
            <p><strong>Bio:</strong> {selectedApp.bio}</p>
            <p><strong>Social:</strong> {JSON.stringify(selectedApp.social_links)}</p>
            <p><strong>ID Image:</strong> <a href={selectedApp.id_image_url} target="_blank" rel="noopener noreferrer">View</a></p>
            <p><strong>Video Selfie:</strong> <a href={selectedApp.selfie_video_url} target="_blank" rel="noopener noreferrer">Watch</a></p>
            {selectedApp.status === 'pending' && (
              <div>
                <button onClick={() => handleAction(selectedApp.id, 'approved')} className="approve">✅ Approve</button>
                <button onClick={() => {
                  const reason = prompt('Rejection reason:');
                  if (reason !== null) handleAction(selectedApp.id, 'rejected', reason);
                }} className="reject">❌ Reject</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}