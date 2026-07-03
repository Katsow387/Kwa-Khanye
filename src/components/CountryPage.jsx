import { useParams, useNavigate } from 'react-router-dom';
import { COUNTRIES } from '../constants/countries';

// --- Import your background image ---
import backgroundImage from '../assets/images/Music Back.jpg';

// --- Import culture images ---
import ZuluImg from '../assets/images/Zulu.jpg';
import XitsongaImg from '../assets/images/Xitsonga.jpg';
import VendaImg from '../assets/images/Venda.jpg';
import SothoImg from '../assets/images/Sotho.jpg';
import SetswanaImg from '../assets/images/Setswana.jpg';
import NdebeleImg from '../assets/images/Ndebele.jpg';
import BapediImg from '../assets/images/Bapedi.jpg';

const imageMap = {
  'Zulu.jpg': ZuluImg,
  'Xitsonga.jpg': XitsongaImg,
  'Venda.jpg': VendaImg,
  'Sotho.jpg': SothoImg,
  'Setswana.jpg': SetswanaImg,
  'Ndebele.jpg': NdebeleImg,
  'Bapedi.jpg': BapediImg,
};

function getCultureImage(filename) {
  return imageMap[filename] || null;
}

export default function CountryPage() {
  const { countryId } = useParams();
  const navigate = useNavigate();
  const country = COUNTRIES.find(c => c.id === countryId);

  if (!country) return <div style={{ padding: '2rem', color: 'white' }}>Country not found</div>;

  const handleCultureSelect = (culture) => {
    navigate(`/country/${countryId}/culture/${culture.id}/artists`);
  };

  return (
    <div
      className="country-page-container"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundAttachment: 'fixed',
        backgroundColor: 'rgba(26, 15, 10, 0.85)',
        backgroundBlendMode: 'multiply',
      }}
    >
      <div className="country-page-content">
        <button onClick={() => navigate('/')} className="cultural-back-btn">
          ⬅ Back to Countries
        </button>

        <div className="country-header">
          {/* Flag + country name */}
          <div className="country-flag-name-group">
            <img
              src={`https://flagcdn.com/${country.id}.svg`}
              alt={country.name}
              className="country-flag-large"
            />
            <span className="country-name-large">{country.name}</span>
          </div>
          <h2 className="country-heading-large">Choose a Culture</h2>
          <p className="country-subheading-large">Each culture has its own sound, stories, and artists.</p>
        </div>

        <div className="culture-selection-grid">
          {country.cultures.map(culture => {
            const imgSrc = getCultureImage(culture.image);
            return (
              <button
                key={culture.id}
                onClick={() => handleCultureSelect(culture)}
                className="culture-grid-card cultural-card"
              >
                {imgSrc ? (
                  <div className="culture-image-frame">
                    <img src={imgSrc} alt={culture.name} className="culture-image" />
                  </div>
                ) : (
                  <div className="culture-symbol-box">{culture.symbol}</div>
                )}
                <div className="culture-name-text">{culture.name}</div>
                <div className="culture-aka-text">{culture.aka}</div>
              </button>
            );
          })}
        </div>

        {/* Hut decoration */}
        <div className="hut-decoration">
          <div className="hut-roof"></div>
          <div className="hut-body">
            <div className="hut-door"></div>
          </div>
        </div>
      </div>
    </div>
  );
}