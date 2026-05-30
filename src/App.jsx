import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import CategoryPage from './pages/CategoryPage';
import TowersOfHanoi from './pages/TowersOfHanoi';
import MontyHall from './pages/MontyHall';
import SortingVisualizer from './pages/SortingVisualizer';
import SearchVisualizer from './pages/SearchVisualizer';
import BinaryTreeVisualizer from './pages/BinaryTreeVisualizer';
import CollatzConjecture from './pages/CollatzConjecture';
import KaprekarRoutine from './pages/KaprekarRoutine';
import GraphVisualizer from './pages/GraphVisualizer';
import LinkedListVisualizer from './pages/LinkedListVisualizer';
import StacksQueuesVisualizer from './pages/StacksQueuesVisualizer';
import ArrayVisualizer from './pages/ArrayVisualizer';
import HashTableVisualizer from './pages/HashTableVisualizer';
import HeapVisualizer from './pages/HeapVisualizer';
import BitwiseVisualizer from './pages/BitwiseVisualizer';
import LogicGatesVisualizer from './pages/LogicGatesVisualizer';
import FloatingPointVisualizer from './pages/FloatingPointVisualizer';
import AssemblyVisualizer from './pages/AssemblyVisualizer';
import CacheVisualizer from './pages/CacheVisualizer';
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
              <Route path="/search" element={<SearchVisualizer />} />
              <Route path="/tree" element={<BinaryTreeVisualizer />} />
              <Route path="/collatz" element={<CollatzConjecture />} />
              <Route path="/kaprekar" element={<KaprekarRoutine />} />
              <Route path="/graph" element={<GraphVisualizer />} />
              <Route path="/linked-list" element={<LinkedListVisualizer />} />
              <Route path="/stacks-queues" element={<StacksQueuesVisualizer />} />
              <Route path="/array" element={<ArrayVisualizer />} />
              <Route path="/hashmap" element={<HashTableVisualizer />} />
              <Route path="/heap" element={<HeapVisualizer />} />
              <Route path="/bitwise" element={<BitwiseVisualizer />} />
              <Route path="/logic-gates" element={<LogicGatesVisualizer />} />
              <Route path="/floating-point" element={<FloatingPointVisualizer />} />
              <Route path="/assembly" element={<AssemblyVisualizer />} />
              <Route path="/caching" element={<CacheVisualizer />} />
            </Routes>
          </main>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
