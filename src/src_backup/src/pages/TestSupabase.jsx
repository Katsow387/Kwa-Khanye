import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

const TestSupabase = () => {
  const [music, setMusic] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMusic = async () => {
      const { data, error } = await supabase.from('music').select('*');
      if (error) console.error('Error:', error);
      else setMusic(data || []);
      setLoading(false);
    };
    fetchMusic();
  }, []);

  if (loading) return <div>Loading music data...</div>;

  return (
    <div>
      <h2>Music from Supabase</h2>
      {music.length === 0 ? (
        <p>No music found. Add some sample data.</p>
      ) : (
        music.map((item) => (
          <div key={item.id}>
            <strong>{item.title}</strong> â€“ {item.artist}
            <p>{item.description}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default TestSupabase;

