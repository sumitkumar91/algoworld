import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Code, Layers } from 'lucide-react';
import SEO from '../components/SEO';
import Button from '../components/Button';
import Card from '../components/Card';
import CodeModal from '../components/CodeModal';
import { sqSnippets } from '../utils/codeSnippets';
import './StacksQueuesVisualizer.css';
import '../components/EducationalGuide.css';

const SVG_WIDTH = 800;
const SVG_HEIGHT = 450;
const MAX_CAPACITY = 8;
const ANIMATION_SPEED = 600; // ms

// Layout constants
const NODE_WIDTH = 80;
const NODE_HEIGHT = 40;
const SPACING = 50;

const StacksQueuesVisualizer = () => {
  const [mode, setMode] = useState('stack'); // 'stack' or 'queue'
  const [elements, setElements] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [fadingElements, setFadingElements] = useState([]);

  // Reset when mode changes
  useEffect(() => {
    setElements([]);
    setFadingElements([]);
    setStatusMessage('Ready');
  }, [mode]);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // --- STACK LOGIC ---
  const getStackX = () => SVG_WIDTH / 2;
  const getStackY = (index) => SVG_HEIGHT - 40 - (index * SPACING) - (NODE_HEIGHT / 2);

  const handlePush = async () => {
    if (isRunning || !inputValue) return;
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setInputValue('');

    if (elements.length >= MAX_CAPACITY) {
      setStatusMessage('Error: Stack Overflow!');
      return;
    }

    setIsRunning(true);
    setStatusMessage(`Pushing ${val}...`);

    const newEl = {
      id: Math.random().toString(36).substr(2, 9),
      value: val,
      x: getStackX(),
      y: 30, // Starts at top
      status: 'highlighted'
    };

    setElements([...elements, newEl]);
    
    // Wait for DOM to render at top, then drop down
    await sleep(50);
    
    setElements(prev => {
      const copy = [...prev];
      copy[copy.length - 1].y = getStackY(copy.length - 1);
      return copy;
    });

    await sleep(ANIMATION_SPEED);
    
    setElements(prev => {
      const copy = [...prev];
      copy[copy.length - 1].status = 'normal';
      return copy;
    });

    setStatusMessage('Ready');
    setIsRunning(false);
  };

  const handlePop = async () => {
    if (isRunning) return;
    
    if (elements.length === 0) {
      setStatusMessage('Error: Stack Underflow!');
      return;
    }

    setIsRunning(true);
    const topIdx = elements.length - 1;
    const topVal = elements[topIdx].value;
    setStatusMessage(`Popping ${topVal}...`);

    // Highlight top
    setElements(prev => {
      const copy = [...prev];
      copy[topIdx].status = 'error';
      return copy;
    });
    
    await sleep(400);

    // Animate up
    setElements(prev => {
      const copy = [...prev];
      copy[topIdx].y = 30;
      return copy;
    });

    await sleep(ANIMATION_SPEED);

    // Remove from main and add to fading
    const poppedEl = elements[topIdx];
    setElements(prev => prev.slice(0, -1));
    setFadingElements([{ ...poppedEl, y: 30, fading: true }]);

    await sleep(300);
    setFadingElements([]);

    setStatusMessage('Ready');
    setIsRunning(false);
  };

  const handlePeek = async () => {
    if (isRunning || elements.length === 0) return;
    setIsRunning(true);
    const topIdx = elements.length - 1;
    const topVal = elements[topIdx].value;
    setStatusMessage(`Peek: Top is ${topVal}`);
    
    setElements(prev => {
      const copy = [...prev];
      copy[topIdx].status = 'success';
      return copy;
    });

    await sleep(1000);

    setElements(prev => {
      const copy = [...prev];
      if (copy[topIdx]) copy[topIdx].status = 'normal';
      return copy;
    });

    setStatusMessage('Ready');
    setIsRunning(false);
  };

  // --- QUEUE LOGIC ---
  // Head is elements[0] (Right side), Tail is elements[length-1] (Left side)
  const getQueueY = () => SVG_HEIGHT / 2;
  const getQueueX = (index, totalLength) => {
    // index 0 (Head) is at the far right
    // The visual queue flows left-to-right, so items enter at left and move right
    // Let's place the front (Head, idx 0) at x = 600
    // Tail (idx totalLength-1) is at the left
    const headX = 650;
    return headX - (index * (NODE_WIDTH + 20));
  };

  const handleEnqueue = async () => {
    if (isRunning || !inputValue) return;
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setInputValue('');

    if (elements.length >= MAX_CAPACITY) {
      setStatusMessage('Error: Queue Overflow!');
      return;
    }

    setIsRunning(true);
    setStatusMessage(`Enqueuing ${val}...`);

    const newEl = {
      id: Math.random().toString(36).substr(2, 9),
      value: val,
      x: 50, // Starts far left
      y: getQueueY(),
      status: 'highlighted'
    };

    setElements([...elements, newEl]);
    
    await sleep(50);
    
    setElements(prev => {
      const copy = [...prev];
      const targetX = getQueueX(copy.length - 1, copy.length);
      copy[copy.length - 1].x = targetX;
      return copy;
    });

    await sleep(ANIMATION_SPEED);
    
    setElements(prev => {
      const copy = [...prev];
      copy[copy.length - 1].status = 'normal';
      return copy;
    });

    setStatusMessage('Ready');
    setIsRunning(false);
  };

  const handleDequeue = async () => {
    if (isRunning) return;
    
    if (elements.length === 0) {
      setStatusMessage('Error: Queue Underflow!');
      return;
    }

    setIsRunning(true);
    const headVal = elements[0].value;
    setStatusMessage(`Dequeuing ${headVal}...`);

    // Highlight head
    setElements(prev => {
      const copy = [...prev];
      copy[0].status = 'error';
      return copy;
    });
    
    await sleep(400);

    // Animate head sliding out right
    setElements(prev => {
      const copy = [...prev];
      copy[0].x = SVG_WIDTH - 50;
      return copy;
    });

    await sleep(ANIMATION_SPEED);

    // Remove head, shift remaining
    const dequeuedEl = elements[0];
    setFadingElements([{ ...dequeuedEl, x: SVG_WIDTH - 50, fading: true }]);
    
    setElements(prev => {
      const shifted = prev.slice(1).map((el, idx) => ({
        ...el,
        x: getQueueX(idx, prev.length - 1)
      }));
      return shifted;
    });

    await sleep(ANIMATION_SPEED);
    setFadingElements([]);

    setStatusMessage('Ready');
    setIsRunning(false);
  };

  const handleQueuePeek = async () => {
    if (isRunning || elements.length === 0) return;
    setIsRunning(true);
    const headVal = elements[0].value;
    setStatusMessage(`Front: ${headVal}`);
    
    setElements(prev => {
      const copy = [...prev];
      copy[0].status = 'success';
      return copy;
    });

    await sleep(1000);

    setElements(prev => {
      const copy = [...prev];
      if (copy[0]) copy[0].status = 'normal';
      return copy;
    });

    setStatusMessage('Ready');
    setIsRunning(false);
  };

  // --- RENDER HELPERS ---
  const renderNodes = (nodeList) => {
    return nodeList.map((node, i) => {
      let groupClass = "sq-node-group";
      if (node.status === 'success') groupClass += " success";
      else if (node.status === 'error') groupClass += " error";
      else if (node.status === 'highlighted') groupClass += " highlighted";
      if (node.fading) groupClass += " fade-out";

      const idx = mode === 'stack' ? i : i; 
      
      return (
        <g key={node.id} className={groupClass} style={{ transform: `translate(${node.x}px, ${node.y}px)` }}>
          <rect x={-NODE_WIDTH/2} y={-NODE_HEIGHT/2} width={NODE_WIDTH} height={NODE_HEIGHT} className="sq-node-rect" />
          <text x="0" y="0" className="sq-text-val" dy=".3em" textAnchor="middle">{node.value}</text>
          {/* Show index indicator */}
          <text x={mode === 'stack' ? (NODE_WIDTH/2 + 20) : 0} y={mode === 'stack' ? 5 : (NODE_HEIGHT/2 + 20)} className="sq-text-idx" textAnchor="middle">
            {mode === 'stack' ? `[${i}]` : `[${i}]`}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="container animate-fade-in sq-container">
      <SEO 
        title="Stacks & Queues Visualizer - AlgoWorld" 
        description="Visualize LIFO Stacks and FIFO Queues." 
        path="/stacks-queues" 
      />
      <div className="sq-header">
        <h1>Stacks & Queues <Layers size={36} className="inline-icon" /></h1>
        <p className="subtitle">Visualize Last-In-First-Out and First-In-First-Out data structures.</p>
      </div>

      <div className="sq-layout">
        <div className="sq-sidebar">
          <Card className="controls-card">
            <h3>Select Data Structure</h3>
            <div className="mode-toggle">
              <Button variant={mode === 'stack' ? 'primary' : 'secondary'} onClick={() => setMode('stack')} disabled={isRunning} className="flex-1">Stack (LIFO)</Button>
              <Button variant={mode === 'queue' ? 'primary' : 'secondary'} onClick={() => setMode('queue')} disabled={isRunning} className="flex-1">Queue (FIFO)</Button>
            </div>

            <div className="divider"></div>

            <h3>Operations</h3>
            <div className="input-group mb-4">
              <input 
                type="number" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                placeholder="Value..."
                disabled={isRunning}
                className="sq-input mb-4"
              />
              
              {mode === 'stack' ? (
                <>
                  <Button variant="primary" onClick={handlePush} disabled={isRunning} className="w-full mb-2 flex-center gap-2">
                    <Plus size={16} /> Push
                  </Button>
                  <Button variant="danger" onClick={handlePop} disabled={isRunning} className="w-full mb-2 flex-center gap-2">
                    <Trash2 size={16} /> Pop
                  </Button>
                  <Button variant="secondary" onClick={handlePeek} disabled={isRunning} className="w-full mb-2 flex-center gap-2">
                    <Search size={16} /> Peek (Top)
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="primary" onClick={handleEnqueue} disabled={isRunning} className="w-full mb-2 flex-center gap-2">
                    <Plus size={16} /> Enqueue
                  </Button>
                  <Button variant="danger" onClick={handleDequeue} disabled={isRunning} className="w-full mb-2 flex-center gap-2">
                    <Trash2 size={16} /> Dequeue
                  </Button>
                  <Button variant="secondary" onClick={handleQueuePeek} disabled={isRunning} className="w-full mb-2 flex-center gap-2">
                    <Search size={16} /> Front
                  </Button>
                </>
              )}
            </div>

            <div className="divider"></div>
            
            <Button variant="outline" onClick={() => setIsCodeModalOpen(true)} className="w-full flex-center gap-2">
              <Code size={16} /> View {mode.toUpperCase()} Code
            </Button>
          </Card>
        </div>
        
        <div className="sq-main">
          <Card className="sq-card">
            <div className="status-bar">
              {statusMessage}
            </div>
            <div className="sq-svg-container">
              <svg 
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} 
                preserveAspectRatio="xMidYMid meet"
                className="sq-svg"
              >
                {/* Draw Container outline depending on mode */}
                {mode === 'stack' ? (
                  // Vertical U-shape tube for Stack
                  <path 
                    d={`M ${SVG_WIDTH/2 - NODE_WIDTH/2 - 10} 100 
                        L ${SVG_WIDTH/2 - NODE_WIDTH/2 - 10} ${SVG_HEIGHT - 20} 
                        L ${SVG_WIDTH/2 + NODE_WIDTH/2 + 10} ${SVG_HEIGHT - 20} 
                        L ${SVG_WIDTH/2 + NODE_WIDTH/2 + 10} 100`} 
                    className="sq-container-outline"
                  />
                ) : (
                  // Horizontal parallel lines for Queue
                  <g>
                    <line 
                      x1="100" y1={SVG_HEIGHT/2 - NODE_HEIGHT/2 - 10} 
                      x2="700" y2={SVG_HEIGHT/2 - NODE_HEIGHT/2 - 10} 
                      className="sq-container-outline" 
                    />
                    <line 
                      x1="100" y1={SVG_HEIGHT/2 + NODE_HEIGHT/2 + 10} 
                      x2="700" y2={SVG_HEIGHT/2 + NODE_HEIGHT/2 + 10} 
                      className="sq-container-outline" 
                    />
                    <text x="50" y={SVG_HEIGHT/2 + 5} fill="var(--text-secondary)" fontSize="12" textAnchor="middle">IN</text>
                    <text x="750" y={SVG_HEIGHT/2 + 5} fill="var(--text-secondary)" fontSize="12" textAnchor="middle">OUT</text>
                  </g>
                )}

                {renderNodes(elements)}
                {renderNodes(fadingElements)}
              </svg>
            </div>
          </Card>
        </div>
      </div>

      {/* EDUCATIONAL GUIDE */}
      <div className="edu-guide-container">
        <div className="edu-guide-header">
          <h2>Stacks & Queues</h2>
        </div>

        <div className="edu-section">
          <h3>Restricted Access</h3>
          <p>Stacks and Queues are fundamentally just Arrays or Linked Lists, but with strict access limits.</p>
          <p>Instead of reading or writing anywhere in memory, you are only permitted to add or remove elements at the very ends. This limitation guarantees that these operations are always fast.</p>
        </div>

        <div className="edu-section">
          <h3>1. Stacks (LIFO)</h3>
          <p>LIFO means <strong>Last-In, First-Out</strong>. Think of stacking plastic chairs after an event. You put the last chair on the top of the stack. When someone needs a chair later, they pull that exact same chair off the top first.</p>
          <p><strong>The Good:</strong> Adding (Push) and removing (Pop) is instantaneous (<code>O(1)</code>) since you only interact with the top item.</p>
          <p><strong>Real-World Use:</strong> The "Undo" button in text editors, and the function Call Stack in programming languages.</p>
        </div>

        <div className="edu-section">
          <h3>2. Queues (FIFO)</h3>
          <p>FIFO means <strong>First-In, First-Out</strong>. It's a standard waiting line. The first person to get in line is the first person to get served.</p>
          <p><strong>The Good:</strong> Adding to the back (Enqueue) and removing from the front (Dequeue) are instantaneous (<code>O(1)</code>) if backed by a Linked List.</p>
          <p><strong>Real-World Use:</strong> Printer job scheduling, Web Server request processing, and Breadth-First Search (BFS).</p>
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
                  <td>Push / Enqueue</td>
                  <td className="complexity-o1">O(1)</td>
                  <td>You are only adding to the exact end of the line. Instant.</td>
                </tr>
                <tr>
                  <td>Pop / Dequeue</td>
                  <td className="complexity-o1">O(1)</td>
                  <td>You are only removing from the exact end of the line. Instant.</td>
                </tr>
                <tr>
                  <td>Peek (Front/Top)</td>
                  <td className="complexity-o1">O(1)</td>
                  <td>Looking at the first item is instant.</td>
                </tr>
                <tr>
                  <td>Search / Access</td>
                  <td className="complexity-on">O(N)</td>
                  <td>Forbidden! You must pop every item off to find what's at the bottom.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <CodeModal 
        isOpen={isCodeModalOpen} 
        onClose={() => setIsCodeModalOpen(false)} 
        code={sqSnippets[mode]} 
        title={mode === 'stack' ? 'Stack (Array-based)' : 'Queue (Array-based)'} 
      />
    </div>
  );
};

export default StacksQueuesVisualizer;
