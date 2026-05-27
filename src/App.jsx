import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import TowersOfHanoi from './pages/TowersOfHanoi';
import MontyHall from './pages/MontyHall';
import SortingVisualizer from './pages/SortingVisualizer';
import BinaryTreeVisualizer from './pages/BinaryTreeVisualizer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/hanoi" element={<TowersOfHanoi />} />
            <Route path="/monty-hall" element={<MontyHall />} />
            <Route path="/sorting" element={<SortingVisualizer />} />
            <Route path="/tree" element={<BinaryTreeVisualizer />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
