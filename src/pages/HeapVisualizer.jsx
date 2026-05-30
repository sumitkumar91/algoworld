import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowDownToLine, Settings, Code, RefreshCcw } from 'lucide-react';
import SEO from '../components/SEO';
import Button from '../components/Button';
import Card from '../components/Card';
import CodeModal from '../components/CodeModal';
import { heapSnippets } from '../utils/codeSnippets';
import './HeapVisualizer.css';
import '../components/EducationalGuide.css';

const SVG_WIDTH = 900;
const SVG_HEIGHT = 400;
const ANIMATION_SPEED = 600;

const HeapVisualizer = () => {
  const [heap, setHeap] = useState([]);
  const [isMinHeap, setIsMinHeap] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  
  const [statusMessage, setStatusMessage] = useState('Enter a value to insert into the Heap.');
  
  // Animation states
  const [nodeStates, setNodeStates] = useState({}); // { index: 'comparing' | 'swapping' | 'success' | 'extract' }
  const [edgeStates, setEdgeStates] = useState({}); // { childIndex: 'comparing' }

  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const compare = (a, b) => {
    return isMinHeap ? a < b : a > b;
  };

  const handleToggleHeapType = () => {
    if (isRunning) return;
    setIsMinHeap(!isMinHeap);
    setHeap([]);
    setNodeStates({});
    setEdgeStates({});
    setStatusMessage(`Switched to ${!isMinHeap ? 'Min' : 'Max'}-Heap. Heap cleared.`);
  };

  const setNodeState = (idx, state) => {
    setNodeStates(prev => ({ ...prev, [idx]: state }));
  };

  const setEdgeState = (childIdx, state) => {
    setEdgeStates(prev => ({ ...prev, [childIdx]: state }));
  };

  const clearVisuals = () => {
    setNodeStates({});
    setEdgeStates({});
  };

  const handleInsert = async () => {
    if (isRunning || !inputValue) return;
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    if (heap.length >= 31) {
      setStatusMessage("Heap is full (max 31 nodes for visualization).");
      return;
    }
    setInputValue('');
    setIsRunning(true);
    clearVisuals();

    setStatusMessage(`Inserting ${val} at the end of the heap...`);
    const newHeap = [...heap, val];
    setHeap([...newHeap]);
    
    let currentIndex = newHeap.length - 1;
    setNodeState(currentIndex, 'success');
    await sleep(ANIMATION_SPEED);

    setStatusMessage(`Bubbling up ${val}...`);
    
    while (currentIndex > 0) {
      const parentIndex = Math.floor((currentIndex - 1) / 2);
      
      setNodeState(currentIndex, 'comparing');
      setNodeState(parentIndex, 'comparing');
      setEdgeState(currentIndex, 'comparing');
      setStatusMessage(`Comparing ${newHeap[currentIndex]} with parent ${newHeap[parentIndex]}...`);
      await sleep(ANIMATION_SPEED);

      if (compare(newHeap[currentIndex], newHeap[parentIndex])) {
        setStatusMessage(`${newHeap[currentIndex]} is ${isMinHeap ? 'smaller' : 'larger'} than ${newHeap[parentIndex]}. Swapping...`);
        setNodeState(currentIndex, 'swapping');
        setNodeState(parentIndex, 'swapping');
        await sleep(ANIMATION_SPEED / 2);

        // Swap
        const temp = newHeap[currentIndex];
        newHeap[currentIndex] = newHeap[parentIndex];
        newHeap[parentIndex] = temp;
        setHeap([...newHeap]);

        setNodeState(currentIndex, 'comparing');
        setNodeState(parentIndex, 'comparing');
        await sleep(ANIMATION_SPEED / 2);

        clearVisuals();
        currentIndex = parentIndex;
        setNodeState(currentIndex, 'success');
      } else {
        setStatusMessage(`Heap property satisfied. ${val} stays in place.`);
        break;
      }
    }
    
    clearVisuals();
    setNodeState(currentIndex, 'success');
    setStatusMessage(`Inserted ${val} successfully.`);
    await sleep(ANIMATION_SPEED);
    clearVisuals();
    setIsRunning(false);
  };

  const handleExtract = async () => {
    if (isRunning || heap.length === 0) return;
    setIsRunning(true);
    clearVisuals();

    const rootVal = heap[0];
    setStatusMessage(`Extracting root: ${rootVal}`);
    setNodeState(0, 'extract');
    await sleep(ANIMATION_SPEED);

    if (heap.length === 1) {
      setHeap([]);
      setStatusMessage(`Extracted ${rootVal}. Heap is now empty.`);
      clearVisuals();
      setIsRunning(false);
      return;
    }

    const lastVal = heap[heap.length - 1];
    setStatusMessage(`Swapping root ${rootVal} with last element ${lastVal}...`);
    
    setNodeState(0, 'swapping');
    setNodeState(heap.length - 1, 'swapping');
    await sleep(ANIMATION_SPEED);

    const newHeap = [...heap];
    newHeap[0] = lastVal;
    newHeap.pop(); // remove last element
    setHeap([...newHeap]);
    clearVisuals();
    
    setStatusMessage(`Sinking down ${lastVal}...`);
    setNodeState(0, 'success');
    await sleep(ANIMATION_SPEED);

    let currentIndex = 0;

    while (true) {
      const leftChildIdx = 2 * currentIndex + 1;
      const rightChildIdx = 2 * currentIndex + 2;
      let targetIdx = currentIndex;

      if (leftChildIdx < newHeap.length) {
        setNodeState(currentIndex, 'comparing');
        setNodeState(leftChildIdx, 'comparing');
        setEdgeState(leftChildIdx, 'comparing');
        setStatusMessage(`Comparing with left child ${newHeap[leftChildIdx]}...`);
        await sleep(ANIMATION_SPEED);
        
        if (compare(newHeap[leftChildIdx], newHeap[targetIdx])) {
          targetIdx = leftChildIdx;
        }
        clearVisuals();
      }

      if (rightChildIdx < newHeap.length) {
        setNodeState(currentIndex, 'comparing');
        setNodeState(rightChildIdx, 'comparing');
        setEdgeState(rightChildIdx, 'comparing');
        setStatusMessage(`Comparing with right child ${newHeap[rightChildIdx]}...`);
        await sleep(ANIMATION_SPEED);
        
        if (compare(newHeap[rightChildIdx], newHeap[targetIdx])) {
          targetIdx = rightChildIdx;
        }
        clearVisuals();
      }

      if (targetIdx !== currentIndex) {
        setStatusMessage(`${newHeap[targetIdx]} is ${isMinHeap ? 'smaller' : 'larger'}. Swapping...`);
        setNodeState(currentIndex, 'swapping');
        setNodeState(targetIdx, 'swapping');
        setEdgeState(targetIdx, 'comparing');
        await sleep(ANIMATION_SPEED / 2);

        // Swap
        const temp = newHeap[currentIndex];
        newHeap[currentIndex] = newHeap[targetIdx];
        newHeap[targetIdx] = temp;
        setHeap([...newHeap]);

        await sleep(ANIMATION_SPEED / 2);
        clearVisuals();
        currentIndex = targetIdx;
        setNodeState(currentIndex, 'success');
      } else {
        setStatusMessage(`Heap property satisfied. ${newHeap[currentIndex]} stays in place.`);
        break;
      }
    }

    clearVisuals();
    setStatusMessage(`Extracted ${rootVal} successfully.`);
    setIsRunning(false);
  };

  const openCode = (type) => {
    const snippets = isMinHeap ? heapSnippets.min : heapSnippets.max;
    if (type === 'insert') {
      setCurrentCode(snippets.insert);
      setModalTitle(`Binary Heap: Insert (Bubble-Up)`);
    } else {
      setCurrentCode(snippets.extract);
      setModalTitle(`Binary Heap: Extract (Sink-Down)`);
    }
    setIsCodeModalOpen(true);
  };

  // Math for tree rendering
  const getNodeCoordinates = (index) => {
    if (index === 0) return { x: SVG_WIDTH / 2, y: 40 };
    
    const level = Math.floor(Math.log2(index + 1));
    const offset = index - (Math.pow(2, level) - 1);
    const numNodesInLevel = Math.pow(2, level);
    
    const x = (offset + 0.5) * (SVG_WIDTH / numNodesInLevel);
    const y = 40 + level * 80;
    
    return { x, y };
  };

  return (
    <div className="container animate-fade-in heap-page-container">
      <SEO 
        title="Heap Visualizer - AlgoWorld" 
        description="Visualize Binary Heaps (Min-Heap and Max-Heap) with step-by-step array and tree representation." 
        path="/heap" 
      />
      <div className="heap-header">
        <h1>Binary Heap <ArrowDownToLine size={36} className="inline-icon" /></h1>
        <p className="subtitle">Visualize how a complete binary tree maps to a flat array.</p>
      </div>

      <div className="heap-layout">
        <div className="heap-sidebar">
          <Card className="controls-card">
            <h3>Settings</h3>
            
            <div className="input-group mb-4">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Heap Type:</div>
              <select 
                value={isMinHeap ? 'min' : 'max'} 
                onChange={handleToggleHeapType}
                disabled={isRunning}
                className="heap-input mb-4"
              >
                <option value="min">Min-Heap</option>
                <option value="max">Max-Heap</option>
              </select>

              <Button variant="outline" onClick={() => { setHeap([]); clearVisuals(); setStatusMessage('Heap cleared.'); }} disabled={isRunning} className="w-full flex-center gap-2">
                <RefreshCcw size={16} /> Clear Heap
              </Button>
            </div>
            
            <div className="divider"></div>

            <h3>Operations</h3>
            <div className="input-group mb-4">
              <input 
                type="number" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                placeholder="Value (e.g. 42)..."
                disabled={isRunning}
                className="heap-input mb-4"
              />
              <Button variant="primary" onClick={handleInsert} disabled={isRunning} className="w-full mb-2 flex-center gap-2">
                <Plus size={16} /> Insert
              </Button>
              <Button variant="danger" onClick={handleExtract} disabled={isRunning} className="w-full mb-2 flex-center gap-2">
                <ArrowDownToLine size={16} /> Extract {isMinHeap ? 'Min' : 'Max'}
              </Button>
            </div>

            <div className="divider"></div>
            
            <h3>Code Snippets</h3>
            <div className="input-group">
              <Button variant="outline" onClick={() => openCode('insert')} className="w-full mb-2 flex-center gap-2">
                <Code size={16} /> Insert Code
              </Button>
              <Button variant="outline" onClick={() => openCode('extract')} className="w-full flex-center gap-2">
                <Code size={16} /> Extract Code
              </Button>
            </div>
          </Card>
        </div>
        
        <div className="heap-main">
          <Card className="heap-card">
            <div className="heap-status-bar">
              {statusMessage}
            </div>
            
            {/* Tree View */}
            <div className="heap-tree-container">
              <svg 
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} 
                preserveAspectRatio="xMidYMid meet"
                className="heap-svg"
              >
                {/* Edges */}
                {heap.map((_, i) => {
                  if (i === 0) return null;
                  const parentIdx = Math.floor((i - 1) / 2);
                  const childCoords = getNodeCoordinates(i);
                  const parentCoords = getNodeCoordinates(parentIdx);
                  const edgeStateClass = edgeStates[i] ? `state-${edgeStates[i]}` : '';
                  
                  return (
                    <line 
                      key={`edge-${i}`}
                      x1={parentCoords.x} y1={parentCoords.y}
                      x2={childCoords.x} y2={childCoords.y}
                      className={`heap-edge ${edgeStateClass}`}
                    />
                  );
                })}

                {/* Nodes */}
                {heap.map((val, i) => {
                  const { x, y } = getNodeCoordinates(i);
                  const nodeStateClass = nodeStates[i] ? `heap-state-${nodeStates[i]}` : '';
                  
                  return (
                    <g key={`node-${i}`} className={`heap-node-group ${nodeStateClass}`}>
                      <circle cx={x} cy={y} r={22} className="heap-node-circle" />
                      <text x={x} y={y} className="heap-node-text" dy=".3em" textAnchor="middle">{val}</text>
                      <text x={x + 30} y={y - 15} className="heap-node-idx">[{i}]</text>
                    </g>
                  );
                })}
              </svg>
              {heap.length === 0 && (
                <div style={{ position: 'absolute', color: 'var(--text-tertiary)' }}>Tree is empty.</div>
              )}
            </div>

            {/* Array View */}
            <div className="heap-array-container">
              <div className="heap-array">
                {heap.map((val, i) => {
                  const stateClass = nodeStates[i] ? `state-${nodeStates[i]}` : '';
                  return (
                    <div key={`array-${i}`} className="heap-array-slot">
                      <div className={`heap-array-box ${stateClass}`}>
                        {val}
                      </div>
                      <div className="heap-array-idx">{i}</div>
                    </div>
                  );
                })}
                {heap.length === 0 && (
                  <div style={{ color: 'var(--text-tertiary)' }}>Array is empty.</div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* EDUCATIONAL GUIDE */}
      <div className="edu-guide-container">
        <div className="edu-guide-header">
          <h2>Binary Heap</h2>
        </div>

        <div className="edu-section">
          <h3>The Core Concept: Priority</h3>
          <p>A Heap is just a Binary Tree with two strict rules:</p>
          <p>1. <strong>Shape Rule:</strong> It must be perfectly balanced. You fill it level by level, left to right, with absolutely no gaps.</p>
          <p>2. <strong>Order Rule:</strong> In a Max-Heap, every parent must be larger than its children. In a Min-Heap, every parent must be smaller. This guarantees the absolute Max (or Min) value is <strong>always instantly available at the root</strong>.</p>
        </div>

        <div className="edu-section">
          <h3>The Array Secret</h3>
          <p>Because the Shape Rule guarantees no gaps, we don't actually need Pointers to build this tree. We can just pack the nodes into a flat Array!</p>
          <p>To traverse the tree, the computer just does simple math on the array index (<code>i</code>):</p>
          <ul>
            <li>Left Child: <code>(2 * i) + 1</code></li>
            <li>Right Child: <code>(2 * i) + 2</code></li>
            <li>Parent: <code>(i - 1) / 2</code></li>
          </ul>
          <p>This makes Heaps incredibly memory-efficient because they don't waste any RAM storing memory addresses (pointers).</p>
        </div>

        <div className="edu-section">
          <h3>Bubble-Up & Sink-Down</h3>
          <p>When you insert a number, you just slap it at the very end of the array. If it violates the Order Rule, it simply <strong>Bubbles Up</strong> (swaps with its parent) until it settles into the correct spot.</p>
          <p>When you extract the top number, you replace the root with the very last number in the array, and let it <strong>Sink Down</strong> (swap with its largest/smallest child) until it settles.</p>
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
                  <td>Find Max / Min</td>
                  <td className="complexity-o1">O(1)</td>
                  <td>It's always sitting right at Array index 0. Instant.</td>
                </tr>
                <tr>
                  <td>Insert</td>
                  <td className="complexity-ologn">O(log N)</td>
                  <td>You just append to the array and Bubble Up the height of the tree.</td>
                </tr>
                <tr>
                  <td>Extract Max / Min</td>
                  <td className="complexity-ologn">O(log N)</td>
                  <td>You remove the root and let the replacement Sink Down the height of the tree.</td>
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

export default HeapVisualizer;
