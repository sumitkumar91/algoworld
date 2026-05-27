import './Card.css';

const Card = ({ children, className = '', hoverEffect = false, onClick }) => {
  const isClickable = !!onClick;
  
  return (
    <div 
      className={`custom-card glass-panel ${hoverEffect ? 'hover-effect' : ''} ${isClickable ? 'clickable' : ''} ${className}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export default Card;
