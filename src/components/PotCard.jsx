function PotCard({ title, description, imageSrc }) {
  return (
    <div style={{ border: '1px solid #C8732A', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
      {imageSrc && <img src={imageSrc} alt={title} style={{ width: '100px' }} />}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default PotCard;
