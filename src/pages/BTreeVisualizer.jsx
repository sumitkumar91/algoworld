import { useState, useRef, useEffect } from 'react';
import { Layers, RotateCcw } from 'lucide-react';
import SEO from '../components/SEO';
import Card from '../components/Card';
import './BTreeVisualizer.css';
import '../components/EducationalGuide.css';

// --- B-Tree Implementation (Order 4, max 3 keys per node) ---
class BTreeNode {
  constructor(leaf = true) {
    this.keys = [];
    this.children = [];
    this.leaf = leaf;
    this.id = Math.random().toString(36).substr(2, 9); // for React keys
  }
}

class BTree {
  constructor(t = 2) {
    this.root = new BTreeNode(true);
    this.t = t; // Minimum degree. t=2 means max 3 keys (2t-1)
  }

  insert(k) {
    const root = this.root;
    if (root.keys.length === 2 * this.t - 1) {
      const s = new BTreeNode(false);
      this.root = s;
      s.children.push(root);
      this.splitChild(s, 0, root);
      this.insertNonFull(s, k);
    } else {
      this.insertNonFull(root, k);
    }
  }

  insertNonFull(x, k) {
    let i = x.keys.length - 1;
    if (x.leaf) {
      while (i >= 0 && k < x.keys[i]) {
        i--;
      }
      x.keys.splice(i + 1, 0, k);
    } else {
      while (i >= 0 && k < x.keys[i]) {
        i--;
      }
      i++;
      if (x.children[i].keys.length === 2 * this.t - 1) {
        this.splitChild(x, i, x.children[i]);
        if (k > x.keys[i]) {
          i++;
        }
      }
      this.insertNonFull(x.children[i], k);
    }
  }

  splitChild(x, i, y) {
    const z = new BTreeNode(y.leaf);
    const t = this.t;
    // z gets the last t-1 keys of y
    z.keys = y.keys.splice(t, t - 1);
    if (!y.leaf) {
      z.children = y.children.splice(t, t);
    }
    // move middle key up
    x.keys.splice(i, 0, y.keys.pop());
    x.children.splice(i + 1, 0, z);
  }
  
  clone() {
    // deep clone for React state
    const cloneNode = (node) => {
      if (!node) return null;
      const n = new BTreeNode(node.leaf);
      n.id = node.id;
      n.keys = [...node.keys];
      n.children = node.children.map(cloneNode);
      return n;
    };
    const t = new BTree(this.t);
    t.root = cloneNode(this.root);
    return t;
  }
}

