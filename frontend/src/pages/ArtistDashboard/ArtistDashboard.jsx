import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../supabase';
import './ArtistDashboard.css';

const TABS = { SONG: 'song', VR: 'vr', BIOSCOPE: 'bioscope' };

export default function ArtistDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS.SONG);
  const [artistId, setArtistId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [file, setFile] = useState(null);

  // ─── CHECK ARTIST STATUS ──────────────────────────────────
  useEffect(() => {
    const checkArtist = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      const { data, error } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error || !data) {
        setMessage('⚠️ You must apply and be approved as an artist first.');
        setTimeout(() => {
          navigate('/artist-application', { replace: true });
        }, 1500);
        setLoading(false);
        return;
      }
      setArtistId(data.id);
      setLoading(false);
    };
    checkArtist();
  }, [navigate]);

  const onDrop = (accepted) => { if (accepted.length) setFile(accepted[0]); };
  const { getRootProps, getInputProps } = useDropzone({ onDrop, maxFiles: 1 });

  const onSubmit = async (data) => {
    if (!artistId) { setMessage('❌ Artist ID missing'); return; }
    if (!file) { setMessage('❌ Please select a file'); return; }
    setLoading(true);
    setMessage('');

    try {
      const fileExt = file.name.split('.').pop();
      // ✅ FIXED: correct template literal
      const fileName = `artist_${artistId}/${activeTab}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
      const fileUrl = urlData.publicUrl;

      const { error: insertError } = await supabase
        .from('artist_uploads')
        .insert({
          artist_id: artistId,
          category: activeTab,
          title: data.title,
          description: data.description || '',
          file_url: fileUrl,
          metadata: { originalName: file.name }
        });
      if (insertError) throw insertError;

      setMessage('✅ Upload successful!');
      reset();
      setFile(null);
    } catch (err) {
      console.error(err);
      // ✅ FIXED: correct template literal
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const tabStyle = (tab) => ({
    padding: '0.5rem 1.2rem',
    border: '1px solid rgba(198,122,52,0.3)',
    borderRadius: '50px',
    background: activeTab === tab ? '#c67a34' : 'transparent',
    color: activeTab === tab ? '#fff' : '#f4d090',
    cursor: 'pointer',
    marginRight: '0.5rem',
    transition: 'all 0.2s'
  });

  if (loading) {
    return <div className="artist-dashboard" style={{ textAlign: 'center', paddingTop: '4rem' }}><p style={{ color: '#f4d090' }}>Checking your artist status...</p></div>;
  }

  if (!artistId) {
    return <div className="artist-dashboard" style={{ textAlign: 'center', paddingTop: '4rem' }}><p style={{ color: '#f4d090' }}>{message || 'Redirecting...'}</p></div>;
  }

  return (
    <div className="artist-dashboard">
      <h1>🎨 Artist Dashboard</h1>
      <p>Upload your songs, VR experiences, and bioscope content.</p>

      <div style={{ display: 'flex', margin: '1.5rem 0' }}>
        <button style={tabStyle(TABS.SONG)} onClick={() => setActiveTab(TABS.SONG)}>🎵 Song</button>
        <button style={tabStyle(TABS.VR)} onClick={() => setActiveTab(TABS.VR)}>🥽 VR</button>
        <button style={tabStyle(TABS.BIOSCOPE)} onClick={() => setActiveTab(TABS.BIOSCOPE)}>🎬 Bioscope</button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '500px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.3rem', color: '#f4d090' }}>Title *</label>
          <input 
            {...register('title', { required: true })} 
            style={{ width: '100%', padding: '0.5rem', background: '#1a0f0a', border: '1px solid rgba(198,122,52,0.3)', color: '#f4d090', borderRadius: '6px' }} 
          />
          {errors.title && <span style={{ color: '#ff6b6b' }}>Title is required</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.3rem', color: '#f4d090' }}>Description</label>
          <textarea 
            {...register('description')} 
            style={{ width: '100%', padding: '0.5rem', background: '#1a0f0a', border: '1px solid rgba(198,122,52,0.3)', color: '#f4d090', borderRadius: '6px' }} 
            rows="3" 
          />
        </div>

        <div {...getRootProps()} style={{ padding: '1.5rem', border: '2px dashed rgba(198,122,52,0.5)', borderRadius: '8px', textAlign: 'center', marginBottom: '1rem', cursor: 'pointer' }}>
          <input {...getInputProps()} />
          {file ? <p>📎 {file.name}</p> : <p>Drag & drop a file here, or click to select</p>}
        </div>

        <button type="submit" disabled={loading} style={{ padding: '0.75rem 2rem', background: '#c67a34', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '1rem', cursor: 'pointer' }}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>

        {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
      </form>
    </div>
  );
}