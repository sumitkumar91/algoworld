import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';
import Card from '../components/Card';
import Button from '../components/Button';
import { categories } from '../data/categories';
import './CategoryPage.css';
import './Dashboard.css'; // Reuse some grid classes

const CategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const category = categories.find(c => c.id === categoryId);

  if (!category) {
    return (
      <div className="container animate-fade-in category-not-found">
        <h2>Category Not Found</h2>
        <Button onClick={() => navigate('/')}>Return Home</Button>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in category-page-container">
      <SEO 
        title={`${category.title} - AlgoWorld`} 
        description={category.description}
        path={`/category/${categoryId}`} 
      />
      
      <div className="category-header-bar">
        <button className="back-button" onClick={() => navigate('/')}>
          <ArrowLeft size={20} /> Back to Categories
        </button>
      </div>

      <section className="hero-section category-hero">
        <div className="category-icon-large">
          {category.icon}
        </div>
        <h1 className="hero-title">
          {category.title}
        </h1>
        <p className="hero-subtitle">
          {category.description}
        </p>
      </section>

      <section className="simulations-grid">
        {category.modules.map((sim) => (
          <Card 
            key={sim.id} 
            className={`sim-card ${sim.color}-theme`}
            hoverEffect={true}
            onClick={() => navigate(sim.path)}
          >
            <div className="sim-card-header">
              <div className="icon-wrapper">
                {sim.icon}
              </div>
              <h2 className="sim-title">{sim.title}</h2>
            </div>
            <p className="sim-description">{sim.description}</p>
            <div className="sim-footer">
              <span className="launch-text">Launch Simulation &rarr;</span>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
};

export default CategoryPage;
