import { Link, useLocation } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="app-header">
      <div className="container header-container">
        <Link to="/" className="logo">
          <Compass className="logo-icon" />
          <span className="logo-text">AlgoVerse</span>
        </Link>
        
        <nav className="main-nav">
          {!isHome && (
            <Link to="/" className="nav-link glass-panel">
              <Home size={18} />
              <span>Dashboard</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
