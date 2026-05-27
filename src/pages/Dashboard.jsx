import { useNavigate } from 'react-router-dom';
import { Layers, DoorOpen, BarChart2, GitMerge } from 'lucide-react';
import Card from '../components/Card';
import './Dashboard.css';

const simulations = [
  {
    id: 'hanoi',
    title: 'Towers of Hanoi',
    description: 'A mathematical puzzle where you move a stack of disks from one rod to another, following specific rules.',
    icon: <Layers size={32} className="sim-icon hanoi-icon" />,
    path: '/hanoi',
    color: 'cyan'
  },
  {
    id: 'monty-hall',
    title: 'Monty Hall Problem',
    description: 'A probability brain teaser based on a game show. Does swapping your choice increase your chances of winning?',
    icon: <DoorOpen size={32} className="sim-icon monty-icon" />,
    path: '/monty-hall',
    color: 'purple'
  },
  {
    id: 'sorting',
    title: 'Sorting Algorithms',
    description: 'Visualize Insertion, Selection, Merge, and Quick Sort as they organize randomized array data in real-time.',
    icon: <BarChart2 size={32} className="sim-icon sorting-icon" style={{color: '#ff7f50'}} />,
    path: '/sorting',
    color: 'orange'
  },
  {
    id: 'tree',
    title: 'Binary Search Tree',
    description: 'Build a BST by inserting and deleting nodes, and watch In-Order, Pre-Order, and Post-Order traversals.',
    icon: <GitMerge size={32} className="sim-icon tree-icon" style={{color: '#cddc39'}} />,
    path: '/tree',
    color: 'yellow'
  }
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="container animate-fade-in">
      <section className="hero-section">
        <h1 className="hero-title">
          Explore the <span className="highlight">AlgoVerse</span>
        </h1>
        <p className="hero-subtitle">
          Interactive mathematical simulations and logic puzzles.
        </p>
      </section>

      <section className="simulations-grid">
        {simulations.map((sim) => (
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

export default Dashboard;