// Recursive React Component for BTree Nodes
const BTreeNodeView = ({ node, registerNodeRef }) => {
  if (!node) return null;

  return (
    <div className="tree-wrapper" id={`wrapper-${node.id}`}>
      <div 
        className="btree-node-block" 
        id={`node-${node.id}`}
        ref={(el) => registerNodeRef(node.id, el)}
      >
        {node.keys.map((key, idx) => (
          <div key={idx} className="btree-key">{key}</div>
        ))}
      </div>
      
      {node.children && node.children.length > 0 && (
        <div className="btree-children-row" id={`children-row-${node.id}`}>
          {node.children.map((child) => (
            <BTreeNodeView 
              key={child.id} 
              node={child} 
              registerNodeRef={registerNodeRef} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const BTreeVisualizer = () => {
  const [tree, setTree] = useState(new BTree(2));
  const [inputValue, setInputValue] = useState('');
  const [lines, setLines] = useState([]);
  const canvasRef = useRef(null);
  const nodeRefs = useRef({});

  const registerNodeRef = (id, el) => {
    if (el) {
      nodeRefs.current[id] = el;
    } else {
      delete nodeRefs.current[id];
    }
  };

  const drawLines = () => {
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newLines = [];

    const traverseAndDraw = (node) => {
      if (!node || !node.children || node.children.length === 0) return;

      const parentEl = nodeRefs.current[node.id];
      if (!parentEl) return;
      const parentRect = parentEl.getBoundingClientRect();
      const startX = parentRect.left + parentRect.width / 2 - canvasRect.left + canvasRef.current.scrollLeft;
      const startY = parentRect.bottom - canvasRect.top + canvasRef.current.scrollTop;

      node.children.forEach(child => {
        const childEl = nodeRefs.current[child.id];
        if (!childEl) return;
        const childRect = childEl.getBoundingClientRect();
        const endX = childRect.left + childRect.width / 2 - canvasRect.left + canvasRef.current.scrollLeft;
        const endY = childRect.top - canvasRect.top + canvasRef.current.scrollTop;

        newLines.push({
          id: `${node.id}-${child.id}`,
          x1: startX,
          y1: startY,
          x2: endX,
          y2: endY
        });

        traverseAndDraw(child);
      });
    };

    traverseAndDraw(tree.root);
    setLines(newLines);
  };

  useEffect(() => {
    // Slight delay to ensure DOM is updated before measuring lines
    const timer = setTimeout(drawLines, 50);
    window.addEventListener('resize', drawLines);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', drawLines);
    };
  }, [tree]);

  const handleInsert = (e) => {
    e.preventDefault();
    const val = parseInt(inputValue);
    if (!isNaN(val)) {
      tree.insert(val);
      setTree(tree.clone());
      setInputValue('');
    }
  };

  const handleReset = () => {
    setTree(new BTree(2));
    setLines([]);
  };

  return (
    <div className="container animate-fade-in btree-container">
      <SEO 
        title="B-Tree Visualizer - AlgoWorld" 
        description="Visualize how B-Trees power relational databases. Watch nodes split and push keys up as they get full." 
        path="/btree" 
      />
      
      <div className="btree-header">
        <h1>B-Tree <Layers size={36} className="inline-icon" /></h1>
        <p className="subtitle">The multi-way search tree that powers modern databases.</p>
      </div>

      <div className="btree-layout">
        <div className="btree-sidebar">
          <Card className="btree-controls-card">
            <h3>Controls</h3>
            <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem'}}>
              Order: 4 (Max 3 keys per node)
            </p>
            
            <form onSubmit={handleInsert} className="control-group">
              <label>Insert Value</label>
              <div className="input-row">
                <input 
                  type="number" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g. 42"
                />
                <button type="submit" disabled={!inputValue}>Insert</button>
              </div>
            </form>

            <button onClick={handleReset} className="btn-secondary">
              <RotateCcw size={18} /> Reset Tree
            </button>
          </Card>
        </div>

        <div className="btree-main">
          <div className="btree-canvas-container" ref={canvasRef}>
            {tree.root.keys.length === 0 && (
              <div className="empty-state">Tree is empty. Insert a value!</div>
            )}
            
            <svg className="lines-svg">
              {lines.map(line => (
                <line 
                  key={line.id} 
                  x1={line.x1} y1={line.y1} 
                  x2={line.x2} y2={line.y2} 
                  className="tree-line" 
                />
              ))}
            </svg>

            <div style={{ paddingTop: '2rem' }}>
              <BTreeNodeView node={tree.root} registerNodeRef={registerNodeRef} />
            </div>
          </div>
        </div>
      </div>

      {/* EDUCATIONAL GUIDE */}
      <div className="edu-guide-container mt-4">
        <div className="edu-guide-header">
          <h2>Understanding B-Trees</h2>
        </div>

        <div className="edu-section">
          <h3>Why not a Binary Search Tree?</h3>
          <p>Binary Search Trees (BSTs) are great in RAM, but terrible for hard drives. Reading from a hard drive is incredibly slow. To make it faster, operating systems read data in large chunks called "Blocks" or "Pages" (typically 4KB to 8KB at a time).</p>
          <p>If a database used a BST, a single node would only hold 1 value, wasting 99% of the disk block it was read from. A B-Tree solves this by packing multiple values into a single node (or "block"). This minimizes disk reads, making databases lightning fast.</p>
        </div>

        <div className="edu-section">
          <h3>The Node Split</h3>
          <p>Unlike standard trees that grow downwards by adding leaves, B-Trees grow <strong>upwards</strong>. When you insert a value and a node becomes completely full (exceeds its maximum keys), it undergoes a "Node Split". The node splits into two, and the middle value is pushed UP to its parent.</p>
          <p>Try inserting numbers sequentially (1, 2, 3, 4) in the visualizer above to watch the root node split and grow the tree upwards!</p>
        </div>

        <div className="edu-section">
          <h3>Real World Usage</h3>
          <p>Virtually every relational database—including PostgreSQL, MySQL, and SQLite—uses B-Trees (or a variant called B+ Trees) to build their indexes. When you run <code>CREATE INDEX</code> in SQL, you are telling the database to build a B-Tree just like the one above.</p>
        </div>
      </div>
    </div>
  );
};

export default BTreeVisualizer;
