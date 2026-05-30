import { useState, useEffect, useRef } from 'react';
import { Play, Share2, Layers, Network, SkipForward, Pause, RotateCcw, Edit3, Check, Trash2, Map, Link2, GitCommit, Code } from 'lucide-react';
import SEO from '../components/SEO';
import CodeModal from '../components/CodeModal';
import { graphSnippets } from '../utils/codeSnippets';
import Button from '../components/Button';
import Card from '../components/Card';
import './GraphVisualizer.css';
import '../components/EducationalGuide.css';
import { initialGraph, getBfsFrames, getDfsFrames, getKruskalFrames, getPrimFrames, getDijkstraFrames } from '../utils/graphAlgorithms';

const SVG_WIDTH = 650;
const SVG_HEIGHT = 400;
const ANIMATION_SPEED = 600; // ms

const GraphVisualizer = () => {
  const [mode, setMode] = useState('BFS'); // 'BFS', 'DFS', 'Kruskal', 'Prim', 'Dijkstra'
  const [isRunning, setIsRunning] = useState(false);
  
  // Graph Builder State
  const [graphData, setGraphData] = useState(initialGraph);
  const [isEditing, setIsEditing] = useState(false);
  const [edgeStartNode, setEdgeStartNode] = useState(null);
  const svgRef = useRef(null);

  // Animation state
  const [frames, setFrames] = useState([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  
  // State from current frame
  const [activeNode, setActiveNode] = useState(null);
  const [activeEdge, setActiveEdge] = useState(null);
  const [visitedNodes, setVisitedNodes] = useState(new Set());
  const [processedNodes, setProcessedNodes] = useState(new Set());
  const [mstEdges, setMstEdges] = useState([]);
  const [dataStructure, setDataStructure] = useState([]);
  const [times, setTimes] = useState({}); // id -> { discovery, finish }
  const [distances, setDistances] = useState({}); // id -> distance
  const [actionLabel, setActionLabel] = useState('');

  const timerRef = useRef(null);

  const resetSimulationState = () => {
    setActiveNode(null);
    setActiveEdge(null);
    setVisitedNodes(new Set());
    setProcessedNodes(new Set());
    setMstEdges([]);
    setDataStructure([]);
    setTimes({});
    setDistances({});
    setActionLabel('');
  };

  const generateFrames = () => {
    if (graphData.nodes.length === 0) {
      setFrames([]);
      return;
    }
    
    let startNode = '0';
    if (!graphData.nodes.find(n => n.id === '0')) {
      startNode = graphData.nodes[0].id;
    }
    
    let newFrames = [];
    if (mode === 'BFS') newFrames = getBfsFrames(graphData, startNode);
    else if (mode === 'DFS') newFrames = getDfsFrames(graphData, startNode);
    else if (mode === 'Kruskal') newFrames = getKruskalFrames(graphData);
    else if (mode === 'Prim') newFrames = getPrimFrames(graphData, startNode);
    else if (mode === 'Dijkstra') newFrames = getDijkstraFrames(graphData, startNode);
    
    setFrames(newFrames);
    setCurrentFrameIndex(0);
  };

  useEffect(() => {
    if (!isEditing) {
      generateFrames();
    }
    pauseSimulation();
  }, [mode, graphData, isEditing]);

  useEffect(() => {
    if (frames.length === 0) {
      resetSimulationState();
      return;
    }
    
    const frame = frames[currentFrameIndex];
    if (!frame) return;

    const processed = new Set();
    for (let i = 0; i <= currentFrameIndex; i++) {
      if (frames[i].processedNode) {
        processed.add(frames[i].processedNode);
      }
      if (frames[i].processedNodes) {
        frames[i].processedNodes.forEach(n => processed.add(n));
      }
    }

    setActiveNode(frame.activeNode || null);
    setActiveEdge(frame.activeEdge || null);
    setVisitedNodes(new Set(frame.visitedNodes || []));
    setDataStructure(frame.dataStructure || []);
    setMstEdges(frame.mstEdges || []);
    setActionLabel(frame.action || '');
    setProcessedNodes(processed);
    setTimes(frame.times || {});
    setDistances(frame.distances || {});

    if (currentFrameIndex === frames.length - 1 && isRunning) {
      setIsRunning(false);
      setActionLabel(`${mode} Complete`);
    }
  }, [currentFrameIndex, frames]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setCurrentFrameIndex(prev => {
          if (prev < frames.length - 1) return prev + 1;
          clearInterval(timerRef.current);
          return prev;
        });
      }, ANIMATION_SPEED);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, frames.length]);

  const toggleSimulation = () => {
    if (frames.length === 0) return;
    if (currentFrameIndex >= frames.length - 1) {
      setCurrentFrameIndex(0);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const pauseSimulation = () => {
    setIsRunning(false);
  };

  const stepForward = () => {
    setIsRunning(false); 
    if (currentFrameIndex < frames.length - 1) {
      setCurrentFrameIndex(prev => prev + 1);
    }
  };
  
  const resetSimulation = () => {
    setIsRunning(false);
    generateFrames(); 
  };

  // --- Graph Builder Methods ---

  const handleSvgClick = (e) => {
    if (!isEditing || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * SVG_WIDTH;
    const y = ((e.clientY - rect.top) / rect.height) * SVG_HEIGHT;
    
    let nextIdInt = 0;
    const usedIds = new Set(graphData.nodes.map(n => parseInt(n.id)));
    while (usedIds.has(nextIdInt)) {
      nextIdInt++;
    }
    const newId = String(nextIdInt);
    
    setGraphData(prev => ({
      ...prev,
      nodes: [...prev.nodes, { id: newId, x, y }]
    }));
  };

  const handleNodeClick = (nodeId, e) => {
    if (!isEditing) return;
    e.stopPropagation(); 
    
    if (edgeStartNode === null) {
      setEdgeStartNode(nodeId);
    } else {
      if (edgeStartNode !== nodeId) {
        setGraphData(prev => {
          const exists = prev.edges.some(edge => 
            (edge.u === edgeStartNode && edge.v === nodeId) ||
            (edge.u === nodeId && edge.v === edgeStartNode)
          );
          if (exists) return prev;
          
          const weight = Math.floor(Math.random() * 20) + 1;
          
          return {
            ...prev,
            edges: [...prev.edges, { u: edgeStartNode, v: nodeId, w: weight }]
          };
        });
      }
      setEdgeStartNode(null); 
    }
  };

  const handleEdgeWeightClick = (e, uId, vId, currentWeight) => {
    if (!isEditing) return;
    e.stopPropagation();
    
    const input = window.prompt("Enter new positive integer weight for this edge:", currentWeight);
    if (input === null || input.trim() === '') return;
    
    const newWeight = parseInt(input, 10);
    if (!isNaN(newWeight) && newWeight > 0) {
      setGraphData(prev => {
        const newEdges = prev.edges.map(edge => {
          if ((edge.u === uId && edge.v === vId) || (edge.u === vId && edge.v === uId)) {
            return { ...edge, w: newWeight };
          }
          return edge;
        });
        return { ...prev, edges: newEdges };
      });
    } else {
      alert("Please enter a valid positive integer greater than 0.");
    }
  };

  const clearGraph = () => {
    setGraphData({ nodes: [], edges: [] });
    setEdgeStartNode(null);
    pauseSimulation();
    setFrames([]);
  };

  const toggleEditMode = () => {
    if (!isEditing) {
      pauseSimulation();
      resetSimulationState();
    } else {
      setEdgeStartNode(null);
    }
    setIsEditing(!isEditing);
  };

  // Determine container type
  const isBfs = mode === 'BFS';
  const isDfs = mode === 'DFS';
  const isKruskal = mode === 'Kruskal';
  const isPrim = mode === 'Prim';
  const isDijkstra = mode === 'Dijkstra';
  
  let dsTypeLabel = 'Queue';
  if (isDfs) dsTypeLabel = 'Stack';
  if (isKruskal) dsTypeLabel = 'Sorted Edges';
  if (isPrim || isDijkstra) dsTypeLabel = 'Priority Queue (Min-Heap)';

  return (
    <div className="container animate-fade-in graph-container">
      <SEO 
        title="Graph Traversals & Builder - AlgoWorld" 
        description="Build custom graphs and visualize Dijkstra's, Kruskal's, Prim's, BFS, and DFS algorithms step-by-step." 
        path="/graph" 
      />
      <div className="graph-header">
        <h1>Graph Traversals <Network size={36} className="inline-icon" /></h1>
        <p className="subtitle">Build graphs and visualize search algorithms and Minimum Spanning Trees.</p>
      </div>

      <div className="graph-layout">
        
        {/* Left Column: Controls & Data Structure */}
        <div className="graph-left-col">
          <Card className="controls-card mb-4">
            
            {!isEditing ? (
              <>
                <div className="algo-grid mb-4">
                  <Button variant={isBfs ? 'primary' : 'secondary'} onClick={() => setMode('BFS')} disabled={isRunning} className="w-full flex-center gap-2">
                    <Share2 size={16} /> BFS
                  </Button>
                  <Button variant={isDfs ? 'primary' : 'secondary'} onClick={() => setMode('DFS')} disabled={isRunning} className="w-full flex-center gap-2">
                    <Layers size={16} /> DFS
                  </Button>
                  <Button variant={isDijkstra ? 'primary' : 'secondary'} onClick={() => setMode('Dijkstra')} disabled={isRunning} className="w-full flex-center gap-2" style={{ gridColumn: 'span 2' }}>
                    <Map size={16} /> Dijkstra (Shortest Path)
                  </Button>
                  <Button variant={isKruskal ? 'primary' : 'secondary'} onClick={() => setMode('Kruskal')} disabled={isRunning} className="w-full flex-center gap-2">
                    <GitCommit size={16} /> Kruskal (MST)
                  </Button>
                  <Button variant={isPrim ? 'primary' : 'secondary'} onClick={() => setMode('Prim')} disabled={isRunning} className="w-full flex-center gap-2">
                    <Link2 size={16} /> Prim (MST)
                  </Button>
                </div>
                
                <div className="action-buttons mt-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div className="flex gap-2">
                  {!isRunning ? (
                    <Button onClick={toggleSimulation} className="flex-1 flex-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-black border-0 hover:opacity-90">
                      <Play size={18} /> Play
                    </Button>
                  ) : (
                    <Button onClick={pauseSimulation} className="flex-1 flex-center gap-2" variant="secondary">
                      <Pause size={18} /> Pause
                    </Button>
                  )}
                  
                  <Button onClick={stepForward} disabled={isRunning || frames.length === 0 || currentFrameIndex >= frames.length - 1} className="flex-1 flex-center gap-2" variant="secondary">
                    <SkipForward size={18} /> Step
                  </Button>
                  
                  <Button onClick={resetSimulation} className="flex-1 flex-center gap-2" variant="secondary">
                    <RotateCcw size={18} /> Reset
                  </Button>
                </div>
                
                <div className="flex justify-center mt-3">
                  <Button onClick={() => setIsCodeModalOpen(true)} variant="outline" className="w-full flex-center gap-2">
                    <Code size={16} /> View {mode} Code
                  </Button>
                </div>
              </div>
                
                <Button variant="secondary" onClick={toggleEditMode} className="w-full flex-center gap-2 mt-4">
                  <Edit3 size={16} /> Edit Graph
                </Button>
              </>
            ) : (
              <div className="builder-controls animate-fade-in">
                <h3 className="mb-4" style={{color: '#ffeb3b', textAlign: 'center'}}>Builder Mode</h3>
                <p className="text-sm text-secondary mb-4" style={{textAlign: 'center', lineHeight: '1.4'}}>
                  Click empty space to drop nodes.<br/>
                  Click two nodes to connect an edge.
                </p>
                <div className="action-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Button variant="danger" onClick={clearGraph} className="w-full flex-center gap-2">
                    <Trash2 size={16} /> Clear Canvas
                  </Button>
                  <Button variant="primary" onClick={toggleEditMode} className="w-full flex-center gap-2 btn-graph">
                    <Check size={16} /> Finish Editing
                  </Button>
                </div>
              </div>
            )}
          </Card>
          
          <Card className="ds-card">
            <div className="ds-header">
              <h3>{dsTypeLabel}</h3>
              <span className="ds-action">{actionLabel}</span>
            </div>
            
            <div className={`ds-container queue`}>
              {dataStructure.length === 0 && <div className="ds-empty">Empty</div>}
              
              <div className="queue-items">
                {dataStructure.map((item, idx) => (
                  <div key={idx} className={`ds-item queue-item animate-fade-in ${isDfs && idx === 0 ? 'top' : ''}`}>
                    <span className="node-id" style={{fontSize: typeof item === 'string' && item.includes('(') ? '1rem' : '1.2rem'}}>
                      {item}
                    </span>
                    {isBfs && idx === 0 && <span className="ds-badge head">FRONT</span>}
                    {isDfs && idx === 0 && <span className="ds-badge head">TOP</span>}
                    {isDijkstra && idx === 0 && <span className="ds-badge head">MIN</span>}
                    {isPrim && idx === 0 && <span className="ds-badge head">MIN</span>}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
        
        {/* Right Column: Graph View */}
        <div className="graph-right-col">
          <Card className="graph-card">
            <div className="graph-svg-container">
              <svg 
                ref={svgRef}
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} 
                preserveAspectRatio="xMidYMid meet"
                className={`graph-svg ${isEditing ? 'editing' : ''}`}
                onClick={handleSvgClick}
              >
                {/* Draw Edges */}
                {graphData.edges.map((edge, idx) => {
                  const u = graphData.nodes.find(n => n.id === edge.u);
                  const v = graphData.nodes.find(n => n.id === edge.v);
                  if (!u || !v) return null;
                  
                  const isEdgeVisited = visitedNodes.has(edge.u) && visitedNodes.has(edge.v);
                  const isEdgeMst = mstEdges.some(e => (e.u === edge.u && e.v === edge.v) || (e.u === edge.v && e.v === edge.u));
                  const isEdgeActive = activeEdge && ((activeEdge.u === edge.u && activeEdge.v === edge.v) || (activeEdge.u === edge.v && activeEdge.v === edge.u));
                  
                  let edgeClass = "graph-edge";
                  if (isEdgeVisited) edgeClass += " visited";
                  if (isEdgeMst) edgeClass += " mst";
                  if (isEdgeActive) edgeClass += " active";
                  
                  const midX = (u.x + v.x) / 2;
                  const midY = (u.y + v.y) / 2;
                  
                  return (
                    <g 
                      key={idx}
                      onClick={(e) => handleEdgeWeightClick(e, u.id, v.id, edge.w)}
                      style={{ cursor: isEditing ? 'pointer' : 'default' }}
                    >
                      <line x1={u.x} y1={u.y} x2={v.x} y2={v.y} className={edgeClass} />
                      {/* Edge Weight Label */}
                      <rect 
                        x={midX - 12} y={midY - 12} 
                        width="24" height="24" 
                        rx="12" 
                        className={`edge-weight-bg ${isEdgeMst ? 'mst' : ''} ${isEdgeActive ? 'active' : ''}`} 
                      />
                      <text x={midX} y={midY} dy="0.3em" textAnchor="middle" className="edge-weight-text">
                        {edge.w}
                      </text>
                    </g>
                  );
                })}
                
                {/* Draw Nodes */}
                {graphData.nodes.map(node => {
                  const isActive = activeNode === node.id;
                  const isProcessed = processedNodes.has(node.id) || (times[node.id] && times[node.id].finish !== null);
                  const isVisited = visitedNodes.has(node.id) && !isProcessed;
                  const isEdgeStart = isEditing && edgeStartNode === node.id;
                  
                  let nodeClass = "graph-node";
                  if (isEditing) nodeClass += " builder-node";
                  if (isActive) nodeClass += " active";
                  else if (isProcessed) nodeClass += " processed";
                  else if (isVisited) nodeClass += " visited";
                  if (isEdgeStart) nodeClass += " edge-start";

                  return (
                    <g 
                      key={node.id} 
                      onClick={(e) => handleNodeClick(node.id, e)}
                      style={{ cursor: isEditing ? 'pointer' : 'default' }}
                    >
                      <circle cx={node.x} cy={node.y} r="24" className={nodeClass} />
                      <text x={node.x} y={node.y} className="node-text" dy="0.3em" textAnchor="middle">
                        {node.id}
                      </text>
                      
                      {/* Discovery / Finish times for DFS */}
                      {isDfs && !isEditing && times[node.id] && (
                        <text x={node.x} y={node.y - 35} className="time-text" textAnchor="middle">
                          {times[node.id].discovery}/{times[node.id].finish || '?'}
                        </text>
                      )}
                      
                      {/* Shortest Distances for Dijkstra */}
                      {isDijkstra && !isEditing && distances[node.id] !== undefined && (
                        <text x={node.x} y={node.y - 35} className="time-text dist-text" textAnchor="middle">
                          d={distances[node.id] === Infinity ? '∞' : distances[node.id]}
                        </text>
                      )}
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
          <h2>Graph Algorithms</h2>
        </div>

        <div className="edu-section">
          <h3>The Searchers: BFS & DFS</h3>
          <p>How do you explore a maze?</p>
          <ul>
            <li><strong>Breadth-First Search (BFS):</strong> Explores layer by layer like a radar pulse. It uses a Queue. It is guaranteed to find the shortest path in an unweighted graph (like finding the fewest number of flights between two cities).</li>
            <li><strong>Depth-First Search (DFS):</strong> Plunges as deep as possible down one path until it hits a dead end, then backtracks. It uses a Stack. Great for solving mazes and topological sorting.</li>
          </ul>
        </div>

        <div className="edu-section">
          <h3>Shortest Path: Dijkstra</h3>
          <p>If edges have weights (like miles or traffic delay), BFS fails because a 1-hop path could be 100 miles, while a 3-hop path could be 5 miles.</p>
          <p><strong>Dijkstra's Algorithm</strong> solves this. It uses a Priority Queue (Min-Heap) to always greedily explore the shortest known path first. This is exactly how GPS navigation software routes you home.</p>
        </div>

        <div className="edu-section">
          <h3>Minimum Spanning Trees: Prim & Kruskal</h3>
          <p>Imagine you have 10 cities and want to lay down fiber optic cable to connect them all. You want to use the absolute minimum amount of cable possible.</p>
          <ul>
            <li><strong>Prim's Algorithm:</strong> Starts at one city and greedily grows outwards, always picking the cheapest edge that connects a new city to the growing network.</li>
            <li><strong>Kruskal's Algorithm:</strong> Just sorts all cables by price, and greedily buys the cheapest ones first, as long as they don't create a useless loop (cycle).</li>
          </ul>
        </div>

        <div className="edu-section">
          <h3>Time Complexity</h3>
          <div className="edu-table-container">
            <table className="edu-table">
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Big-O (V=Vertices, E=Edges)</th>
                  <th>Core Data Structure</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>BFS / DFS</td>
                  <td className="complexity-on"><code>O(V + E)</code></td>
                  <td>Queue / Stack</td>
                </tr>
                <tr>
                  <td>Dijkstra's Shortest Path</td>
                  <td className="complexity-ologn"><code>O((V + E) log V)</code></td>
                  <td>Priority Queue (Min-Heap)</td>
                </tr>
                <tr>
                  <td>Prim's MST</td>
                  <td className="complexity-ologn"><code>O((V + E) log V)</code></td>
                  <td>Priority Queue (Min-Heap)</td>
                </tr>
                <tr>
                  <td>Kruskal's MST</td>
                  <td className="complexity-ologn"><code>O(E log E)</code></td>
                  <td>Disjoint Set (Union-Find)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <CodeModal 
        isOpen={isCodeModalOpen} 
        onClose={() => setIsCodeModalOpen(false)} 
        code={graphSnippets[mode.toLowerCase()]} 
        title={mode} 
      />
    </div>
  );
};

export default GraphVisualizer;
