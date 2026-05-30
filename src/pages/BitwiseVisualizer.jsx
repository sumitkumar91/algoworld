import { useState, useEffect } from 'react';
import { Play, RotateCcw, Cpu, Code } from 'lucide-react';
import SEO from '../components/SEO';
import Button from '../components/Button';
import Card from '../components/Card';
import CodeModal from '../components/CodeModal';
import { bitwiseSnippets } from '../utils/codeSnippets';
import './BitwiseVisualizer.css';

const ANIMATION_SPEED = 400; // ms

const bitTricks = [
  { id: 'custom', name: 'Custom Input' },
  { id: 'evenOdd', name: 'Check Even/Odd (n & 1)' },
  { id: 'powerOf2', name: 'Check Power of 2 (n & (n-1))' },
  { id: 'clearLowest', name: 'Clear Lowest Set Bit (n & (n-1))' },
  { id: 'getLowest', name: 'Get Lowest Set Bit (n & -n)' },
];

const BitwiseVisualizer = () => {
  const [valA, setValA] = useState('12');
  const [valB, setValB] = useState('10');
  const [operation, setOperation] = useState('AND');
  const [trick, setTrick] = useState('custom');
  
  const [isRunning, setIsRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Select an operation and click Compute.');
  
  const [resultVal, setResultVal] = useState(null);
  const [partialResult, setPartialResult] = useState(null);
  const [activeBit, setActiveBit] = useState(-1); // which column is computing (index from left)
  
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  const numA = parseInt(valA) || 0;
  const numB = parseInt(valB) || 0;

  const requires16Bit = Math.abs(numA) > 255 || Math.abs(numB) > 255 || (operation === 'LSHIFT' && Math.abs(numA << numB) > 255);
  const bitWidth = requires16Bit ? 16 : 8;

  const toBinArray = (num) => {
    return (num >>> 0).toString(2).padStart(bitWidth, '0').slice(-bitWidth).split('');
  };

  const binA = toBinArray(numA);
  const binB = operation === 'NOT' ? Array(bitWidth).fill(' ') : toBinArray(numB);
  
  const getOpSymbol = () => {
    switch (operation) {
      case 'AND': return '&';
      case 'OR': return '|';
      case 'XOR': return '^';
      case 'NOT': return '~';
      case 'LSHIFT': return '<<';
      case 'RSHIFT': return '>>';
      case 'URSHIFT': return '>>>';
      default: return '?';
    }
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleTrickChange = (e) => {
    const t = e.target.value;
    setTrick(t);
    setResultVal(null);
    setPartialResult(null);
    setActiveBit(-1);
    
    if (t === 'evenOdd') {
      setValA('13'); setValB('1'); setOperation('AND');
    } else if (t === 'powerOf2' || t === 'clearLowest') {
      setValA('12'); setValB('11'); setOperation('AND');
    } else if (t === 'getLowest') {
      setValA('12'); setValB('-12'); setOperation('AND');
    }
  };

  const computeRealResult = () => {
    switch (operation) {
      case 'AND': return numA & numB;
      case 'OR': return numA | numB;
      case 'XOR': return numA ^ numB;
      case 'NOT': return ~numA;
      case 'LSHIFT': return numA << numB;
      case 'RSHIFT': return numA >> numB;
      case 'URSHIFT': return numA >>> numB;
      default: return 0;
    }
  };

  const handleCompute = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setResultVal(null);
    setPartialResult(null);
    setActiveBit(-1);
    
    const finalResult = computeRealResult();
    const isShift = operation === 'LSHIFT' || operation === 'RSHIFT' || operation === 'URSHIFT';
    
    if (isShift) {
      setStatusMessage(`Computing ${numA} ${getOpSymbol()} ${numB}...`);
      await sleep(ANIMATION_SPEED);
      setResultVal(finalResult);
      setStatusMessage(`Shift complete! Result: ${finalResult}`);
    } else {
      setPartialResult(Array(bitWidth).fill(''));
      // Animate column by column from right to left
      for (let i = bitWidth - 1; i >= 0; i--) {
        setActiveBit(i);
        setStatusMessage(`Computing bit position ${bitWidth - 1 - i}...`);
        
        const bitA = binA[i];
        const bitB = binB[i];
        let resBit = '0';
        if (operation === 'AND') resBit = (bitA === '1' && bitB === '1') ? '1' : '0';
        else if (operation === 'OR') resBit = (bitA === '1' || bitB === '1') ? '1' : '0';
        else if (operation === 'XOR') resBit = (bitA !== bitB) ? '1' : '0';
        else if (operation === 'NOT') resBit = (bitA === '1') ? '0' : '1';

        setPartialResult(prev => {
          const next = [...prev];
          next[i] = resBit;
          return next;
        });

        await sleep(ANIMATION_SPEED);
      }
      setActiveBit(-1);
      setResultVal(finalResult);
      setStatusMessage(`Operation complete! Result: ${finalResult}`);
    }
    
    setIsRunning(false);
  };

  const openCode = (type) => {
    if (trick === 'custom') {
      setCurrentCode(bitwiseSnippets.basics);
      setModalTitle('Bitwise Basics');
    } else {
      setCurrentCode(bitwiseSnippets[trick]);
      setModalTitle(`Bit Trick: ${bitTricks.find(t => t.id === trick).name}`);
    }
    setIsCodeModalOpen(true);
  };

  const binResult = partialResult !== null ? partialResult : (resultVal !== null ? toBinArray(resultVal) : Array(bitWidth).fill(''));

  const renderBitRow = (label, binArray, decValue, isOperandB = false) => {
    return (
      <div className="bitwise-row">
        <div className="bitwise-operand-label">{label}</div>
        <div className="bitwise-bits-container">
          {binArray.map((bit, i) => {
            let stateClass = '';
            if (activeBit === i) stateClass = 'state-computing';
            if (label === '=' && bit !== '') stateClass = 'state-result';
            
            // For shifts, B doesn't really have a per-bit meaning lined up with A, 
            // but we'll show it anyway. The NOT operation has empty B.
            if (bit === ' ') return <div key={i} className="bitwise-bit" style={{ border: 'none', background: 'transparent' }}></div>;
            
            return (
              <div key={i} className={`bitwise-bit ${bit === '1' ? 'is-one' : 'is-zero'} ${stateClass}`}>
                {bit}
              </div>
            );
          })}
        </div>
        <div className={`bitwise-decimal-value ${label === '=' ? 'result' : ''}`}>
          {decValue !== null ? `(${decValue})` : ''}
        </div>
      </div>
    );
  };

  return (
    <div className="container animate-fade-in bitwise-page-container">
      <SEO 
        title="Bit Manipulation - AlgoWorld" 
        description="Visualize bitwise operations and famous bit manipulation tricks." 
        path="/bitwise" 
      />
      <div className="bitwise-header">
        <h1>Bit Manipulation <Cpu size={36} className="inline-icon" /></h1>
        <p className="subtitle">Visualize AND, OR, XOR, Shifts, and famous bit hacks.</p>
      </div>

      <div className="bitwise-layout">
        <div className="bitwise-sidebar">
          <Card className="controls-card">
            <h3>Configuration</h3>
            
            <div className="input-group mb-4">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Bit Tricks Presets:</div>
              <select 
                value={trick} 
                onChange={handleTrickChange}
                disabled={isRunning}
                className="bitwise-input mb-4"
              >
                {bitTricks.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Operation:</div>
              <select 
                value={operation} 
                onChange={(e) => { setOperation(e.target.value); setResultVal(null); setPartialResult(null); setActiveBit(-1); }}
                disabled={isRunning}
                className="bitwise-input mb-4"
              >
                <option value="AND">AND (&)</option>
                <option value="OR">OR (|)</option>
                <option value="XOR">XOR (^)</option>
                <option value="NOT">NOT (~)</option>
                <option value="LSHIFT">Left Shift (&lt;&lt;)</option>
                <option value="RSHIFT">Right Shift (&gt;&gt;)</option>
                <option value="URSHIFT">Unsigned R-Shift (&gt;&gt;&gt;)</option>
              </select>
            </div>
            
            <div className="divider"></div>

            <h3>Operands</h3>
            <div className="input-group mb-4">
              <input 
                type="number" 
                value={valA} 
                onChange={(e) => { setValA(e.target.value); setResultVal(null); setPartialResult(null); setActiveBit(-1); }} 
                placeholder="Operand A..."
                disabled={isRunning}
                className="bitwise-input mb-2"
              />
              <input 
                type="number" 
                value={valB} 
                onChange={(e) => { setValB(e.target.value); setResultVal(null); setPartialResult(null); setActiveBit(-1); }} 
                placeholder="Operand B..."
                disabled={isRunning || operation === 'NOT'}
                style={{ opacity: operation === 'NOT' ? 0.5 : 1 }}
                className="bitwise-input mb-4"
              />
              <Button variant="primary" onClick={handleCompute} disabled={isRunning} className="w-full mb-2 flex-center gap-2">
                <Play size={16} /> Compute
              </Button>
              <Button variant="outline" onClick={() => { setResultVal(null); setPartialResult(null); setActiveBit(-1); }} disabled={isRunning} className="w-full flex-center gap-2">
                <RotateCcw size={16} /> Reset
              </Button>
            </div>

            <div className="divider"></div>
            
            <Button variant="outline" onClick={openCode} className="w-full flex-center gap-2">
              <Code size={16} /> View Explanation
            </Button>
          </Card>
        </div>
        
        <div className="bitwise-main">
          <Card className="bitwise-card">
            <div className="bitwise-status-bar">
              {statusMessage}
            </div>
            
            <div className="bitwise-grid-container">
              {renderBitRow('A', binA, numA)}
              
              <div className="bitwise-row" style={{ margin: '0.5rem 0' }}>
                <div className="bitwise-operand-label" style={{ color: '#00e5ff' }}>{getOpSymbol()}</div>
                <div className="bitwise-bits-container" style={{ visibility: 'hidden' }}>
                  {binA.map((_, i) => <div key={i} className="bitwise-bit"></div>)}
                </div>
                <div className="bitwise-decimal-value"></div>
              </div>
              
              {operation !== 'NOT' && renderBitRow('B', binB, numB, true)}
              
              <div className="bitwise-divider"></div>
              
              {renderBitRow('=', binResult, resultVal)}
            </div>
            
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
              Showing {bitWidth}-bit representation {requires16Bit ? '(expanded)' : ''}
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

export default BitwiseVisualizer;
