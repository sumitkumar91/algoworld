import { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, FastForward, SlidersHorizontal, BarChart3, LayoutGrid, Settings2, Swords } from 'lucide-react';
import SEO from '../components/SEO';
import Button from '../components/Button';
import Card from '../components/Card';
import './SortingVisualizer.css';
import {
  getInsertionSortAnimations,
  getSelectionSortAnimations,
  getMergeSortAnimations,
  getQuickSortAnimations,
} from '../utils/sortingAlgorithms';

const PRIMARY_COLOR = 'var(--accent-cyan)';
const SECONDARY_COLOR = 'var(--danger)';
const SORTED_COLOR = 'var(--success)';

const ALGORITHMS = [
  { id: 'insertion', name: 'Insertion Sort', getAnimations: getInsertionSortAnimations },
  { id: 'selection', name: 'Selection Sort', getAnimations: getSelectionSortAnimations },
  { id: 'merge', name: 'Merge Sort', getAnimations: getMergeSortAnimations },
  { id: 'quick', name: 'Quick Sort', getAnimations: getQuickSortAnimations },
];

const SortingVisualizer = () => {
  const [array, setArray] = useState([]);
  const [arraySize, setArraySize] = useState(50);
  const [animationSpeed, setAnimationSpeed] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [algoName, setAlgoName] = useState('Select an Algorithm');
  const [isRacing, setIsRacing] = useState(false);
  
  // Keep track of timeouts to clear them if unmounted/reset early (optional, but good practice)
  const timeoutsRef = useRef([]);

  useEffect(() => {
    resetArray();
    return () => {
      // Clear timeouts on unmount
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [arraySize]);

  const resetArray = () => {
    if (isRunning) return;
    
    // Clear any pending animations
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    
    setIsRacing(false);
    const newArray = [];
    for (let i = 0; i < arraySize; i++) {
      newArray.push(randomIntFromInterval(10, 400));
    }
    setArray(newArray);
    
    // Reset colors for all bars in the DOM
    const allBars = document.querySelectorAll('.array-bar');
    allBars.forEach(bar => {
      bar.style.backgroundColor = PRIMARY_COLOR;
    });
    
    setAlgoName('Select an Algorithm');
  };

  const randomIntFromInterval = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const animateSort = (animations, algo, prefix = 'main') => {
    return new Promise((resolve) => {
      const arrayBars = document.getElementsByClassName(`array-bar-${prefix}`);
      
      for (let i = 0; i < animations.length; i++) {
        const [type, idx1, arg3] = animations[i];
        
        if (type === 'compare' || type === 'revert') {
          const color = type === 'compare' ? SECONDARY_COLOR : PRIMARY_COLOR;
          const t = setTimeout(() => {
            if (arrayBars[idx1]) arrayBars[idx1].style.backgroundColor = color;
            if (arrayBars[arg3]) arrayBars[arg3].style.backgroundColor = color;
          }, i * animationSpeed);
          timeoutsRef.current.push(t);
        } else if (type === 'overwrite') {
          const t = setTimeout(() => {
            if (arrayBars[idx1]) {
              arrayBars[idx1].style.height = `${arg3}px`;
            }
          }, i * animationSpeed);
          timeoutsRef.current.push(t);
        }
      }

      // After sort completes, sweeping green effect
      const tAfter = setTimeout(() => {
        for (let i = 0; i < arrayBars.length; i++) {
          const tSweep = setTimeout(() => {
            if (arrayBars[i]) arrayBars[i].style.backgroundColor = SORTED_COLOR;
          }, i * (1000 / Math.max(1, arrayBars.length)));
          timeoutsRef.current.push(tSweep);
        }
        
        const tDone = setTimeout(() => {
          resolve();
        }, 1000);
        timeoutsRef.current.push(tDone);
        
      }, animations.length * animationSpeed);
      
      timeoutsRef.current.push(tAfter);
    });
  };

  const runSingleSort = async (algoObj) => {
    if (isRunning) return;
    setIsRunning(true);
    setIsRacing(false);
    setAlgoName(algoObj.name);

    // Pass a copy of the array so the underlying logic doesn't mutate our state directly
    const animations = algoObj.getAnimations(array.slice());
    await animateSort(animations, algoObj.name, 'main');
    
    setIsRunning(false);
  };

  const raceAll = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsRacing(true);
    setAlgoName('Racing All Algorithms');

    // Wait a brief moment for React to render the 4 grids
    await new Promise(r => setTimeout(r, 100));

    // Start all 4 animations in parallel
    const promises = ALGORITHMS.map(algo => {
      const animations = algo.getAnimations(array.slice());
      return animateSort(animations, algo.name, algo.id);
    });

    await Promise.all(promises);
    setIsRunning(false);
  };

  const renderArrayGraph = (prefix, label) => (
    <div className="race-chart-container">
      {label && <div className="race-label">{label}</div>}
      <div className="array-container">
        {array.map((value, idx) => (
          <div
            className={`array-bar array-bar-${prefix}`}
            key={idx}
            style={{
              height: `${value}px`,
              width: `${Math.max(2, (isRacing ? 280 : 600) / arraySize)}px`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container animate-fade-in sv-container">
      <SEO 
        title="Sorting Algorithms - AlgoWorld" 
        description="Visualize and race Sorting Algorithms like Quick Sort, Merge Sort, Insertion Sort, and Selection Sort." 
        path="/sorting" 
      />
      <div className="sv-header">
        <h1>Sorting Visualizer <span className="algo-badge">{algoName}</span></h1>
        <p className="subtitle">Visualize how different sorting algorithms order a random set of numbers.</p>
      </div>

      <div className="sv-layout">
        <div className="sv-sidebar">
          <Card className="controls-card">
            <h3>Algorithms</h3>
            <div className="action-buttons mb-4">
              {ALGORITHMS.map(algo => (
                <Button 
                  key={algo.id}
                  variant="primary" 
                  onClick={() => runSingleSort(algo)} 
                  disabled={isRunning} 
                  className="w-full mb-2"
                >
                  {algo.name}
                </Button>
              ))}
            </div>
            
            <Button 
              variant="secondary" 
              onClick={raceAll} 
              disabled={isRunning} 
              className="w-full flex-center gap-2 mb-2 race-btn"
            >
              <Swords size={16} /> Race All
            </Button>

            <div className="divider"></div>

            <h3>Controls</h3>
            
            <div className="control-group">
              <label className="flex-center" style={{justifyContent: 'space-between'}}>
                <span className="flex-center gap-2"><Settings2 size={16} /> Array Size: {arraySize}</span>
              </label>
              <input 
                type="range" 
                min={10} 
                max={200} 
                value={arraySize}
                onChange={(e) => setArraySize(parseInt(e.target.value))}
                disabled={isRunning}
                className="slider"
              />
            </div>

            <div className="control-group">
              <label className="flex-center" style={{justifyContent: 'space-between'}}>
                <span className="flex-center gap-2"><Settings2 size={16} /> Delay (ms): {animationSpeed}</span>
              </label>
              <input 
                type="range" 
                min={1} 
                max={100} 
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                disabled={isRunning}
                className="slider"
              />
            </div>

            <div className="action-buttons mt-4">
              <Button 
                variant="danger" 
                onClick={resetArray} 
                disabled={isRunning}
                className="w-full flex-center gap-2"
              >
                <RotateCcw size={16} /> Generate New Array
              </Button>
            </div>
            
            <div className="legend mt-4">
              <div className="legend-item"><div className="legend-color primary"></div> Default</div>
              <div className="legend-item"><div className="legend-color secondary"></div> Comparing</div>
              <div className="legend-item"><div className="legend-color sorted"></div> Sorted</div>
            </div>
          </Card>
        </div>
        
        <div className="sv-main">
          <Card className="array-card">
            {isRacing ? (
              <div className="race-grid">
                {ALGORITHMS.map(algo => (
                  <div key={algo.id} className="race-cell">
                    {renderArrayGraph(algo.id, algo.name)}
                  </div>
                ))}
              </div>
            ) : (
              renderArrayGraph('main', null)
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SortingVisualizer;
