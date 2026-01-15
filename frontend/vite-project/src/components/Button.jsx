import './Button.css';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  onClick = null,
  className = ''
}) {
  return (
    <button 
      className={`btn btn-${variant} btn-${size} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
