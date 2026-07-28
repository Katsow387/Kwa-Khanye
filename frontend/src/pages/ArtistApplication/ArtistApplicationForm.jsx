import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../supabase';
import './ArtistApplicationForm.css';

export default function ArtistApplicationForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    stage_name: '',
    email: '',
    phone: '',
    country: '',
    culture: '',
    genres: [],
    bio: '',
    social_links: { instagram: '', spotify: '', youtube: '' },
  });
  const [idFile, setIdFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      setUserId(user.id);
      setFormData(prev => ({ ...prev, email: user.email }));
    };
    getUser();
  }, [navigate]);

  const onDropId = (accepted) => { if (accepted.length) setIdFile(accepted[0]); };
  const onDropVideo = (accepted) => { if (accepted.length) setVideoFile(accepted[0]); };
  const { getRootProps: getIdRoot, getInputProps: getIdInput } = useDropzone({ 
    onDrop: onDropId, 
    maxFiles: 1, 
    accept: { 'image/*': [] } 
  });
  const { getRootProps: getVideoRoot, getInputProps: getVideoInput } = useDropzone({ 
    onDrop: onDropVideo, 
    maxFiles: 1, 
    accept: { 'video/*': [] } 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      social_links: { ...prev.social_links, [name]: value } 
    }));
  };

  const handleGenres = (e) => {
    const vals = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, genres: vals }));
  };

  const uploadFile = async (file, folder) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${folder}/${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from('artist_docs')
      .upload(fileName, file, { cacheControl: '3600' });
    if (error) throw error;
    const { data } = supabase.storage
      .from('artist_docs')
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setMessage('❌ User not authenticated.');
      setMessageType('error');
      return;
    }
    if (!idFile || !videoFile) {
      setMessage('❌ Please upload both ID image and video selfie.');
      setMessageType('error');
      return;
    }
    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const idUrl = await uploadFile(idFile, 'ids');
      const videoUrl = await uploadFile(videoFile, 'videos');

      const { error: insertError } = await supabase
        .from('artist_applications')
        .insert({
          user_id: userId,
          full_name: formData.full_name,
          stage_name: formData.stage_name,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          culture: formData.culture,
          genres: formData.genres,
          bio: formData.bio,
          social_links: formData.social_links,
          id_image_url: idUrl,
          selfie_video_url: videoUrl,
          status: 'pending',
        });

      if (insertError) throw insertError;

      setMessage('✅ Application submitted! Await admin approval.');
      setMessageType('success');
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      console.error(err);
      setMessage(`❌ Error: ${err.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="application-form">
      <form onSubmit={handleSubmit}>
        {/* ─── Header with Logo ─── */}
        <div className="form-header">
          <img 
            src="/assets/images/KwaKhanye_logo.jpeg" 
            alt="Kwa Khanye Logo" 
            className="form-logo" 
          />
          <div className="form-header-text">
            <h1>🎤 Artist Application</h1>
            <p>Fill in your details and submit your ID and video selfie for verification.</p>
          </div>
        </div>

        {/* ─── Form fields ─── */}
        <div className="form-group">
          <label>Full Name <span className="required-star">*</span></label>
          <input 
            name="full_name" 
            value={formData.full_name} 
            onChange={handleChange} 
            required 
            placeholder="e.g., Thabo Mokoena"
          />
        </div>

        <div className="form-group">
          <label>Stage Name <span className="required-star">*</span></label>
          <input 
            name="stage_name" 
            value={formData.stage_name} 
            onChange={handleChange} 
            required 
            placeholder="e.g., Thabo The Poet"
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input name="email" value={formData.email} disabled />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange} 
            placeholder="+27 82 123 4567"
          />
        </div>

        <div className="form-group">
          <label>Country</label>
          <input 
            name="country" 
            value={formData.country} 
            onChange={handleChange} 
            placeholder="South Africa"
          />
        </div>

        <div className="form-group">
          <label>Culture / Tribe</label>
          <input 
            name="culture" 
            value={formData.culture} 
            onChange={handleChange} 
            placeholder="Zulu, Xhosa, etc."
          />
        </div>

        <div className="form-group">
          <label>Genres (comma separated)</label>
          <input 
            name="genres" 
            value={formData.genres.join(', ')} 
            onChange={handleGenres} 
            placeholder="Afrobeat, Maskandi, Jazz, etc."
          />
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea 
            name="bio" 
            value={formData.bio} 
            onChange={handleChange} 
            rows="4"
            placeholder="Tell us about yourself and your music journey..."
          />
        </div>

        <div className="form-group">
          <label>Social Links</label>
          <div className="social-links-row">
            <input 
              name="instagram" 
              placeholder="Instagram handle" 
              value={formData.social_links.instagram} 
              onChange={handleSocialChange} 
            />
            <input 
              name="spotify" 
              placeholder="Spotify URL" 
              value={formData.social_links.spotify} 
              onChange={handleSocialChange} 
            />
            <input 
              name="youtube" 
              placeholder="YouTube URL" 
              value={formData.social_links.youtube} 
              onChange={handleSocialChange} 
            />
          </div>
        </div>

        <div className="form-group">
          <label>Upload Government ID (photo) <span className="required-star">*</span></label>
          <div {...getIdRoot()} className="dropzone">
            <input {...getIdInput()} />
            {idFile ? (
              <p className="file-name">📎 {idFile.name}</p>
            ) : (
              <p>Drag or click to upload ID image (JPG, PNG)</p>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Upload Video Selfie (short clip) <span className="required-star">*</span></label>
          <div {...getVideoRoot()} className="dropzone">
            <input {...getVideoInput()} />
            {videoFile ? (
              <p className="file-name">🎥 {videoFile.name}</p>
            ) : (
              <p>Drag or click to upload a short video selfie (MP4, MOV, etc.)</p>
            )}
          </div>
        </div>

        <button 
          type="submit" 
          className="form-submit-btn" 
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>

        {message && (
          <p className={`message ${messageType}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}