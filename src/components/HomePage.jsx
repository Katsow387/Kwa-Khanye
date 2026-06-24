import { useNavigate } from 'react-router-dom';
import { useSession } from '../App';
import { COUNTRIES } from '../constants/countries';
import backgroundImage from '../assets/images/Background_image.png';
import globeImage from '../assets/images/Globe.jpg';
import Header from './Header';  // <-- import the header

function CountryStep({ onSelect, isGuest }) {
  return (
    <div>
      <div className="country-step-header">
        {globeImage ? (
          <img src={globeImage} alt="Globe" className="country-globe-img" />
        ) : (
          <span style={{ fontSize: '2.8rem' }}>🌍</span>
        )}
        <div>
          <div className="step-badge-container">
            <span className="step-badge-text">CHOOSE COUNTRY</span>
          </div>
          <h2 className="explore-card-heading">WHERE DO YOU WANT TO EXPLORE?</h2>
          <p className="explore-card-subheading">Select a country to discover its cultures and artists.</p>
        </div>
      </div>

      <div className="country-selection-grid">
        {COUNTRIES.map(c => {
          const guestCanAccess = c.guestAccessible === true;
          const isDisabled = !c.available || (isGuest && !guestCanAccess);

          return (
            <button
              key={c.id}
              onClick={() => {
                if (c.available && (!isGuest || guestCanAccess)) {
                  onSelect(c);
                }
              }}
              disabled={isDisabled}
              className={`country-grid-card ${c.available ? 'card-active' : 'card-disabled'}`}
            >
              <div className="flag-visual-container">
                <img 
                  src={`https://flagcdn.com/${c.id}.svg`} 
                  alt={c.name} 
                  className="country-flag-asset"
                />
              </div>
              <div className="country-iso-display-code">{c.code}</div>
              <span className="country-card-name">{c.name}</span>
              <span className="country-card-tagline">{c.tagline}</span>
              
              {isGuest && !guestCanAccess && c.available && (
                <div className="guest-lockout-mask">
                  <span className="lockout-text">Sign in to explore</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const session = useSession();

  const handleCountrySelect = (country) => {
    navigate(`/country/${country.id}`);
  };

  return (
    <>
      {/* Header rendered here – outside the fixed background container */}
      <Header session={session} />

      <div 
        className="global-app-container" 
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundColor: '#1a0d06',
        }}
      >
        <div className="hero-viewport">
          <div className="main-content-layout-wrapper">
            <div className="hero-branding-center">
              <h1 className="hero-main-title">Kraal Culture</h1>
              <p className="hero-sub-tagline">EMBARK ON A JOURNEY THE KRAAL IS OPEN</p>
            </div>

            <div className="central-exploration-card">
              <div className="top-edge-accent-line" />
              <CountryStep onSelect={handleCountrySelect} isGuest={!session} />
            </div>
          </div>

          <footer className="global-proverb-footer-bar">
            <p className="proverb-translation-string">
              Umuntu ngumuntu ngabantu. A person is a person through other persons.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}