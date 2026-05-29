import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import Card from '../components/Card';
import { categories } from '../data/categories';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="container animate-fade-in dashboard-container">
      <SEO 
        title="AlgoWorld - Interactive Algorithm Visualizations" 
        description="Explore the AlgoWorld! Interactive mathematical simulations and logic puzzles including Sorting, Graphs, Towers of Hanoi, and more." 
        path="/" 
      />
      <section className="hero-section">
        <h1 className="hero-title">
          Explore the <span className="highlight">AlgoWorld</span>
        </h1>
        <p className="hero-subtitle">
          Interactive mathematical simulations and logic puzzles.
        </p>
      </section>

      <section className="simulations-grid">
        {categories.map((category) => (
          <Card 
            key={category.id} 
            className={`sim-card ${category.color}-theme`}
            hoverEffect={true}
            onClick={() => navigate(`/category/${category.id}`)}
          >
            <div className="sim-card-header">
              <div className="icon-wrapper">
                {category.icon}
              </div>
              <h2 className="sim-title">{category.title}</h2>
            </div>
            <div className="sim-description">
              <p>{category.description}</p>
              <div className="category-modules-list" style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {category.modules.map(mod => (
                  <span key={mod.id} style={{ 
                    background: 'rgba(255, 255, 255, 0.1)', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '999px', 
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)'
                  }}>
                    {mod.title}
                  </span>
                ))}
              </div>
            </div>
            <div className="sim-footer">
              <span className="launch-text">View Modules &rarr;</span>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
};

export default Dashboard;
