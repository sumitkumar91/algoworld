import { useState, useEffect } from 'react';
import { Hash, Code, Plus, Search, Trash2, RotateCcw, Settings } from 'lucide-react';
import SEO from '../components/SEO';
import Button from '../components/Button';
import Card from '../components/Card';
import CodeModal from '../components/CodeModal';
import { hashtableSnippets } from '../utils/codeSnippets';
import './HashTableVisualizer.css';

const SVG_WIDTH = 900;
const DEFAULT_CAPACITY = 8;
const ANIMATION_SPEED = 600; // ms

// Layout constants
const BUCKET_WIDTH = 60;
const BUCKET_HEIGHT = 60;
const NODE_WIDTH = 100;
const NODE_HEIGHT = 50;
const VERTICAL_SPACING = 70;
const HORIZONTAL_SPACING = 140;

const HashMapVisualizer = () => {
  const [capacity, setCapacity] = useState(DEFAULT_CAPACITY);
  const [hashFunction, setHashFunction] = useState('sum');
  const [customHashFunction, setCustomHashFunction] = useState('x * 31');
  const [capacityInput, setCapacityInput] = useState(DEFAULT_CAPACITY);
  const [collisionStrategy, setCollisionStrategy] = useState('chaining'); // chaining, linear, quadratic
  
  const [buckets, setBuckets] = useState(Array.from({ length: DEFAULT_CAPACITY }, () => []));
  const [bucketStatuses, setBucketStatuses] = useState(Array(DEFAULT_CAPACITY).fill('normal'));
  
  const [inputKey, setInputKey] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  
  const [statusMessage, setStatusMessage] = useState('Enter a key and value to insert into the Hash Map!');
  const [hashMessage, setHashMessage] = useState('Hash Computation: Waiting for input...');
  
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [currentCode, setCurrentCode] = useState(hashtableSnippets.chaining.put);
  const [modalTitle, setModalTitle] = useState('Hash Table (Chaining): Put');

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const resetVisuals = () => {
    setBucketStatuses(Array(capacity).fill('normal'));
    setBuckets(prev => prev.map(chain => chain.map(node => ({ ...node, status: node.isTombstone ? 'tombstone' : 'normal' }))));
  };
  
  const handleResetMap = (newCap = capacity) => {
    if (isRunning) return;
    setCapacity(newCap);
    setBuckets(Array.from({ length: newCap }, () => []));
    setBucketStatuses(Array(newCap).fill('normal'));
    setStatusMessage(`Hash Map reset with capacity ${newCap}.`);
    setHashMessage('Hash Computation: Waiting for input...');
  };

  const animateHashComputation = async (key) => {
    let resultVal = 0;
    
    if (hashFunction === 'sum') {
      let sum = 0;
      for (let i = 0; i < key.length; i++) {
        sum += key.charCodeAt(i);
        setHashMessage(`Hash("${key}"): sum = ${sum}`);
        await sleep(200);
      }
      resultVal = sum;
    } else if (hashFunction === 'int') {
      resultVal = parseInt(key) || 0;
      setHashMessage(`Hash("${key}"): parsed integer = ${resultVal}`);
      await sleep(400);
    } else if (hashFunction === 'firstChar') {
      resultVal = key.charCodeAt(0) || 0;
      setHashMessage(`Hash("${key}"): first char code = ${resultVal}`);
      await sleep(400);
    } else if (hashFunction === 'length') {
      resultVal = key.length;
      setHashMessage(`Hash("${key}"): length = ${resultVal}`);
      await sleep(400);
    } else if (hashFunction === 'custom') {
      try {
        const func = new Function('k', 'x', 'return ' + customHashFunction);
        resultVal = Math.abs(Math.floor(func(key, parseInt(key) || 0))) || 0;
        setHashMessage(`Hash("${key}"): evaluated custom expression = ${resultVal}`);
      } catch (e) {
        resultVal = 0;
        setHashMessage(`Hash("${key}"): custom expression error! Result = 0`);
      }
      await sleep(400);
    }
    
    const idx = resultVal % capacity;
    setHashMessage(
      <span>
        Hash("<span className="highlight">{key}</span>") = {resultVal} % {capacity} = <span className="highlight">{idx}</span>
      </span>
    );
    await sleep(ANIMATION_SPEED);
    return idx;
  };

  const handlePutChaining = async (idx) => {
    let found = false;
    for (let i = 0; i < buckets[idx].length; i++) {
      setBuckets(prev => {
        const next = [...prev];
        next[idx] = [...prev[idx]]; next[idx][i] = { ...prev[idx][i], status: 'scanning' };
        return next;
      });
      await sleep(ANIMATION_SPEED);
      
      if (buckets[idx][i].key === inputKey) {
        setBuckets(prev => {
          const next = [...prev];
          next[idx] = [...prev[idx]]; next[idx][i] = { ...prev[idx][i], value: inputValue, status: 'found' };
          return next;
        });
        setStatusMessage(`Key "${inputKey}" found! Value updated.`);
        found = true;
        break;
      } else {
        setBuckets(prev => {
          const next = [...prev];
          next[idx] = [...prev[idx]]; next[idx][i] = { ...prev[idx][i], status: 'normal' };
          return next;
        });
      }
    }

    if (!found) {
      setBuckets(prev => {
        const next = [...prev];
        next[idx] = [...prev[idx], { id: Math.random().toString(), key: inputKey, value: inputValue, status: 'found', isTombstone: false }];
        return next;
      });
      setStatusMessage(`Inserted "${inputKey}" into bucket ${idx}.`);
    }
  };

  const handlePutOpenAddressing = async (baseIdx) => {
    let step = 0;
    let targetIdx = -1;
    let found = false;

    while (step < capacity) {
      const probeOffset = collisionStrategy === 'linear' ? step : step * step;
      const probeIdx = (baseIdx + probeOffset) % capacity;
      
      setBucketStatuses(prev => { const next = [...prev]; next[probeIdx] = 'scanning'; return next; });
      setStatusMessage(`Probing index ${probeIdx} (step ${step})...`);
      await sleep(ANIMATION_SPEED);
      
      const bucketList = buckets[probeIdx];
      if (bucketList.length === 0 || bucketList[0].isTombstone) {
        if (targetIdx === -1) targetIdx = probeIdx; 
        if (bucketList.length === 0) break;
      } else if (bucketList[0].key === inputKey) {
        targetIdx = probeIdx;
        found = true;
        break;
      }
      
      setBucketStatuses(prev => { const next = [...prev]; next[probeIdx] = 'normal'; return next; });
      step++;
    }

    if (targetIdx !== -1) {
      setBuckets(prev => {
        const next = [...prev];
        next[targetIdx] = [{ id: Math.random().toString(), key: inputKey, value: inputValue, status: 'found', isTombstone: false }];
        return next;
      });
      setBucketStatuses(prev => { const next = [...prev]; next[targetIdx] = 'found'; return next; });
      setStatusMessage(found ? `Key "${inputKey}" found! Value updated.` : `Inserted "${inputKey}" into bucket ${targetIdx}.`);
    } else {
      setStatusMessage(`Hash Map is full! Could not insert "${inputKey}".`);
    }
  };

  const handlePut = async () => {
    if (isRunning || !inputKey) return;
    setIsRunning(true);
    resetVisuals();
    setStatusMessage(`Putting key "${inputKey}"...`);

    const idx = await animateHashComputation(inputKey);
    
    if (collisionStrategy === 'chaining') {
      setBucketStatuses(prev => { const next = [...prev]; next[idx] = 'scanning'; return next; });
      await sleep(ANIMATION_SPEED);
      await handlePutChaining(idx);
    } else {
      await handlePutOpenAddressing(idx);
    }

    setIsRunning(false);
  };

  const handleGetChaining = async (idx) => {
    let found = false;
    for (let i = 0; i < buckets[idx].length; i++) {
      setBuckets(prev => {
        const next = [...prev];
        next[idx] = [...prev[idx]]; next[idx][i] = { ...prev[idx][i], status: 'scanning' };
        return next;
      });
      await sleep(ANIMATION_SPEED);
      
      if (buckets[idx][i].key === inputKey) {
        setBuckets(prev => {
          const next = [...prev];
          next[idx] = [...prev[idx]]; next[idx][i] = { ...prev[idx][i], status: 'found' };
          return next;
        });
        setStatusMessage(`Found "${inputKey}" with value "${buckets[idx][i].value}".`);
        found = true;
        break;
      } else {
        setBuckets(prev => {
          const next = [...prev];
          next[idx] = [...prev[idx]]; next[idx][i] = { ...prev[idx][i], status: 'normal' };
          return next;
        });
      }
    }

    if (!found) setStatusMessage(`Key "${inputKey}" not found.`);
  };

  const handleGetOpenAddressing = async (baseIdx) => {
    let step = 0;
    while (step < capacity) {
      const probeOffset = collisionStrategy === 'linear' ? step : step * step;
      const probeIdx = (baseIdx + probeOffset) % capacity;
      
      setBucketStatuses(prev => { const next = [...prev]; next[probeIdx] = 'scanning'; return next; });
      await sleep(ANIMATION_SPEED);
      
      const bucketList = buckets[probeIdx];
      if (bucketList.length === 0) {
        setStatusMessage(`Hit empty bucket ${probeIdx}. Key "${inputKey}" not found.`);
        setBucketStatuses(prev => { const next = [...prev]; next[probeIdx] = 'normal'; return next; });
        return;
      } else if (!bucketList[0].isTombstone && bucketList[0].key === inputKey) {
        setStatusMessage(`Found "${inputKey}" with value "${bucketList[0].value}".`);
        setBuckets(prev => {
          const next = [...prev];
          next[probeIdx] = [{ ...next[probeIdx][0], status: 'found' }];
          return next;
        });
        setBucketStatuses(prev => { const next = [...prev]; next[probeIdx] = 'found'; return next; });
        return;
      }
      
      setBucketStatuses(prev => { const next = [...prev]; next[probeIdx] = 'normal'; return next; });
      step++;
    }
    setStatusMessage(`Probed ${capacity} times. Key "${inputKey}" not found.`);
  };

  const handleGet = async () => {
    if (isRunning || !inputKey) return;
    setIsRunning(true);
    resetVisuals();
    setStatusMessage(`Getting key "${inputKey}"...`);

    const idx = await animateHashComputation(inputKey);
    
    if (collisionStrategy === 'chaining') {
      setBucketStatuses(prev => { const next = [...prev]; next[idx] = 'scanning'; return next; });
      await sleep(ANIMATION_SPEED);
      await handleGetChaining(idx);
    } else {
      await handleGetOpenAddressing(idx);
    }

    setIsRunning(false);
  };

  const handleRemoveChaining = async (idx) => {
    let found = false;
    for (let i = 0; i < buckets[idx].length; i++) {
      setBuckets(prev => {
        const next = [...prev];
        next[idx] = [...prev[idx]]; next[idx][i] = { ...prev[idx][i], status: 'scanning' };
        return next;
      });
      await sleep(ANIMATION_SPEED);
      
      if (buckets[idx][i].key === inputKey) {
        setBuckets(prev => {
          const next = [...prev];
          next[idx] = [...prev[idx]]; next[idx][i] = { ...prev[idx][i], status: 'removing' };
          return next;
        });
        setStatusMessage(`Removing key "${inputKey}"...`);
        await sleep(ANIMATION_SPEED);
        
        setBuckets(prev => {
          const next = [...prev];
          next[idx] = [...prev[idx]]; next[idx].splice(i, 1);
          return next;
        });
        setStatusMessage(`Key "${inputKey}" successfully removed.`);
        found = true;
        break;
      } else {
        setBuckets(prev => {
          const next = [...prev];
          next[idx] = [...prev[idx]]; next[idx][i] = { ...prev[idx][i], status: 'normal' };
          return next;
        });
      }
    }

    if (!found) setStatusMessage(`Key "${inputKey}" not found.`);
  };

  const handleRemoveOpenAddressing = async (baseIdx) => {
    let step = 0;
    while (step < capacity) {
      const probeOffset = collisionStrategy === 'linear' ? step : step * step;
      const probeIdx = (baseIdx + probeOffset) % capacity;
      
      setBucketStatuses(prev => { const next = [...prev]; next[probeIdx] = 'scanning'; return next; });
      await sleep(ANIMATION_SPEED);
      
      const bucketList = buckets[probeIdx];
      if (bucketList.length === 0) {
        setStatusMessage(`Hit empty bucket ${probeIdx}. Key "${inputKey}" not found.`);
        setBucketStatuses(prev => { const next = [...prev]; next[probeIdx] = 'normal'; return next; });
        return;
      } else if (!bucketList[0].isTombstone && bucketList[0].key === inputKey) {
        setStatusMessage(`Found "${inputKey}". Marking as Tombstone...`);
        setBuckets(prev => {
          const next = [...prev];
          next[probeIdx] = [{ ...next[probeIdx][0], status: 'tombstone', isTombstone: true, key: 'DEL', value: '' }];
          return next;
        });
        setBucketStatuses(prev => { const next = [...prev]; next[probeIdx] = 'normal'; return next; });
        return;
      }
      
      setBucketStatuses(prev => { const next = [...prev]; next[probeIdx] = 'normal'; return next; });
      step++;
    }
    setStatusMessage(`Probed ${capacity} times. Key "${inputKey}" not found.`);
  };

  const handleRemove = async () => {
    if (isRunning || !inputKey) return;
    setIsRunning(true);
    resetVisuals();
    setStatusMessage(`Removing key "${inputKey}"...`);

    const idx = await animateHashComputation(inputKey);
    
    if (collisionStrategy === 'chaining') {
      setBucketStatuses(prev => { const next = [...prev]; next[idx] = 'scanning'; return next; });
      await sleep(ANIMATION_SPEED);
      await handleRemoveChaining(idx);
    } else {
      await handleRemoveOpenAddressing(idx);
    }

    setIsRunning(false);
  };

  const openCode = (type) => {
    const snippets = hashtableSnippets[collisionStrategy];
    const strategyLabel = collisionStrategy === 'chaining' ? 'Chaining'
      : collisionStrategy === 'linear' ? 'Linear Probing'
      : 'Quadratic Probing';
    setCurrentCode(snippets[type]);
    setModalTitle(`Hash Table (${strategyLabel}): ${type.charAt(0).toUpperCase() + type.slice(1)}`);
    setIsCodeModalOpen(true);
  };

  const startX = 100;
  const startY = 50;
  const svgHeight = Math.max(600, capacity * VERTICAL_SPACING + 100);

  return (
    <div className="container animate-fade-in hm-page-container">
      <SEO 
        title="Hash Table Visualizer - AlgoWorld" 
        description="Visualize Hash Tables with Separate Chaining and Open Addressing." 
        path="/hashmap" 
      />
      <div className="hm-header">
        <h1>Hash Table <Hash size={36} className="inline-icon" /></h1>
        <p className="subtitle">Understand Hash Functions, Buckets, and Collision Handling.</p>
      </div>

      <div className="hm-layout">
        <div className="hm-sidebar">
          <Card className="controls-card">
            <h3>Settings</h3>
            
            <div className="input-group mb-4">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Collision Strategy:</div>
              <select 
                value={collisionStrategy} 
                onChange={(e) => {
                  setCollisionStrategy(e.target.value);
                  handleResetMap(capacity);
                }}
                disabled={isRunning}
                className="hm-input mb-4"
              >
                <option value="chaining">Separate Chaining</option>
                <option value="linear">Linear Probing</option>
                <option value="quadratic">Quadratic Probing</option>
              </select>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Capacity:</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input 
                  type="number" 
                  value={capacityInput} 
                  onChange={(e) => setCapacityInput(e.target.value)}
                  min="1" max="32"
                  disabled={isRunning}
                  className="hm-input"
                  style={{ flex: 1 }}
                />
                <Button variant="outline" onClick={() => handleResetMap(Math.min(32, Math.max(1, parseInt(capacityInput) || DEFAULT_CAPACITY)))} disabled={isRunning} style={{ padding: '0 1rem' }}>
                  Set Cap
                </Button>
              </div>
              
              <select 
                value={hashFunction} 
                onChange={(e) => setHashFunction(e.target.value)}
                disabled={isRunning}
                className="hm-input mb-2"
              >
                <option value="sum">Hash: Sum of ASCII</option>
                <option value="int">Hash: Integer Value</option>
                <option value="firstChar">Hash: First Char ASCII</option>
                <option value="length">Hash: String Length</option>
                <option value="custom">Hash: Custom JS Expression</option>
              </select>
              
              {hashFunction === 'custom' && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Expression using 'k' (string) or 'x' (integer):</div>
                  <input 
                    type="text" 
                    value={customHashFunction} 
                    onChange={(e) => setCustomHashFunction(e.target.value)}
                    placeholder="e.g. x * 31"
                    disabled={isRunning}
                    className="hm-input"
                  />
                </div>
              )}
              
              <Button variant="outline" onClick={() => handleResetMap(capacity)} disabled={isRunning} className="w-full flex-center gap-2 mt-4">
                <RotateCcw size={16} /> Clear Map
              </Button>
            </div>
            
            <div className="divider"></div>

            <h3>Operations</h3>
            <div className="input-group mb-4">
              <input 
                type="text" 
                value={inputKey} 
                onChange={(e) => setInputKey(e.target.value)} 
                placeholder="Key (e.g. 'apple')..."
                disabled={isRunning}
                className="hm-input mb-2"
              />
              <input 
                type="text" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                placeholder="Value (optional)..."
                disabled={isRunning}
                className="hm-input mb-4"
              />
              <Button variant="primary" onClick={handlePut} disabled={isRunning} className="w-full mb-2 flex-center gap-2">
                <Plus size={16} /> Put (Key, Value)
              </Button>
              <Button variant="secondary" onClick={handleGet} disabled={isRunning} className="w-full mb-2 flex-center gap-2">
                <Search size={16} /> Get (Key)
              </Button>
              <Button variant="danger" onClick={handleRemove} disabled={isRunning} className="w-full mb-2 flex-center gap-2">
                <Trash2 size={16} /> Remove (Key)
              </Button>
            </div>

            <div className="divider"></div>
            
            <h3>Code Snippets</h3>
            <div className="input-group">
              <Button variant="outline" onClick={() => openCode('put')} className="w-full mb-2 flex-center gap-2">
                <Code size={16} /> Put Code
              </Button>
              <Button variant="outline" onClick={() => openCode('get')} className="w-full mb-2 flex-center gap-2">
                <Code size={16} /> Get Code
              </Button>
              <Button variant="outline" onClick={() => openCode('remove')} className="w-full flex-center gap-2">
                <Code size={16} /> Remove Code
              </Button>
            </div>
          </Card>
        </div>
        
        <div className="hm-main">
          <Card className="hm-card">
            <div className="hm-hash-banner">
              {hashMessage}
            </div>
            <div className="status-bar">
              {statusMessage}
            </div>
            <div className="hm-svg-container">
              <svg 
                viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`} 
                preserveAspectRatio="xMidYMid meet"
                className="hm-svg"
              >
                <defs>
                  <marker id="hm-arrowhead" markerWidth="10" markerHeight="7" 
                  refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="var(--border-glass)" />
                  </marker>
                </defs>

                {/* Render Buckets */}
                {Array.from({ length: capacity }).map((_, i) => {
                  const x = startX;
                  const y = startY + i * VERTICAL_SPACING;
                  const groupClass = `hm-group ${bucketStatuses[i]}`;
                  return (
                    <g key={`bucket-${i}`} className={groupClass}>
                      <rect 
                        x={x} y={y} 
                        width={BUCKET_WIDTH} height={BUCKET_HEIGHT} 
                        className="hm-bucket-rect" 
                        rx="4" ry="4"
                      />
                      <text x={x + BUCKET_WIDTH/2} y={y + BUCKET_HEIGHT/2} className="hm-bucket-idx" dy=".3em" textAnchor="middle">
                        [{i}]
                      </text>
                      
                      {/* Separate Chaining: line to first node */}
                      {collisionStrategy === 'chaining' && buckets[i] && buckets[i].length > 0 && (
                        <line 
                          x1={x + BUCKET_WIDTH} y1={y + BUCKET_HEIGHT/2} 
                          x2={x + BUCKET_WIDTH + HORIZONTAL_SPACING - NODE_WIDTH} y2={y + BUCKET_HEIGHT/2} 
                          className="hm-link-line" 
                        />
                      )}
                    </g>
                  );
                })}

                {/* Render Nodes */}
                {buckets.map((chain, bIdx) => {
                  if (!chain) return null;
                  return chain.map((node, nIdx) => {
                    // For open addressing, we just render the node slightly offset to the right of the bucket (like nIdx=0 in chaining)
                    // and we don't draw any linking lines between nodes since there's only max 1 node per bucket.
                    const isChaining = collisionStrategy === 'chaining';
                    const xOffset = isChaining ? (HORIZONTAL_SPACING + nIdx * (NODE_WIDTH + 60)) : (BUCKET_WIDTH + 20 + NODE_WIDTH);
                    const x = startX + xOffset - NODE_WIDTH;
                    const y = startY + bIdx * VERTICAL_SPACING + (BUCKET_HEIGHT - NODE_HEIGHT)/2;
                    const groupClass = `hm-group ${node.status}`;
                    
                    return (
                      <g key={node.id} className={groupClass}>
                        <rect 
                          x={x} y={y} 
                          width={NODE_WIDTH} height={NODE_HEIGHT} 
                          className="hm-node-rect" 
                          rx="4" ry="4"
                        />
                        <text x={x + NODE_WIDTH/2} y={y + NODE_HEIGHT/2 - 5} className="hm-node-key" textAnchor="middle">{node.key}</text>
                        {node.value && !node.isTombstone && (
                          <text x={x + NODE_WIDTH/2} y={y + NODE_HEIGHT/2 + 15} className="hm-node-val" textAnchor="middle">{node.value}</text>
                        )}
                        
                        {/* Line to next node only for Separate Chaining */}
                        {isChaining && nIdx < chain.length - 1 && (
                          <line 
                            x1={x + NODE_WIDTH} y1={y + NODE_HEIGHT/2} 
                            x2={x + NODE_WIDTH + 60} y2={y + NODE_HEIGHT/2} 
                            className="hm-link-line" 
                          />
                        )}
                      </g>
                    );
                  });
                })}
              </svg>
            </div>
          </Card>
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

export default HashMapVisualizer;