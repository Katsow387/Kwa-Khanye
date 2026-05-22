import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

function HomeVR() {
  const [artworks, setArtworks] = useState([]);

  useEffect(() => {
    const fetchArt = async () => {
      const { data, error } = await supabase.from('vr_art').select('*');
      if (error) console.error(error);
      else setArtworks(data || []);
    };
    fetchArt();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Virtual Kraal – Art & Museum</h2>
      {artworks.length === 0 ? <p>No art yet. Add some in Supabase.</p> : (
        artworks.map(art => (
          <div key={art.id}>
            <h3>{art.title}</h3>
            <p>{art.description}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default HomeVR;
