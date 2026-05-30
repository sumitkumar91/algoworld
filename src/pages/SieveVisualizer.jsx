import { useState, useEffect, useCallback } from 'react';
import { Hash, Code, Play, Square, RotateCcw, FastForward, Info } from 'lucide-react';
import SEO from '../components/SEO';
import Button from '../components/Button';
import Card from '../components/Card';
import CodeModal from '../components/CodeModal';
import { numberTheorySnippets } from '../utils/codeSnippets';
import './SieveVisualizer.css';

const SieveVisualizer = () => {
  const [gridSize, setGridSize] = useState(100);
  const [grid, setGrid] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [speed, setSpeed] = useState(100); // ms per step

  // Algorithm State
  const [algo, setAlgo] = useState({
    p: 2,
    multiple: 4,
    phase: 'FIND_PRIME', // FIND_PRIME, MARK_MULTIPLES, DONE
    activePrime: null,
    evaluating: null,
    primesFound: 0,
    statusMessage: 'Ready to find primes!'
  });

  // Initialize Grid
  const initGrid = useCallback((n) => {
    const newGrid = Array(n + 1).fill(null).map((_, i) => ({
      value: i,
      status: i < 2 ? 'composite' : 'unvisited', // 0 and 1 are composite by definition here, though we just hide them or dim them
      markedBy: null
    }));
    setGrid(newGrid);
    setAlgo({
      p: 2,
      multiple: 4,
      phase: 'FIND_PRIME',
      activePrime: null,
      evaluating: null,
      primesFound: 0,
      statusMessage: `Grid initialized to ${n}. Press Play to start.`
    });
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    initGrid(gridSize);
  }, [gridSize, initGrid]);

  const executeStep = () => {
    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      setAlgo(prevAlgo => {
        let { p, multiple, phase, primesFound } = prevAlgo;
        let nextP = p;
        let nextMultiple = multiple;
        let nextPhase = phase;
        let activePrime = null;
        let evaluating = null;
        let statusMessage = '';

        if (phase === 'DONE') {
          setIsPlaying(false);
          return prevAlgo;
        }

        if (phase === 'FIND_PRIME') {
          // Find next unvisited number
          while (nextP * nextP <= gridSize && newGrid[nextP].status === 'composite') {
            nextP++;
          }

          if (nextP * nextP > gridSize) {
            // Optimization: Once p*p > N, all remaining unvisited are prime!
            let newPrimes = 0;
            for (let i = 2; i <= gridSize; i++) {
              if (newGrid[i].status === 'unvisited' || newGrid[i].status === 'prime') {
                newGrid[i].status = 'prime';
                if (prevGrid[i].status !== 'prime') newPrimes++;
              }
            }
            return {
              p: nextP,
              multiple: null,
              phase: 'DONE',
              activePrime: null,
              evaluating: null,
              primesFound: primesFound + newPrimes,
              statusMessage: `Optimization reached! p*p > ${gridSize}. All remaining numbers are Prime!`
            };
          } else {
            // We found a new prime!
            newGrid[nextP].status = 'prime';
            activePrime = nextP;
            nextMultiple = nextP * nextP; // Start crossing out at p^2
            nextPhase = 'MARK_MULTIPLES';
            statusMessage = `Found Prime: ${nextP}. Starting to cross out multiples from ${nextP}^2 = ${nextMultiple}.`;
            return { p: nextP, multiple: nextMultiple, phase: nextPhase, activePrime, evaluating: null, primesFound: primesFound + 1, statusMessage };
          }
        } 
        
        else if (phase === 'MARK_MULTIPLES') {
          activePrime = p;
          if (multiple > gridSize) {
            // Finished this prime's multiples
            nextP = p + 1;
            nextPhase = 'FIND_PRIME';
            statusMessage = `Finished multiples of ${p}. Moving to next uncrossed number.`;
            return { p: nextP, multiple: null, phase: nextPhase, activePrime: null, evaluating: null, primesFound, statusMessage };
          } else {
            // Cross out multiple
            newGrid[multiple].status = 'composite';
            newGrid[multiple].markedBy = p;
            evaluating = multiple;
            nextMultiple = multiple + p;
            statusMessage = `Crossing out ${multiple} (multiple of ${p}).`;
            return { p, multiple: nextMultiple, phase, activePrime, evaluating, primesFound, statusMessage };
          }
        }

        return prevAlgo;
      });
      return newGrid;
    });
  };

  // Run loop
  useEffect(() => {
    let timeout;
    if (isPlaying && algo.phase !== 'DONE') {
      timeout = setTimeout(() => {
        executeStep();
      }, speed);
    } else if (algo.phase === 'DONE') {
      setIsPlaying(false);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, algo.phase, speed, executeStep]);

  // Sizing logic
  let sizeClass = 'size-medium';
  if (gridSize <= 50) sizeClass = 'size-small';
  else if (gridSize <= 150) sizeClass = 'size-medium';
  else if (gridSize <= 300) sizeClass = 'size-large';
  else sizeClass = 'size-xlarge';

  return (
    <div className="container animate-fade-in sieve-page-container">
      <SEO 
        title="Sieve of Eratosthenes - AlgoWorld" 
        description="Visualize finding prime numbers using the ancient Sieve of Eratosthenes algorithm." 
        path="/sieve" 
      />
      
      <div className="sieve-header">
        <h1>Sieve of Eratosthenes <Hash size={36} className="inline-icon" /></h1>
        <p className="subtitle">An ancient, beautiful algorithm for discovering Prime Numbers.</p>
      </div>

      <div className="sieve-layout">
        
        {/* SIDEBAR */}
        <div className="sieve-sidebar">
          <Card className="controls-card">
            <h3>Algorithm Controls</h3>
            
            <div className="sieve-slider-container mt-4">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Grid Size (N)</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{gridSize}</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="400" 
                step="10"
                value={gridSize}
                onChange={(e) => setGridSize(parseInt(e.target.value))}
                className="sieve-slider"
                disabled={isPlaying || algo.phase !== 'FIND_PRIME' || algo.p > 2}
              />
            </div>

            <div className="sieve-slider-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Speed</span>
                <span style={{ color: 'var(--text-primary)' }}>{speed}ms</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="500" 
                step="10"
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="sieve-slider"
                style={{ direction: 'rtl' }} // Faster on the right
              />
            </div>

            <div className="divider"></div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Button 
                variant="primary" 
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex-1 flex-center"
                disabled={algo.phase === 'DONE'}
              >
                {isPlaying ? <Square size={16} /> : <Play size={16} />}
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => executeStep()}
                className="flex-1 flex-center gap-1"
                disabled={isPlaying || algo.phase === 'DONE'}
              >
                Step <FastForward size={14} />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => initGrid(gridSize)}
                className="flex-center"
                title="Reset Grid"
              >
                <RotateCcw size={16} />
              </Button>
            </div>

            <div className="sieve-stats">
              <div className="stat-box">
                <div className="stat-label">Primes Found</div>
                <div className="stat-value" style={{ color: '#00e676' }}>{algo.primesFound}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Progress</div>
                <div className="stat-value">
                  {algo.phase === 'DONE' ? '100%' : `${Math.min(100, Math.floor(((algo.p * algo.p) / gridSize) * 100))}%`}
                </div>
              </div>
            </div>

            <Button variant="outline" onClick={() => setIsCodeModalOpen(true)} className="w-full flex-center gap-2">
              <Code size={16} /> View Code
            </Button>
          </Card>
        </div>
        
        {/* MAIN VISUALS */}
        <div className="sieve-main">
          
          <div className={`sieve-status ${algo.phase === 'MARK_MULTIPLES' ? 'evaluating' : ''}`}>
            {algo.statusMessage}
          </div>

          <div className="sieve-grid-container">
            <div className={`sieve-grid ${sizeClass}`}>
              {grid.slice(2).map((cell) => {
                const isEvaluating = algo.evaluating === cell.value;
                const isActivePrime = algo.activePrime === cell.value;
                
                let cellClass = '';
                if (isActivePrime) cellClass = 'active-prime';
                else if (isEvaluating) cellClass = 'evaluating';
                else if (cell.status === 'prime') cellClass = 'prime';
                else if (cell.status === 'composite') cellClass = 'composite';

                return (
                  <div key={cell.value} className={`sieve-cell ${cellClass}`}>
                    {cell.value}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sieve-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}></div> Unvisited
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#00e676' }}></div> Current Prime
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: 'rgba(0, 230, 118, 0.2)', border: '1px solid #00e676' }}></div> Prime
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: 'rgba(0, 229, 255, 0.3)', border: '1px solid #00e5ff' }}></div> Crossing Out
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: 'rgba(0,0,0,0.4)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '2px', background: '#ff1744', transform: 'translateY(-50%) rotate(-45deg)' }}></div>
              </div> Composite
            </div>
          </div>

        </div>
      </div>
      
      <CodeModal 
        isOpen={isCodeModalOpen} 
        onClose={() => setIsCodeModalOpen(false)} 
        code={numberTheorySnippets.SIEVE} 
        title="Sieve of Eratosthenes" 
      />
    </div>
  );
};

export default SieveVisualizer;
