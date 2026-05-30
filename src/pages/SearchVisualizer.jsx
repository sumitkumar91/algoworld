import { useState, useEffect } from 'react';
import { Search, Shuffle, SortAsc, Code, Eye } from 'lucide-react';
import SEO from '../components/SEO';
import Button from '../components/Button';
import Card from '../components/Card';
import CodeModal from '../components/CodeModal';
import { searchSnippets } from '../utils/codeSnippets';
import './SearchVisualizer.css';
import '../components/EducationalGuide.css';

const SVG_WIDTH = 900;
const SVG_HEIGHT = 400;
const CAPACITY = 12;
const ANIMATION_SPEED = 600; // ms

// Layout constants
const NODE_WIDTH = 50;
const NODE_HEIGHT = 50;
const SPACING = 60; // Center-to-center spacing

const SearchVisualizer = () => {
  const [elements, setElements] = useState([]);
  const [elementStatuses, setElementStatuses] = useState(Array(CAPACITY).fill('normal'));
  const [pointers, setPointers] = useState([]); // { label: 'L', index: 0, yOffset: 0 }
  
  const [targetValue, setTargetValue] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSorted, setIsSorted] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Generate an array and search for a value!');
  
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [currentCode, setCurrentCode] = useState(searchSnippets.linear);
  const [modalTitle, setModalTitle] = useState('Linear Search');

  const [customArrayInput, setCustomArrayInput] = useState('');
  
  useEffect(() => {
    generateRandom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  function getX(index) {
    const currentLen = elements.length || CAPACITY;
    const totalWidth = currentLen * SPACING;
    const startX = (SVG_WIDTH - totalWidth) / 2 + (NODE_WIDTH / 2);
    return startX + index * SPACING;
  }

  function getY() {
    return SVG_HEIGHT / 2 - 20; // Slightly higher to make room for pointers
  }

  const generateRandom = () => {
    if (isRunning) return;
    const arr = Array.from({ length: CAPACITY }, () => Math.floor(Math.random() * 90) + 10);
    setElements(arr);
    setIsSorted(false);
    resetVisuals();
    setStatusMessage('Random unsorted array generated.');
  };

  const generateSorted = () => {
    if (isRunning) return;
    const arr = Array.from({ length: CAPACITY }, () => Math.floor(Math.random() * 90) + 10).sort((a, b) => a - b);
    setElements(arr);
    setIsSorted(true);
    resetVisuals();
    setStatusMessage('Sorted array generated (Ready for Binary Search).');
  };

  const resetVisuals = (len = CAPACITY) => {
    setElementStatuses(Array(len).fill('normal'));
    setPointers([]);
  };

  const handleCustomArray = () => {
    if (isRunning || !customArrayInput) return;
    const parsed = customArrayInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    
    if (parsed.length === 0) {
      setStatusMessage('Error: Please enter valid comma-separated numbers.');
      return;
    }
    
    if (parsed.length > 16) {
      parsed.length = 16; // Limit to max 16 for screen space
    }

    setElements(parsed);
    
    // Check if it is sorted
    let sorted = true;
    for (let i = 1; i < parsed.length; i++) {
      if (parsed[i] < parsed[i - 1]) {
        sorted = false;
        break;
      }
    }
    
    setIsSorted(sorted);
    resetVisuals(parsed.length);
    setStatusMessage(`Custom array set (${sorted ? 'Sorted' : 'Unsorted'}).`);
  };

  const runLinearSearch = async () => {
    if (isRunning || !targetValue) return;
    const target = parseInt(targetValue);
    if (isNaN(target)) return;

    setIsRunning(true);
    resetVisuals();
    setStatusMessage(`Running Linear Search for ${target}...`);

    for (let i = 0; i < elements.length; i++) {
      // Move pointer
      setPointers([{ label: 'i', index: i, yOffset: 30 }]);
      
      // Highlight current as scanning
      setElementStatuses(prev => {
        const next = [...prev];
        next[i] = 'scanning';
        return next;
      });
      
      await sleep(ANIMATION_SPEED);

      if (elements[i] === target) {
        setElementStatuses(prev => {
          const next = [...prev];
          next[i] = 'found';
          return next;
        });
        setStatusMessage(`Found ${target} at index ${i}!`);
        setIsRunning(false);
        return;
      } else {
        // Discard
        setElementStatuses(prev => {
          const next = [...prev];
          next[i] = 'discarded';
          return next;
        });
      }
    }

    setPointers([]);
    setStatusMessage(`Target ${target} not found in the array.`);
    setIsRunning(false);
  };

  const runBinarySearch = async () => {
    if (isRunning || !targetValue) return;
    if (!isSorted) {
      setStatusMessage('Error: Binary Search requires a sorted array!');
      return;
    }
    const target = parseInt(targetValue);
    if (isNaN(target)) return;

    setIsRunning(true);
    resetVisuals();
    setStatusMessage(`Running Binary Search for ${target}...`);

    let L = 0;
    let R = elements.length - 1;

    while (L <= R) {
      const M = Math.floor((L + R) / 2);
      
      // Show pointers
      setPointers([
        { label: 'L', index: L, yOffset: 30 },
        { label: 'R', index: R, yOffset: 30 },
        { label: 'M', index: M, yOffset: 60 } // Drop M a bit lower so they don't overlap if they are on same index
      ]);

      // Highlight M
      setElementStatuses(prev => {
        const next = [...prev];
        next[M] = 'scanning';
        return next;
      });

      await sleep(ANIMATION_SPEED * 1.5);

      if (elements[M] === target) {
        setElementStatuses(prev => {
          const next = [...prev];
          next[M] = 'found';
          return next;
        });
        setStatusMessage(`Found ${target} at index ${M}!`);
        setIsRunning(false);
        return;
      } 
      
      if (elements[M] < target) {
        // Discard left half including M
        setElementStatuses(prev => {
          const next = [...prev];
          for (let i = L; i <= M; i++) next[i] = 'discarded';
          return next;
        });
        L = M + 1;
      } else {
        // Discard right half including M
        setElementStatuses(prev => {
          const next = [...prev];
          for (let i = M; i <= R; i++) next[i] = 'discarded';
          return next;
        });
        R = M - 1;
      }
      await sleep(ANIMATION_SPEED);
    }

    setPointers([]);
    setStatusMessage(`Target ${target} not found in the array.`);
    setIsRunning(false);
  };

  const openCode = (type) => {
    if (type === 'linear') {
      setCurrentCode(searchSnippets.linear);
      setModalTitle('Linear Search');
    } else {
      setCurrentCode(searchSnippets.binary);
      setModalTitle('Binary Search');
    }
    setIsCodeModalOpen(true);
  };

  return (
    <div className="container animate-fade-in search-page-container">
      <SEO 
        title="Search Visualizer - AlgoWorld" 
        description="Visualize Linear Search and Binary Search algorithms." 
        path="/search" 
      />
      <div className="search-header">
        <h1>Search Visualizer <Search size={36} className="inline-icon" /></h1>
        <p className="subtitle">Visualize and contrast <code>O(N)</code> vs <code>O(log N)</code> search algorithms.</p>
      </div>

      <div className="search-layout">
        <div className="search-sidebar">
          <Card className="controls-card">
            <h3>Generate Data</h3>
            <div className="input-group mb-4">
              <Button variant="secondary" onClick={generateRandom} disabled={isRunning} className="w-full mb-2 flex-center gap-2">
                <Shuffle size={16} /> Random Array
              </Button>
              <Button variant="secondary" onClick={generateSorted} disabled={isRunning} className="w-full mb-2 flex-center gap-2">
                <SortAsc size={16} /> Sorted Array
              </Button>
            </div>
            
            <div className="input-group mb-4" style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={customArrayInput} 
                onChange={(e) => setCustomArrayInput(e.target.value)} 
                placeholder="e.g. 5, 10, 15, 20"
                disabled={isRunning}
                className="search-input"
                style={{ flex: 1 }}
              />
              <Button variant="outline" onClick={handleCustomArray} disabled={isRunning} style={{ padding: '0 1rem' }}>
                Set
              </Button>
            </div>

            <div className="divider"></div>

            <h3>Search</h3>
            <div className="input-group mb-4">
              <input 
                type="number" 
                value={targetValue} 
                onChange={(e) => setTargetValue(e.target.value)} 
                placeholder="Target value..."
                disabled={isRunning}
                className="search-input mb-4"
              />
              <Button variant="primary" onClick={runLinearSearch} disabled={isRunning} className="w-full mb-2 flex-center gap-2">
                <Eye size={16} /> Linear Search
              </Button>
              <Button 
                variant="primary" 
                onClick={runBinarySearch} 
                disabled={isRunning || !isSorted} 
                className="w-full mb-2 flex-center gap-2"
                style={{ opacity: isSorted ? 1 : 0.5 }}
                title={!isSorted ? "Requires sorted array" : ""}
              >
                <Search size={16} /> Binary Search
              </Button>
            </div>

            <div className="divider"></div>
            
            <div className="input-group">
              <Button variant="outline" onClick={() => openCode('linear')} className="w-full mb-2 flex-center gap-2">
                <Code size={16} /> Linear Search Code
              </Button>
              <Button variant="outline" onClick={() => openCode('binary')} className="w-full flex-center gap-2">
                <Code size={16} /> Binary Search Code
              </Button>
            </div>
          </Card>
        </div>
        
        <div className="search-main">
          <Card className="search-card">
            <div className="status-bar">
              {statusMessage}
            </div>
            <div className="search-svg-container">
              <svg 
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} 
                preserveAspectRatio="xMidYMid meet"
                className="search-svg"
              >
                {/* SVG Definitions */}
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                  refX="0" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-primary)" />
                  </marker>
                </defs>

                {/* Render Array Blocks */}
                {elements.map((val, i) => {
                  let groupClass = "search-node-group " + elementStatuses[i];
                  return (
                    <g key={`node-${i}`} className={groupClass} transform={`translate(${getX(i)}, ${getY()})`}>
                      <rect 
                        x={-NODE_WIDTH/2} y={-NODE_HEIGHT/2} 
                        width={NODE_WIDTH} height={NODE_HEIGHT} 
                        className="search-node-rect" 
                        rx="4" ry="4"
                      />
                      <text x="0" y="0" className="search-text-val" dy=".3em" textAnchor="middle">{val}</text>
                      <text x="0" y={NODE_HEIGHT/2 + 20} className="search-text-idx" textAnchor="middle">{i}</text>
                    </g>
                  );
                })}

                {/* Render Pointers */}
                {pointers.map((ptr, idx) => {
                  const targetX = getX(ptr.index);
                  const targetY = getY() + NODE_HEIGHT/2 + ptr.yOffset;
                  
                  return (
                    <g key={`ptr-${ptr.label}-${idx}`} style={{ transition: 'all 0.3s ease' }}>
                      <text x={targetX} y={targetY + 15} className="search-pointer-text" textAnchor="middle">{ptr.label}</text>
                      <line 
                        x1={targetX} y1={targetY} 
                        x2={targetX} y2={getY() + NODE_HEIGHT/2 + 5} 
                        className="search-pointer-line" 
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          </Card>
        </div>
      </div>

      {/* EDUCATIONAL GUIDE */}
      <div className="edu-guide-container">
        <div className="edu-guide-header">
          <h2>Search Algorithms</h2>
        </div>

        <div className="edu-section">
          <h3>Linear Search (The Brute Force)</h3>
          <p>Linear search is the simplest way to find something. You just start at the beginning and check every single item until you find what you're looking for.</p>
          <p><strong>The Good:</strong> It works on anything. The data doesn't need to be sorted. Just throw data at it and it works.</p>
          <p><strong>The Bad:</strong> It's slow (<code>O(N)</code>). If you have a billion items, you might have to check a billion items.</p>
        </div>

        <div className="edu-section">
          <h3>Binary Search (The Smart Way)</h3>
          <p>Binary Search is how humans naturally look up a word in a dictionary. You don't read page 1, page 2, page 3... You open it to the middle. If your word comes alphabetically later, you completely ignore the left side. Then you repeat.</p>
          <p><strong>The Good:</strong> It is incredibly fast (<code>O(log N)</code>). You can search through a billion items in just 30 guesses because you throw away half the remaining data every single step.</p>
          <p><strong>The Bad:</strong> It <strong>ONLY</strong> works if the data is perfectly sorted first.</p>
        </div>

        <div className="edu-section">
          <h3>Time Complexity</h3>
          <div className="edu-table-container">
            <table className="edu-table">
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Best Case</th>
                  <th>Worst Case</th>
                  <th>Requires Sorted Data?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Linear Search</td>
                  <td className="complexity-o1"><code>O(1)</code> (First item)</td>
                  <td className="complexity-on"><code>O(N)</code> (Last item)</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td>Binary Search</td>
                  <td className="complexity-o1"><code>O(1)</code> (Middle item)</td>
                  <td className="complexity-ologn"><code>O(log N)</code></td>
                  <td><strong>Yes</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <CodeModal 
        isOpen={isCodeModalOpen} 
        onClose={() => setIsCodeModalOpen(false)} 
        code={currentCode} 
        title={modalTitle} 
      />
    </div>
  );
};

export default SearchVisualizer;
