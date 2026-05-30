import { useState, useCallback, useEffect } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge,
  Handle, 
  Position,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { X, Trash2 } from 'lucide-react';
import './LogicCanvas.css';

// ----------------------
// CUSTOM NODES
// ----------------------

const InputNode = ({ data, id }) => {
  const handleToggle = (e) => {
    if (e.target.tagName !== 'INPUT' && data.onToggle) {
      data.onToggle(id);
    }
  };

  const handleRename = (e) => {
    if (data.onRename) {
      data.onRename(id, e.target.value);
    }
  };

  return (
    <div 
      className={`logic-node-custom input-node state-${data.state}`}
      onClick={handleToggle}
    >
      <button className="node-close-btn" onClick={(e) => { e.stopPropagation(); data.onRemove && data.onRemove(); }}>
        <X size={12} />
      </button>
      <input 
        type="text" 
        value={data.label} 
        onChange={handleRename}
        className="node-label-input"
        maxLength={8}
        title="Rename Input"
      />
      <div style={{ fontSize: '1.2rem', marginLeft: '10px' }} title="Toggle State">{data.state}</div>
      <Handle type="source" position={Position.Right} id="out" />
    </div>
  );
};

const GateNode = ({ data }) => {
  // Determine how many inputs based on gate type
  const numInputs = data.type === 'NOT' ? 1 : 2;
  
  return (
    <div className={`logic-node-custom gate-node`}>
      <button className="node-close-btn" onClick={(e) => { e.stopPropagation(); data.onRemove && data.onRemove(); }}>
        <X size={12} />
      </button>
      
      {numInputs === 1 ? (
        <Handle type="target" position={Position.Left} id="in1" style={{ top: '50%' }} />
      ) : (
        <>
          <Handle type="target" position={Position.Left} id="in1" style={{ top: '30%' }} />
          <Handle type="target" position={Position.Left} id="in2" style={{ top: '70%' }} />
        </>
      )}
      
      <div>{data.type}</div>
      
      <Handle type="source" position={Position.Right} id="out" />
    </div>
  );
};

