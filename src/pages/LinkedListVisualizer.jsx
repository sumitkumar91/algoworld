import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Code, Link as LinkIcon } from 'lucide-react';
import SEO from '../components/SEO';
import Button from '../components/Button';
import Card from '../components/Card';
import CodeModal from '../components/CodeModal';
import { linkedListSnippets } from '../utils/codeSnippets';
import { LLNode, calculateListPositions, generatePointers, getInsertFrames, getDeleteFrames, getSearchFrames } from '../utils/linkedList';
import './LinkedListVisualizer.css';

const SVG_WIDTH = 800;
const SVG_HEIGHT = 400;
const ANIMATION_SPEED = 800; // ms

const LinkedListVisualizer = () => {
  const [mode, setMode] = useState('sll'); // 'sll', 'dll', 'csll'
  const [nodes, setNodes] = useState([]);
  const [pointers, setPointers] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [insertIndex, setInsertIndex] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  // Animation states
  const [activeNodes, setActiveNodes] = useState(new Set());
  const [successNode, setSuccessNode] = useState(null);
  const [errorNode, setErrorNode] = useState(null);

  // Initialize with some default nodes
  useEffect(() => {
    const initNodes = calculateListPositions([new LLNode(10), new LLNode(20), new LLNode(30)]);
    setNodes(initNodes);
    setPointers(generatePointers(initNodes, mode));
  }, [mode]);

  // Clean up highlights
  const clearHighlights = () => {
    setActiveNodes(new Set());
    setSuccessNode(null);
    setErrorNode(null);
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const runAnimationFrames = async (frames, finalNodes) => {
    setIsRunning(true);
    clearHighlights();

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      setActiveNodes(new Set(frame.activeNodes || []));
      setStatusMessage(frame.action);
      
      if (frame.isFound) {
        setSuccessNode(frame.activeNodes[0]);
      }
      
      if (frame.nodes) setNodes(frame.nodes);
      if (frame.pointers) setPointers(frame.pointers);
      
      await sleep(ANIMATION_SPEED);
    }

    if (finalNodes) {
      const finalPositions = calculateListPositions(finalNodes);
      setNodes(finalPositions);
      setPointers(generatePointers(finalPositions, mode));
    }
    
    setStatusMessage('Done');
    setTimeout(() => {
      clearHighlights();
      setStatusMessage('Ready');
      setIsRunning(false);
    }, ANIMATION_SPEED);
  };

  const handleInsert = async (type) => {
    if (isRunning || !inputValue) return;
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    
    let targetIndex = 0;
    if (type === 'index') {
      targetIndex = parseInt(insertIndex);
      if (isNaN(targetIndex) || targetIndex < 0 || targetIndex > nodes.length) return;
    }

    setInputValue('');
    setInsertIndex('');

    const { frames, finalNodes } = getInsertFrames(nodes, val, type, mode, targetIndex);
    await runAnimationFrames(frames, finalNodes);
  };

  const handleDelete = async () => {
    if (isRunning || !inputValue) return;
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setInputValue('');

    const { frames, finalNodes } = getDeleteFrames(nodes, val, mode);
    await runAnimationFrames(frames, finalNodes);
  };

  const handleSearch = async () => {
    if (isRunning || !inputValue) return;
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setInputValue('');

    const { frames } = getSearchFrames(nodes, val, mode);
    await runAnimationFrames(frames, null);
  };

  const getModeTitle = () => {
    if (mode === 'sll') return "Singly Linked List";
    if (mode === 'dll') return "Doubly Linked List";
    return "Circular Linked List";
  };

  return (
    <div className="container animate-fade-in ll-container">
      <SEO 
        title="Linked List Visualizer - AlgoWorld" 
        description="Visualize Singly, Doubly, and Circular Linked Lists." 
        path="/linked-list" 
      />
      <div className="ll-header">
        <h1>Linked Lists <LinkIcon size={36} className="inline-icon" /></h1>
        <p className="subtitle">Visualize node insertions, deletions, and pointers in real-time.</p>
      </div>

      <div className="ll-layout">
        <div className="ll-sidebar">
          <Card className="controls-card">
            <h3>Select Mode</h3>
            <div className="mode-toggle">
              <Button variant={mode === 'sll' ? 'primary' : 'secondary'} onClick={() => setMode('sll')} disabled={isRunning} className="flex-1">SLL</Button>
              <Button variant={mode === 'dll' ? 'primary' : 'secondary'} onClick={() => setMode('dll')} disabled={isRunning} className="flex-1">DLL</Button>
              <Button variant={mode === 'csll' ? 'primary' : 'secondary'} onClick={() => setMode('csll')} disabled={isRunning} className="flex-1">CSLL</Button>
            </div>

            <div className="divider"></div>

            <h3>Operations</h3>
            <div className="input-group mb-4">
              <input 
                type="number" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                placeholder="Node value..."
                disabled={isRunning}
                className="ll-input mb-2"
              />
              <div className="action-buttons">
                <Button variant="primary" onClick={() => handleInsert('tail')} disabled={isRunning} className="w-full mb-2 flex-center gap-2">
                  <Plus size={16} /> Insert Tail
                </Button>
                <Button variant="secondary" onClick={() => handleInsert('head')} disabled={isRunning} className="w-full mb-2 flex-center gap-2">
                  <Plus size={16} /> Insert Head
                </Button>
              </div>

              <div className="divider"></div>
              
              <div style={{display: 'flex', gap: '0.5rem'}} className="mb-2">
                <input 
                  type="number" 
                  value={insertIndex} 
                  onChange={(e) => setInsertIndex(e.target.value)} 
                  placeholder="Index..."
                  disabled={isRunning}
                  className="ll-input"
                  style={{flex: 1}}
                />
                <Button variant="secondary" onClick={() => handleInsert('index')} disabled={isRunning} style={{flex: 2}}>
                  Insert at Index
                </Button>
              </div>

              <div className="divider"></div>

              <div style={{display: 'flex', gap: '0.5rem'}}>
                <Button variant="secondary" onClick={handleSearch} disabled={isRunning} className="w-full flex-center gap-2">
                  <Search size={16} /> Search
                </Button>
                <Button variant="danger" onClick={handleDelete} disabled={isRunning} className="w-full flex-center gap-2">
                  <Trash2 size={16} /> Delete
                </Button>
              </div>
            </div>

            <div className="divider"></div>
            
            <Button variant="danger" onClick={() => { setNodes([]); setPointers([]); }} disabled={isRunning} className="w-full flex-center gap-2 mb-4">
              <Trash2 size={16} /> Clear List
            </Button>

            <Button variant="outline" onClick={() => setIsCodeModalOpen(true)} className="w-full flex-center gap-2">
              <Code size={16} /> View {mode.toUpperCase()} Code
            </Button>
          </Card>
        </div>
        
        <div className="ll-main">
          <Card className="ll-card">
            <div className="status-bar">
              {statusMessage}
            </div>
            <div className="svg-container">
              <svg 
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} 
                preserveAspectRatio="xMidYMid meet"
                className="ll-svg"
              >
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-secondary)" />
                  </marker>
                  <marker id="arrowhead-highlighted" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent-cyan)" />
                  </marker>
                </defs>

                {pointers.map(pointer => {
                  const edgeClass = `ll-edge ${pointer.isHighlighted ? 'highlighted' : ''}`;
                  const marker = pointer.isHighlighted ? "url(#arrowhead-highlighted)" : "url(#arrowhead)";
                  
                  if (pointer.type === 'straight') {
                    return (
                      <line
                        key={pointer.id}
                        x1={pointer.x1}
                        y1={pointer.y1}
                        x2={pointer.x2}
                        y2={pointer.y2}
                        className={edgeClass}
                        markerEnd={marker}
                      />
                    );
                  } else if (pointer.type === 'curve') {
                    const pathData = `M ${pointer.x1} ${pointer.y1} Q ${pointer.cx} ${pointer.cy} ${pointer.x2} ${pointer.y2}`;
                    return (
                      <path
                        key={pointer.id}
                        d={pathData}
                        fill="none"
                        className={edgeClass}
                        markerEnd={marker}
                      />
                    );
                  } else if (pointer.type === 'null') {
                    return (
                      <g key={pointer.id}>
                        <line
                          x1={pointer.x1}
                          y1={pointer.y1}
                          x2={pointer.x2}
                          y2={pointer.y2}
                          className={edgeClass}
                        />
                        <line x1={pointer.x2 - 10} y1={pointer.y2} x2={pointer.x2 + 10} y2={pointer.y2} className={edgeClass} />
                        <line x1={pointer.x2 - 6} y1={pointer.y2 + 5} x2={pointer.x2 + 6} y2={pointer.y2 + 5} className={edgeClass} />
                        <line x1={pointer.x2 - 2} y1={pointer.y2 + 10} x2={pointer.x2 + 2} y2={pointer.y2 + 10} className={edgeClass} />
                      </g>
                    );
                  }
                  return null;
                })}

                {nodes.map(node => {
                  const isHighlighted = activeNodes.has(node.id);
                  const isSuccess = successNode === node.id;
                  const isError = errorNode === node.id;
                  
                  let groupClass = "ll-node-group";
                  if (isSuccess) groupClass += " success";
                  else if (isError) groupClass += " error";
                  else if (isHighlighted) groupClass += " highlighted";

                  return (
                    <g key={node.id} className={groupClass}>
                      <rect x={node.x - 40} y={node.y - 20} width="50" height="40" className="ll-node-data" />
                      <text x={node.x - 15} y={node.y} className="ll-text-val" dy=".3em" textAnchor="middle">{node.value}</text>
                      
                      <rect x={node.x + 10} y={node.y - 20} width="20" height="40" className="ll-node-next" />
                      <circle cx={node.x + 20} cy={node.y} r="3" className="ll-pointer-dot" />

                      <text x={node.x - 5} y={node.y + 35} className="ll-text-addr" textAnchor="middle">{node.address}</text>
                    </g>
                  );
                })}
              </svg>
              {nodes.length === 0 && (
                <div className="empty-state">List is empty. Insert a node to begin.</div>
              )}
            </div>
          </Card>
        </div>
      </div>
      
      <CodeModal 
        isOpen={isCodeModalOpen} 
        onClose={() => setIsCodeModalOpen(false)} 
        code={linkedListSnippets[mode]} 
        title={getModeTitle()} 
      />
    </div>
  );
};

export default LinkedListVisualizer;
