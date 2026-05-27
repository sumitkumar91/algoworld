import './Button.css';

const Button = ({ children, variant = 'primary', onClick, className = '', disabled = false }) => {
  return (
    <button 
      className={`custom-button ${variant} ${className}`} 
      onClick={onClick}
      disabled={disabled}
    >
      <span className="button-content">{children}</span>
      <div className="button-glow"></div>
    </button>
  );
};

export default Button;
