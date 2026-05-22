import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

function Music() {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    const fetchMusic = async () => {
      const { data, error } = await supabase.from('music').select('*');
      if (error) console.error(error);
      else setTracks(data || []);
    };
    fetchMusic();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Music</h2>
      {tracks.length === 0 ? (
        <p>No music found. Add some data in Supabase.</p>
      ) : (
        tracks.map(track => (
          <div key={track.id} style={{ marginBottom: '1rem' }}>
            <h3>{track.title}</h3>
            <p>{track.artist}</p>
            <p>{track.description}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Music;
