import { useState, useEffect } from 'react';
import { Play, RotateCcw, BarChart2, Settings2 } from 'lucide-react';
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

const SortingVisualizer = () => {
  const [array, setArray] = useState([]);
  const [arraySize, setArraySize] = useState(50);
  const [animationSpeed, setAnimationSpeed] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [algoName, setAlgoName] = useState('Select an Algorithm');

  useEffect(() => {
    resetArray();
  }, [arraySize]);

  const resetArray = () => {
    if (isRunning) return;
    const newArray = [];
    for (let i = 0; i < arraySize; i++) {
      newArray.push(randomIntFromInterval(10, 400));
    }
    setArray(newArray);
    
    // Reset colors
    const arrayBars = document.getElementsByClassName('array-bar');
    for (let i = 0; i < arrayBars.length; i++) {
      arrayBars[i].style.backgroundColor = PRIMARY_COLOR;
    }
    setAlgoName('Select an Algorithm');
  };

  const randomIntFromInterval = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const animateSort = (animations, algo) => {
    if (isRunning) return;
    setIsRunning(true);
    setAlgoName(algo);

    const arrayBars = document.getElementsByClassName('array-bar');
    for (let i = 0; i < animations.length; i++) {
      const [type, idx1, arg3] = animations[i];
      
      if (type === 'compare' || type === 'revert') {
        const color = type === 'compare' ? SECONDARY_COLOR : PRIMARY_COLOR;
        setTimeout(() => {
          if (arrayBars[idx1]) arrayBars[idx1].style.backgroundColor = color;
          if (arrayBars[arg3]) arrayBars[arg3].style.backgroundColor = color;
        }, i * animationSpeed);
      } else if (type === 'overwrite') {
        setTimeout(() => {
          if (arrayBars[idx1]) {
            arrayBars[idx1].style.height = `${arg3}px`;
          }
        }, i * animationSpeed);
      }
    }

    // After sort completes
    setTimeout(() => {
      for (let i = 0; i < arrayBars.length; i++) {
        setTimeout(() => {
          if (arrayBars[i]) arrayBars[i].style.backgroundColor = SORTED_COLOR;
        }, i * (1000 / arrayBars.length)); // nice sweeping effect
      }
      setTimeout(() => {
        setIsRunning(false);
      }, 1000);
    }, animations.length * animationSpeed);
  };

  const mergeSort = () => {
    const animations = getMergeSortAnimations(array);
    animateSort(animations, 'Merge Sort');
  };

  const quickSort = () => {
    const animations = getQuickSortAnimations(array);
    animateSort(animations, 'Quick Sort');
  };

  const insertionSort = () => {
    const animations = getInsertionSortAnimations(array);
    animateSort(animations, 'Insertion Sort');
  };

  const selectionSort = () => {
    const animations = getSelectionSortAnimations(array);
    animateSort(animations, 'Selection Sort');
  };

  return (
    <div className="container animate-fade-in sv-container">
      <div className="sv-header">
        <h1>Sorting Visualizer <span className="algo-badge">{algoName}</span></h1>
        <p className="subtitle">Visualize how different sorting algorithms order a random set of numbers.</p>
      </div>

      <div className="sv-layout">
        <div className="sv-sidebar">
          <Card className="controls-card">
            <h3>Algorithms</h3>
            <div className="action-buttons mb-4">
              <Button variant="primary" onClick={insertionSort} disabled={isRunning} className="w-full mb-2">Insertion Sort</Button>
              <Button variant="primary" onClick={selectionSort} disabled={isRunning} className="w-full mb-2">Selection Sort</Button>
              <Button variant="primary" onClick={mergeSort} disabled={isRunning} className="w-full mb-2">Merge Sort</Button>
              <Button variant="primary" onClick={quickSort} disabled={isRunning} className="w-full">Quick Sort</Button>
            </div>

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
            <div className="array-container">
              {array.map((value, idx) => (
                <div
                  className="array-bar"
                  key={idx}
                  style={{
                    height: `${value}px`,
                    width: `${Math.max(2, 600 / arraySize)}px`,
                  }}
                ></div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SortingVisualizer;
