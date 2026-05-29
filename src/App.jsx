import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import CategoryPage from './pages/CategoryPage';
import TowersOfHanoi from './pages/TowersOfHanoi';
import MontyHall from './pages/MontyHall';
import SortingVisualizer from './pages/SortingVisualizer';
import BinaryTreeVisualizer from './pages/BinaryTreeVisualizer';
import CollatzConjecture from './pages/CollatzConjecture';
import KaprekarRoutine from './pages/KaprekarRoutine';
import GraphVisualizer from './pages/GraphVisualizer';
import LinkedListVisualizer from './pages/LinkedListVisualizer';
import StacksQueuesVisualizer from './pages/StacksQueuesVisualizer';
import ArrayVisualizer from './pages/ArrayVisualizer';
import './App.css';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="app-container">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/category/:categoryId" element={<CategoryPage />} />
              <Route path="/hanoi" element={<TowersOfHanoi />} />
              <Route path="/monty-hall" element={<MontyHall />} />
              <Route path="/sorting" element={<SortingVisualizer />} />
              <Route path="/tree" element={<BinaryTreeVisualizer />} />
              <Route path="/collatz" element={<CollatzConjecture />} />
              <Route path="/kaprekar" element={<KaprekarRoutine />} />
              <Route path="/graph" element={<GraphVisualizer />} />
              <Route path="/linked-list" element={<LinkedListVisualizer />} />
              <Route path="/stacks-queues" element={<StacksQueuesVisualizer />} />
              <Route path="/array" element={<ArrayVisualizer />} />
            </Routes>
          </main>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
