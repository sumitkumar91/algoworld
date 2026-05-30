import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Code, Grid } from 'lucide-react';
import SEO from '../components/SEO';
import Button from '../components/Button';
import Card from '../components/Card';
import CodeModal from '../components/CodeModal';
import { arraySnippets } from '../utils/codeSnippets';
import './ArrayVisualizer.css';
import '../components/EducationalGuide.css';

const SVG_WIDTH = 900;
const SVG_HEIGHT = 400;
const MAX_CAPACITY = 10;
const ANIMATION_SPEED = 500; // ms

// Layout constants
const NODE_WIDTH = 60;
const NODE_HEIGHT = 60;
const SPACING = 70; // Center-to-center spacing

const ArrayVisualizer = () => {
  const [elements, setElements] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [inputIndex, setInputIndex] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [fadingElements, setFadingElements] = useState([]);

  useEffect(() => {
    // Initialize with 3 random elements
    const initial = [
      { id: 'id_0', value: 42, x: getX(0), y: getY(), status: 'normal' },
      { id: 'id_1', value: 15, x: getX(1), y: getY(), status: 'normal' },
      { id: 'id_2', value: 8, x: getX(2), y: getY(), status: 'normal' },
    ];
    setElements(initial);
  }, []);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  function getX(index) {
    const totalWidth = MAX_CAPACITY * SPACING;
    const startX = (SVG_WIDTH - totalWidth) / 2 + (NODE_WIDTH / 2);
    return startX + index * SPACING;
  }

  function getY() {
    return SVG_HEIGHT / 2;
  }

  const handleInsert = async () => {
    if (isRunning || !inputValue || !inputIndex) return;
    const val = parseInt(inputValue);
    const idx = parseInt(inputIndex);
    if (isNaN(val) || isNaN(idx)) return;
    
    if (idx < 0 || idx > elements.length) {
      setStatusMessage('Error: Index out of bounds (0 to ' + elements.length + ')');
      return;
    }
    if (elements.length >= MAX_CAPACITY) {
      setStatusMessage('Error: Array Overflow!');
      return;
    }

    setInputValue('');
    setInputIndex('');
    setIsRunning(true);
    setStatusMessage(`Inserting ${val} at index ${idx}...`);

    // 1. Highlight elements that need to shift
    if (idx < elements.length) {
      setElements(prev => prev.map((el, i) => {
        if (i >= idx) return { ...el, status: 'shifting' };
        return el;
      }));
      await sleep(ANIMATION_SPEED);

      // 2. Shift them right
      setElements(prev => prev.map((el, i) => {
        if (i >= idx) return { ...el, x: getX(i + 1) };
        return el;
      }));
      await sleep(ANIMATION_SPEED);
    }

    // 3. Create new element above the array
    const newEl = {
      id: Math.random().toString(36).substr(2, 9),
      value: val,
      x: getX(idx),
      y: getY() - 80, // Start above
      status: 'success'
    };
    
    setElements(prev => {
      const copy = [...prev];
      copy.splice(idx, 0, newEl); // Insert at index
      return copy;
    });

    await sleep(50); // Let React render it above

    // 4. Drop it into place
    setElements(prev => prev.map(el => {
      if (el.id === newEl.id) return { ...el, y: getY() };
      return el;
    }));

    await sleep(ANIMATION_SPEED);

    // 5. Reset statuses
    setElements(prev => prev.map(el => ({ ...el, status: 'normal' })));

    setStatusMessage('Ready');
    setIsRunning(false);
  };

  const handleDelete = async () => {
    if (isRunning || !inputIndex) return;
    const idx = parseInt(inputIndex);
    if (isNaN(idx)) return;

    if (idx < 0 || idx >= elements.length) {
      setStatusMessage('Error: Index out of bounds (0 to ' + (elements.length - 1) + ')');
      return;
    }

    setInputIndex('');
    setIsRunning(true);
    setStatusMessage(`Deleting element at index ${idx}...`);

    // 1. Highlight target as error
    setElements(prev => prev.map((el, i) => {
      if (i === idx) return { ...el, status: 'error' };
      return el;
    }));
    await sleep(ANIMATION_SPEED);

    // 2. Animate it out
    setElements(prev => prev.map((el, i) => {
      if (i === idx) return { ...el, y: getY() - 80, status: 'error' };
      return el;
    }));
    await sleep(ANIMATION_SPEED);

    // Remove from main and add to fading
    const deletedEl = elements[idx];
    setElements(prev => prev.filter((_, i) => i !== idx));
    setFadingElements([{ ...deletedEl, y: getY() - 80, fading: true }]);

    // 3. Shift remaining elements left
    if (idx < elements.length - 1) {
      setElements(prev => prev.map((el, i) => {
        if (i >= idx) return { ...el, status: 'shifting' };
        return el;
      }));
      await sleep(ANIMATION_SPEED);

      setElements(prev => prev.map((el, i) => {
        if (i >= idx) return { ...el, x: getX(i) };
        return el;
      }));
      await sleep(ANIMATION_SPEED);
    }

    // 4. Reset statuses and cleanup fading
    setFadingElements([]);
    setElements(prev => prev.map(el => ({ ...el, status: 'normal' })));

    setStatusMessage('Ready');
    setIsRunning(false);
  };

  const handleUpdate = async () => {
    if (isRunning || !inputValue || !inputIndex) return;
    const val = parseInt(inputValue);
    const idx = parseInt(inputIndex);
    if (isNaN(val) || isNaN(idx)) return;
    
    if (idx < 0 || idx >= elements.length) {
      setStatusMessage('Error: Index out of bounds (0 to ' + (elements.length - 1) + ')');
      return;
    }

    setInputValue('');
    setInputIndex('');
    setIsRunning(true);
    setStatusMessage(`Updating index ${idx} to ${val}...`);

    // Highlight target
    setElements(prev => prev.map((el, i) => {
      if (i === idx) return { ...el, status: 'highlighted' };
      return el;
    }));
    await sleep(ANIMATION_SPEED);

    // Update value
    setElements(prev => prev.map((el, i) => {
      if (i === idx) return { ...el, value: val, status: 'success' };
      return el;
    }));
    await sleep(ANIMATION_SPEED);

    // Reset
    setElements(prev => prev.map((el, i) => {
      if (i === idx) return { ...el, status: 'normal' };
      return el;
    }));

    setStatusMessage('Ready');
    setIsRunning(false);
  };

  return (
    <div className="container animate-fade-in av-container">
      <SEO 
        title="Array Visualizer - AlgoWorld" 
        description="Visualize static arrays and contiguous memory operations." 
        path="/array" 
      />
      <div className="av-header">
        <h1>Array Visualizer <Grid size={36} className="inline-icon" /></h1>
        <p className="subtitle">Understand contiguous memory and the cost of shifting elements.</p>
      </div>

      <div className="av-layout">
        <div className="av-sidebar">
          <Card className="controls-card">
            <h3>Inputs</h3>
            <div className="input-group mb-4">
              <input 
                type="number" 
                value={inputIndex} 
                onChange={(e) => setInputIndex(e.target.value)} 
                placeholder="Index..."
                disabled={isRunning}
                className="av-input mb-2"
              />
              <input 
                type="number" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                placeholder="Value..."
                disabled={isRunning}
                className="av-input mb-4"
              />
            </div>

            <div className="divider"></div>

            <h3>Operations</h3>
            <div className="input-group mb-4">
              <Button variant="primary" onClick={handleInsert} disabled={isRunning} className="w-full mb-2 flex-center gap-2">
                <Plus size={16} /> Insert
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={isRunning} className="w-full mb-2 flex-center gap-2">
                <Trash2 size={16} /> Delete
              </Button>
              <Button variant="secondary" onClick={handleUpdate} disabled={isRunning} className="w-full mb-2 flex-center gap-2">
                <Edit3 size={16} /> Update
              </Button>
            </div>

            <div className="divider"></div>
            
            <Button variant="outline" onClick={() => setIsCodeModalOpen(true)} className="w-full flex-center gap-2">
              <Code size={16} /> View Code
            </Button>
          </Card>
        </div>
        
        <div className="av-main">
          <Card className="av-card">
            <div className="status-bar">
              {statusMessage}
            </div>
            <div className="av-svg-container">
              <svg 
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} 
                preserveAspectRatio="xMidYMid meet"
                className="av-svg"
              >
                {/* Draw static empty slots background to show capacity */}
                {Array.from({ length: MAX_CAPACITY }).map((_, i) => (
                  <g key={`slot-${i}`} transform={`translate(${getX(i)}, ${getY()})`}>
                    <rect 
                      x={-NODE_WIDTH/2} y={-NODE_HEIGHT/2} 
                      width={NODE_WIDTH} height={NODE_HEIGHT} 
                      className="av-slot-outline" 
                    />
                    {/* Index numbers fixed to the slots */}
                    <text x="0" y={NODE_HEIGHT/2 + 20} className="av-text-idx" textAnchor="middle">
                      {i}
                    </text>
                  </g>
                ))}

                {/* Render animated elements */}
                {[...elements, ...fadingElements].map((node) => {
                  let groupClass = "array-node-group";
                  if (node.status === 'success') groupClass += " success";
                  else if (node.status === 'error') groupClass += " error";
                  else if (node.status === 'highlighted') groupClass += " highlighted";
                  else if (node.status === 'shifting') groupClass += " shifting";
                  if (node.fading) groupClass += " fade-out";
                  
                  return (
                    <g key={node.id} className={groupClass} style={{ transform: `translate(${node.x}px, ${node.y}px)` }}>
                      <rect x={-NODE_WIDTH/2} y={-NODE_HEIGHT/2} width={NODE_WIDTH} height={NODE_HEIGHT} className="av-node-rect" />
                      <text x="0" y="0" className="av-text-val" dy=".3em" textAnchor="middle">{node.value}</text>
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
          <h2>The Array Data Structure</h2>
        </div>

        <div className="edu-section">
          <h3>What is Contiguous Memory?</h3>
          <p>Arrays are just a single, unbroken block of physical RAM. If you need 5 slots, the OS finds 5 side-by-side memory addresses and locks them down.</p>
          <p>Because they are side-by-side, the CPU never has to search. To find index <code>3</code>, it just takes the starting address and adds 3. That's why reading is mathematically instant.</p>
        </div>

        <div className="edu-section">
          <h3>The Cost of Shifting</h3>
          <p>Because memory slots are physical and side-by-side, you can't just "squeeze" a number into the middle of an array.</p>
          <p>To insert a number at index 0, you have to manually copy and shift <strong>every single element</strong> one slot to the right. Insert a number at the front of a 1-million item array? You just forced the CPU to do 1 million operations.</p>
        </div>

        <div className="edu-section">
          <h3>Time Complexity</h3>
          <div className="edu-table-container">
            <table className="edu-table">
              <thead>
                <tr>
                  <th>Operation</th>
                  <th>Big-O</th>
                  <th>Explanation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Read / Access</td>
                  <td className="complexity-o1">O(1)</td>
                  <td>Math instantly calculates the exact memory address.</td>
                </tr>
                <tr>
                  <td>Search (Unsorted)</td>
                  <td className="complexity-on">O(N)</td>
                  <td>You must check every slot until you find it.</td>
                </tr>
                <tr>
                  <td>Insert / Delete (End)</td>
                  <td className="complexity-o1">O(1)</td>
                  <td>Just drop it in the last empty slot.</td>
                </tr>
                <tr>
                  <td>Insert / Delete (Start)</td>
                  <td className="complexity-on">O(N)</td>
                  <td>Requires shifting every single element.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="edu-callout edu-callout-info">
          <h4>When should I use an Array?</h4>
          <p><strong>YES:</strong> When you need lightning-fast lookups by index, or when you are just reading data sequentially.</p>
          <p><strong>NO:</strong> When you need to constantly insert or delete items at the beginning or middle of the list.</p>
        </div>
      </div>
      
      <CodeModal 
        isOpen={isCodeModalOpen} 
        onClose={() => setIsCodeModalOpen(false)} 
        code={arraySnippets.array} 
        title="Array Operations" 
      />
    </div>
  );
};

export default ArrayVisualizer;