const OutputNode = ({ data, id }) => {
  const handleRename = (e) => {
    if (data.onRename) {
      data.onRename(id, e.target.value);
    }
  };

  return (
    <div className={`logic-node-custom output-node state-${data.state}`}>
      <button className="node-close-btn" onClick={(e) => { e.stopPropagation(); data.onRemove && data.onRemove(); }}>
        <X size={12} />
      </button>
      <Handle type="target" position={Position.Left} id="in1" />
      <div style={{ fontSize: '1.2rem', marginTop: '12px' }}>{data.state}</div>
      <div style={{ position: 'absolute', bottom: '-28px', width: '80px', textAlign: 'center' }}>
        <input 
          type="text" 
          value={data.label} 
          onChange={handleRename}
          className="node-label-input"
          style={{ width: '100%', textAlign: 'center', background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}
          maxLength={8}
          title="Rename Output"
        />
      </div>
    </div>
  );
};

const nodeTypes = {
  logicInput: InputNode,
  logicGate: GateNode,
  logicOutput: OutputNode
};

// ----------------------
// CANVAS COMPONENT
// ----------------------

const initialNodes = [
  { id: 'in1', type: 'logicInput', position: { x: 50, y: 100 }, data: { label: 'A', state: 0 } },
  { id: 'in2', type: 'logicInput', position: { x: 50, y: 200 }, data: { label: 'B', state: 0 } },
  { id: 'gate1', type: 'logicGate', position: { x: 250, y: 150 }, data: { type: 'AND' } },
  { id: 'out1', type: 'logicOutput', position: { x: 450, y: 150 }, data: { label: 'Out', state: 0 } },
];

const initialEdges = [
  { id: 'e-in1-gate1', source: 'in1', target: 'gate1', targetHandle: 'in1' },
  { id: 'e-in2-gate1', source: 'in2', target: 'gate1', targetHandle: 'in2' },
  { id: 'e-gate1-out1', source: 'gate1', target: 'out1', targetHandle: 'in1' },
];

let nodeId = 1;

export default function LogicCanvas() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const handleToggle = useCallback((id) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, state: n.data.state === 0 ? 1 : 0 } } : n));
  }, []);

  const handleRename = useCallback((id, newLabel) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, label: newLabel } } : n));
  }, []);

  const handleRemoveNode = useCallback((id) => {
    setNodes(nds => nds.filter(n => n.id !== id));
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id));
  }, []);

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
  };

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  // ----------------------
  // LOGIC SIMULATION ENGINE
  // ----------------------
  useEffect(() => {
    // 1. Build a map of node outputs
    const nodeOutputs = {};
    
    // Initialize input nodes
    nodes.forEach(n => {
      if (n.type === 'logicInput') {
        nodeOutputs[n.id] = n.data.state;
      }
    });

    // We need to evaluate the graph topologically, but for a simple React app
    // we can just iterate a few times to let signals propagate (max depth ~ 10)
    let edgesUpdated = [...edges];
    
    for (let pass = 0; pass < 10; pass++) {
      nodes.forEach(node => {
        if (node.type === 'logicGate') {
          // Find incoming edges
          const inEdges = edgesUpdated.filter(e => e.target === node.id);
          
          let val1 = 0;
          let val2 = 0;
          
          inEdges.forEach(e => {
            const srcVal = nodeOutputs[e.source] || 0;
            if (e.targetHandle === 'in1') val1 = srcVal;
            if (e.targetHandle === 'in2') val2 = srcVal;
          });
          
          let res = 0;
          const type = node.data.type;
          if (type === 'AND') res = val1 & val2;
          if (type === 'OR') res = val1 | val2;
          if (type === 'XOR') res = val1 ^ val2;
          if (type === 'NAND') res = (val1 & val2) ? 0 : 1;
          if (type === 'NOR') res = (val1 | val2) ? 0 : 1;
          if (type === 'NOT') res = val1 === 0 ? 1 : 0;
          
          nodeOutputs[node.id] = res;
        }
      });
    }

    // Now update edges and output nodes based on computed values
    let changesMade = false;
    
    const newEdges = edgesUpdated.map(e => {
      const state = nodeOutputs[e.source] || 0;
      const currentClass = e.className || '';
      const newClass = `state-${state}`;
      if (currentClass !== newClass) {
        changesMade = true;
        return { ...e, className: newClass };
      }
      return e;
    });

    if (changesMade) setEdges(newEdges);

    // Update Output nodes
    setNodes(nds => {
      let changed = false;
      const nextNodes = nds.map(n => {
        if (n.type === 'logicOutput') {
          const inEdge = newEdges.find(e => e.target === n.id);
          const newState = inEdge ? (nodeOutputs[inEdge.source] || 0) : 0;
          
          if (n.data.state !== newState) {
            changed = true;
            return { ...n, data: { ...n.data, state: newState } };
          }
        }
        return n;
      });
      return changed ? nextNodes : nds;
    });

  }, [nodes, edges]); // Re-run simulation when nodes or edges change


  // ----------------------
  // PALETTE ACTIONS
  // ----------------------
  const addNode = (type, gateType = null) => {
    const id = `node_${nodeId++}`;
    const position = { x: 250, y: 50 }; // Default drop position
    
    let newNode = { id, type, position, data: {} };
    
    if (type === 'logicInput') {
      newNode.data = { label: 'In', state: 0 };
    } else if (type === 'logicGate') {
      newNode.data = { type: gateType };
    } else if (type === 'logicOutput') {
      newNode.data = { label: 'Out', state: 0 };
    }

    setNodes(nds => [...nds, newNode]);
  };

  return (
    <div className="logic-canvas-container">
      <div className="logic-palette">
        <button onClick={() => addNode('logicInput')}>+ Input</button>
        <button onClick={() => addNode('logicGate', 'AND')}>AND</button>
        <button onClick={() => addNode('logicGate', 'OR')}>OR</button>
        <button onClick={() => addNode('logicGate', 'XOR')}>XOR</button>
        <button onClick={() => addNode('logicGate', 'NOT')}>NOT</button>
        <button onClick={() => addNode('logicOutput')}>+ Output</button>
        
        <div style={{width: '1px', background: 'var(--border-glass)', margin: '0 5px'}}></div>
        
        <button onClick={clearCanvas} style={{ color: 'var(--danger)', borderColor: 'rgba(255, 23, 68, 0.3)' }} title="Clear Canvas">
          <Trash2 size={14} />
        </button>
      </div>

      <div className="logic-canvas-help">
        <strong>How to use:</strong> Click and drag from a node's right dot to another node's left dot to connect them. Click an Input node to toggle it!
      </div>
      
      <ReactFlow
        nodes={nodes.map(n => ({
          ...n,
          data: {
            ...n.data,
            onToggle: handleToggle,
            onRename: handleRename,
            onRemove: () => handleRemoveNode(n.id)
          }
        }))}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background color="#ffffff" gap={16} opacity={0.05} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
