import './ImageContainer.css';

export default function ImageContainer({ 
  children, 
  variant = 'default',
  label = null,
  className = ''
}) {
  return (
    <div className={`image-container image-container-${variant} ${className}`}>
      {label && <p className="container-label">{label}</p>}
      <div className="container-content">
        {children}
      </div>
    </div>
  );
}
