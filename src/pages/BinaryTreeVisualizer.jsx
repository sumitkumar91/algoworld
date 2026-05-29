import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Search, Play, Code } from 'lucide-react';
import SEO from '../components/SEO';
import CodeModal from '../components/CodeModal';
import { bstSnippets } from '../utils/codeSnippets';
import Button from '../components/Button';
import Card from '../components/Card';
import './BinaryTreeVisualizer.css';
import {
  TreeNode,
  cloneTree,
  calculateNodePositions,
  insertNode,
  searchNode,
  deleteNode,
  inOrderTraversal,
  preOrderTraversal,
  postOrderTraversal
} from '../utils/binarySearchTree';

const SVG_WIDTH = 800;
const SVG_HEIGHT = 450;
const ANIMATION_SPEED = 500; // ms

const BinaryTreeVisualizer = () => {
  const [root, setRoot] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  
  // Combine all BST snippets into one string for the modal
  const fullBstCode = Object.values(bstSnippets).join('\n\n');
  
  // Animation states
  const [highlightedNodes, setHighlightedNodes] = useState(new Set());
  const [successNode, setSuccessNode] = useState(null);
  const [errorNode, setErrorNode] = useState(null);
  const [traversalResult, setTraversalResult] = useState([]);

  // Setup initial tree
  useEffect(() => {
    let initialRoot = new TreeNode(50);
    initialRoot = insertNode(initialRoot, 25);
    initialRoot = insertNode(initialRoot, 75);
    initialRoot = insertNode(initialRoot, 10);
    initialRoot = insertNode(initialRoot, 35);
    
    initialRoot = calculateNodePositions(initialRoot, SVG_WIDTH, SVG_HEIGHT);
    setRoot(initialRoot);
  }, []);

  const clearHighlights = () => {
    setHighlightedNodes(new Set());
    setSuccessNode(null);
    setErrorNode(null);
    setTraversalResult([]);
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const animatePath = async (path, finalAction = null) => {
    clearHighlights();
    setIsRunning(true);
    
    const newHighlights = new Set();
    
    for (let i = 0; i < path.length; i++) {
      newHighlights.add(path[i]);
      setHighlightedNodes(new Set(newHighlights));
      await sleep(ANIMATION_SPEED);
    }
    
    if (finalAction) await finalAction();
    
    setTimeout(() => {
      clearHighlights();
      setIsRunning(false);
    }, ANIMATION_SPEED * 2);
  };

  const handleInsert = async () => {
    if (isRunning || !inputValue) return;
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setInputValue('');

    const currentTree = cloneTree(root);
    const path = [];
    const newRoot = insertNode(currentTree, val, path);
    
    // We animate the path in the current tree first
    await animatePath(path, async () => {
      const positionedRoot = calculateNodePositions(newRoot, SVG_WIDTH, SVG_HEIGHT);
      setRoot(positionedRoot);
      // Wait for it to render then highlight new node
      await sleep(100);
      setSuccessNode(path[path.length - 1]); // The newly inserted node ID
    });
  };

  const handleDelete = async () => {
    if (isRunning || !inputValue) return;
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setInputValue('');

    const currentTree = cloneTree(root);
    const path = [];
    const newRoot = deleteNode(currentTree, val, path);
    
    await animatePath(path, async () => {
      setSuccessNode(path[path.length - 1]); // Node being deleted
      await sleep(ANIMATION_SPEED);
      const positionedRoot = calculateNodePositions(newRoot, SVG_WIDTH, SVG_HEIGHT);
      setRoot(positionedRoot);
    });
  };

  const handleSearch = async () => {
    if (isRunning || !inputValue) return;
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setInputValue('');

    const { found, path, targetId } = searchNode(root, val);
    
    await animatePath(path, async () => {
      if (found) {
        setSuccessNode(targetId);
      } else {
        setErrorNode(path[path.length - 1]);
      }
    });
  };

  const handleTraversal = async (type) => {
    if (isRunning || !root) return;
    clearHighlights();
    setIsRunning(true);
    
    let path = [];
    if (type === 'inorder') path = inOrderTraversal(root);
    if (type === 'preorder') path = preOrderTraversal(root);
    if (type === 'postorder') path = postOrderTraversal(root);
    
    const values = [];
    
    for (let i = 0; i < path.length; i++) {
      setSuccessNode(path[i]); // highlight current node
      
      // Find node value to append to traversal result text
      const findVal = (node, id) => {
        if (!node) return null;
        if (node.id === id) return node.value;
        return findVal(node.left, id) || findVal(node.right, id);
      };
      
      values.push(findVal(root, path[i]));
      setTraversalResult([...values]);
      
      await sleep(ANIMATION_SPEED);
    }
    
    setTimeout(() => {
      clearHighlights();
      setIsRunning(false);
    }, ANIMATION_SPEED * 2);
  };

  // Helper to render tree nodes and edges
  const renderTree = (node) => {
    if (!node) return null;
    
    const isHighlighted = highlightedNodes.has(node.id);
    const isSuccess = successNode === node.id;
    const isError = errorNode === node.id;
    
    let nodeClass = "tree-node";
    if (isSuccess) nodeClass += " success";
    else if (isError) nodeClass += " error";
    else if (isHighlighted) nodeClass += " highlighted";

    return (
      <g key={node.id}>
        {/* Draw edges to children */}
        {node.left && (
          <line 
            x1={node.x} y1={node.y} 
            x2={node.left.x} y2={node.left.y} 
            className={`tree-edge ${highlightedNodes.has(node.left.id) ? 'highlighted' : ''}`}
          />
        )}
        {node.right && (
          <line 
            x1={node.x} y1={node.y} 
            x2={node.right.x} y2={node.right.y} 
            className={`tree-edge ${highlightedNodes.has(node.right.id) ? 'highlighted' : ''}`}
          />
        )}
        
        {/* Render children recursively */}
        {renderTree(node.left)}
        {renderTree(node.right)}
        
        {/* Draw the node itself on top */}
        <circle cx={node.x} cy={node.y} r="20" className={nodeClass} />
        <text x={node.x} y={node.y} className="tree-text" dy=".3em" textAnchor="middle">
          {node.value}
        </text>
      </g>
    );
  };

  return (
    <div className="container animate-fade-in btv-container">
      <SEO 
        title="Binary Search Tree - AlgoWorld" 
        description="Visualize Binary Search Tree insertions, deletions, searches, and traversals." 
        path="/tree" 
      />
      <div className="btv-header">
        <h1>Binary Search Tree</h1>
        <p className="subtitle">Visualize insertions, deletions, searches, and depth-first traversals on a BST.</p>
      </div>

      <div className="btv-layout">
        <div className="btv-sidebar">
          <Card className="controls-card">
            <h3>Operations</h3>
            
            <div className="input-group mb-4">
              <input 
                type="number" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                placeholder="Enter value..."
                disabled={isRunning}
                className="btv-input"
              />
              <div className="action-buttons mt-2">
                <Button variant="primary" onClick={handleInsert} disabled={isRunning} className="w-full mb-2 flex-center gap-2">
                  <Plus size={16} /> Insert
                </Button>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <Button variant="secondary" onClick={handleSearch} disabled={isRunning} className="w-full flex-center gap-2">
                    <Search size={16} /> Search
                  </Button>
                  <Button variant="danger" onClick={handleDelete} disabled={isRunning} className="w-full flex-center gap-2">
                    <Trash2 size={16} /> Delete
                  </Button>
                </div>
              </div>
            </div>

            <div className="divider"></div>

            <h3>Traversals</h3>
            <div className="action-buttons">
              <Button variant="secondary" onClick={() => handleTraversal('inorder')} disabled={isRunning} className="w-full mb-2">In-Order</Button>
              <Button variant="secondary" onClick={() => handleTraversal('preorder')} disabled={isRunning} className="w-full mb-2">Pre-Order</Button>
              <Button variant="secondary" onClick={() => handleTraversal('postorder')} disabled={isRunning} className="w-full">Post-Order</Button>
            </div>

            <div className="divider"></div>
            
            <Button variant="danger" onClick={() => setRoot(null)} disabled={isRunning} className="w-full flex-center gap-2">
              <Trash2 size={16} /> Clear Tree
            </Button>
            
            <div className="divider"></div>
            
            <Button variant="outline" onClick={() => setIsCodeModalOpen(true)} className="w-full flex-center gap-2">
              <Code size={16} /> View BST Code
            </Button>
            
          </Card>
        </div>
        
        <div className="btv-main">
          <Card className="tree-card">
            {traversalResult.length > 0 && (
              <div className="traversal-result animate-fade-in">
                <strong>Traversal:</strong> [{traversalResult.join(', ')}]
              </div>
            )}
            <div className="svg-container">
              <svg 
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} 
                preserveAspectRatio="xMidYMid meet"
                className="tree-svg"
              >
                {renderTree(root)}
              </svg>
              {!root && (
                <div className="empty-state">Tree is empty. Insert a node to begin.</div>
              )}
            </div>
          </Card>
        </div>
      </div>
      
      <CodeModal 
        isOpen={isCodeModalOpen} 
        onClose={() => setIsCodeModalOpen(false)} 
        code={fullBstCode} 
        title="Binary Search Tree" 
      />
    </div>
  );
};

export default BinaryTreeVisualizer;
