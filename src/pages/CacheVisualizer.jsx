import { useState, useEffect, useRef } from 'react';
import { Cpu, Code, Database, Clock, Zap } from 'lucide-react';
import SEO from '../components/SEO';
import Button from '../components/Button';
import Card from '../components/Card';
import CodeModal from '../components/CodeModal';
import { cacheSnippets } from '../utils/codeSnippets';
import './CacheVisualizer.css';
import '../components/EducationalGuide.css';

const TOTAL_BLOCKS = 16;
const BLOCK_SIZE = 4;
const CACHE_LINES = 4;

const CacheVisualizer = () => {
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  
  // State
  const [cache, setCache] = useState(Array(CACHE_LINES).fill({ blockId: null, lastUsed: 0 }));
  const [logs, setLogs] = useState([]);
  const [inputAddr, setInputAddr] = useState('');
  
  // Animation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAddress, setActiveAddress] = useState(null);
  const [activeBlock, setActiveBlock] = useState(null);
  const [activeCacheLine, setActiveCacheLine] = useState(null);
  const [statusType, setStatusType] = useState(null); // 'hit', 'miss', 'evict', 'load'
  
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const addLog = (msg, type) => {
    setLogs(prev => [...prev, { id: Date.now() + Math.random(), msg, type }]);
  };

  const processRead = async (addr) => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    const blockId = Math.floor(addr / BLOCK_SIZE);
    setActiveAddress(addr);
    setActiveBlock(blockId);
    
    // 1. Check Cache
    const hitIndex = cache.findIndex(line => line.blockId === blockId);
    
    if (hitIndex !== -1) {
      // CACHE HIT
      setActiveCacheLine(hitIndex);
      setStatusType('hit');
      addLog(`CPU requested Address ${addr} -> CACHE HIT! (Block ${blockId})`, 'hit');
      
      // Update LRU
      const newCache = [...cache];
      newCache[hitIndex] = { ...newCache[hitIndex], lastUsed: Date.now() };
      setCache(newCache);
      
      await sleep(1200);
    } else {
      // CACHE MISS
      setStatusType('miss');
      addLog(`CPU requested Address ${addr} -> CACHE MISS! (Block ${blockId} not found)`, 'miss');
      await sleep(1000);
      
      // 2. Find empty line or LRU
      let targetIndex = cache.findIndex(line => line.blockId === null);
      let isEvicting = false;
      
      if (targetIndex === -1) {
        // Find LRU
        isEvicting = true;
        let oldestTime = Infinity;
        for (let i = 0; i < CACHE_LINES; i++) {
          if (cache[i].lastUsed < oldestTime) {
            oldestTime = cache[i].lastUsed;
            targetIndex = i;
          }
        }
        
        setActiveCacheLine(targetIndex);
        setStatusType('evict');
        addLog(`Cache Full! Evicting LRU Block ${cache[targetIndex].blockId} from Line ${targetIndex}`, 'evict');
        await sleep(1200);
      }
      
      // 3. Load from Memory
      setActiveCacheLine(targetIndex);
      setStatusType('load');
      addLog(`Loading Block ${blockId} (Addresses ${blockId * 4}-${blockId * 4 + 3}) into Line ${targetIndex}...`, 'load');
      
      const newCache = [...cache];
      newCache[targetIndex] = { blockId, lastUsed: Date.now() };
      setCache(newCache);
      
      await sleep(1200);
      
      // Final hit to show it's available
      setStatusType('hit');
      await sleep(800);
    }
    
    // Reset visual state
    setActiveAddress(null);
    setActiveBlock(null);
    setActiveCacheLine(null);
    setStatusType(null);
    setIsProcessing(false);
  };

  const handleRequest = (e) => {
    e.preventDefault();
    const addr = parseInt(inputAddr, 10);
    if (!isNaN(addr) && addr >= 0 && addr < TOTAL_BLOCKS * BLOCK_SIZE) {
      processRead(addr);
      setInputAddr('');
    }
  };

  return (
    <div className="container animate-fade-in cache-page-container">
      <SEO 
        title="Memory & Caching - AlgoWorld" 
        description="Visualize CPU Cache, Main Memory, Spatial Locality, and LRU Eviction." 
        path="/caching" 
      />
      
      <div className="cache-header">
        <h1>Memory & Caching <Database size={36} className="inline-icon" /></h1>
        <p className="subtitle">Visualize L1 Cache Hits, Misses, and the LRU Eviction Policy.</p>
      </div>

      <div className="cache-layout">
        
        <div className="cache-sidebar">
          <Card className="controls-card">
            <h3>CPU Controller</h3>
            
            <form onSubmit={handleRequest} className="input-group mb-4 mt-4">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Read Memory Address (0-63):</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="number" 
                  min="0" max="63"
                  value={inputAddr} 
                  onChange={(e) => setInputAddr(e.target.value)} 
                  placeholder="e.g. 5"
                  className="float-input"
                  disabled={isProcessing}
                />
                <Button type="submit" variant="primary" disabled={isProcessing}>Read</Button>
              </div>
            </form>
            
            <div className="divider"></div>
            
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>System Log:</div>
            <div className="cache-log">
              {logs.length === 0 ? <div style={{opacity: 0.5}}>Awaiting requests...</div> : null}
              {logs.map(log => (
                <div key={log.id} className={`log-entry log-${log.type}`}>
                  {log.msg}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>

            <Button variant="outline" onClick={() => setIsCodeModalOpen(true)} className="w-full flex-center gap-2 mt-4">
              <Code size={16} /> How it Works
            </Button>
          </Card>
        </div>
        
        <div className="cache-main">
          
          {/* L1 CACHE */}
          <Card className="cache-panel">
            <h3 className="flex items-center gap-2 mb-4"><Zap size={20} color="#ffeb3b" /> L1 Cache (4 Lines)</h3>
            <div className="cache-lines-grid">
              {cache.map((line, idx) => {
                const isActive = activeCacheLine === idx;
                const isEmpty = line.blockId === null;
                const statusClass = isActive && statusType ? `status-${statusType}` : '';
                
                return (
                  <div key={`line-${idx}`} className={`cache-line ${isEmpty ? 'empty' : ''} ${statusClass}`}>
                    <div className="cache-line-meta">
                      <strong>Line {idx}</strong>
                      <span style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Clock size={10} /> {isEmpty ? 'Never' : 'Active'}
                      </span>
                    </div>
                    
                    <div className="cache-line-blocks">
                      {isEmpty ? (
                        <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem', fontStyle: 'italic', padding: '0.5rem' }}>
                          Empty
                        </div>
                      ) : (
                        Array.from({length: 4}).map((_, i) => {
                          const addr = line.blockId * 4 + i;
                          const isTarget = addr === activeAddress;
                          return (
                            <div key={`caddr-${addr}`} className={`cache-address-box ${isTarget && statusType === 'hit' ? 'status-hit' : ''}`}>
                              {addr}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* MAIN MEMORY */}
          <Card className="cache-panel">
            <h3 className="flex items-center gap-2 mb-4"><Database size={20} color="#00e5ff" /> Main Memory (RAM)</h3>
            <div className="memory-blocks-grid">
              {Array.from({length: TOTAL_BLOCKS}).map((_, blockId) => {
                const isActiveBlock = activeBlock === blockId;
                const statusClass = isActiveBlock && statusType === 'load' ? 'status-load' : isActiveBlock && statusType === 'miss' ? 'status-miss' : '';
                
                return (
                  <div 
                    key={`block-${blockId}`} 
                    className={`memory-block ${statusClass}`}
                    onClick={() => !isProcessing && processRead(blockId * 4)}
                    title="Click to fetch block"
                  >
                    <div className="memory-block-header">Block {blockId}</div>
                    <div className="memory-block-addresses">
                      {Array.from({length: 4}).map((_, i) => {
                        const addr = blockId * 4 + i;
                        const isTarget = addr === activeAddress;
                        return (
                          <div key={`maddr-${addr}`} className={`mem-addr ${isTarget && statusType === 'load' ? 'status-load' : isTarget && statusType === 'miss' ? 'status-miss' : ''}`}>
                            {addr}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

        </div>
      </div>

      {/* EDUCATIONAL GUIDE */}
      <div className="edu-guide-container">
        <div className="edu-guide-header">
          <h2>Memory & Caching</h2>
        </div>

        <div className="edu-section">
          <h3>The Memory Bottleneck</h3>
          <p>Modern CPUs can do billions of calculations a second, but RAM is physically far away on the motherboard and very slow. If the CPU had to wait for RAM every time it wanted data, it would spend 99% of its life waiting. <strong>Caches</strong> are tiny, incredibly fast memory chips built directly onto the CPU to hold data it thinks it will need soon.</p>
        </div>

        <div className="edu-section">
          <h3>Spatial Locality (The "Chunk" Rule)</h3>
          <p>When you ask for Address 5, the CPU doesn't just grab Address 5. It grabs the entire "Block" (e.g., Addresses 4, 5, 6, 7) and brings it all into the Cache. Why? Because if you just read a piece of data, there is a very high chance you are going to read the data right next to it in a millisecond (like looping through an array).</p>
        </div>

        <div className="edu-section">
          <h3>LRU Eviction (The Bouncer)</h3>
          <p>Because the Cache is so small (L1 cache is usually only a few Kilobytes), it gets full quickly. When a new Block of data needs to come in, someone has to get kicked out to make room. The most common rule is <strong>LRU (Least Recently Used)</strong>. The CPU tracks exactly when each cache line was last touched, and evicts the one that has been ignored the longest.</p>
        </div>
      </div>
      
      <CodeModal 
        isOpen={isCodeModalOpen} 
        onClose={() => setIsCodeModalOpen(false)} 
        code={cacheSnippets.LRU} 
        title="Caching Concepts" 
      />
    </div>
  );
};

export default CacheVisualizer;
