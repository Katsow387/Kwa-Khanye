import { useEffect, useState } from 'react';
import { supabase } from '../../supabase';

function Bioscope() {
  const [films, setFilms] = useState([]);

  useEffect(() => {
    const fetchFilms = async () => {
      const { data, error } = await supabase.from('bioscope').select('*');
      if (error) console.error(error);
      else setFilms(data || []);
    };
    fetchFilms();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Bioscope – Films & Documentaries</h2>
      {films.length === 0 ? <p>No films yet. Add some in Supabase.</p> : (
        films.map(film => (
          <div key={film.id}>
            <h3>{film.title}</h3>
            <p>{film.type} – {film.description}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Bioscope;
