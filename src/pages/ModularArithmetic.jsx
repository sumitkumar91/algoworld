import { useState } from 'react';
import { Hash, Play, BookOpen } from 'lucide-react';
import SEO from '../components/SEO';
import Button from '../components/Button';
import './ModularArithmetic.css';

const ModularArithmetic = () => {
  // Global Visualizer State
  const [N, setN] = useState(12);
  const [op, setOp] = useState('+'); // 'rem', '+', '*', 'neg'
  const [A, setA] = useState(7);
  const [B, setB] = useState(8);
  const [activeSec, setActiveSec] = useState(2); // Tracks which section is driving the visual

  // Helper to handle negative mod correctly in JS
  const mod = (n, m) => ((n % m) + m) % m;

  // Generate Nodes for SVG
  const cx = 200;
  const cy = 200;
  const r = 140;
  const nodes = [];
  for (let i = 0; i < N; i++) {
    const theta = (i / N) * 2 * Math.PI - Math.PI / 2;
    nodes.push({
      id: i,
      x: cx + r * Math.cos(theta),
      y: cy + r * Math.sin(theta)
    });
  }

  // Determine active nodes and paths based on operation
  let startNode = null;
  let endNode = null;
  let pathNodes = []; // Indices of nodes hit along the way
  let resultStr = '';

  if (op === 'rem') {
    startNode = A; // The number being divided
    endNode = mod(A, N);
    resultStr = `${A} ≡ ${endNode} (mod ${N})`;
  } else if (op === '+') {
    startNode = mod(A, N);
    endNode = mod(A + B, N);
    resultStr = `${A} + ${B} ≡ ${endNode} (mod ${N})`;
    // Path just connects start to end for simplicity
    pathNodes = [startNode, endNode];
  } else if (op === '*') {
    startNode = 0;
    endNode = mod(A * B, N);
    resultStr = `${A} × ${B} ≡ ${endNode} (mod ${N})`;
    // For multiplication, trace the jumps! 
    // e.g. 3 * 4: 0 -> 3 -> 6 -> 9 -> 12(0)
    for (let i = 0; i <= B; i++) {
      pathNodes.push(mod(i * A, N));
    }
  } else if (op === 'neg') {
    startNode = 0;
    endNode = mod(-A, N);
    resultStr = `-${A} ≡ ${endNode} (mod ${N})`;
    pathNodes = [0, endNode];
  }

  // Generate SVG Path String from pathNodes
  let pathD = '';
  if (pathNodes.length > 1) {
    const first = nodes[pathNodes[0]];
    pathD = `M ${first.x} ${first.y}`;
    for (let i = 1; i < pathNodes.length; i++) {
      const next = nodes[pathNodes[i]];
      pathD += ` L ${next.x} ${next.y}`;
    }
  }

  // Input Handlers that also set the active section
  const handleRem = (newA, newN) => { setOp('rem'); setA(newA); setN(newN); setActiveSec(1); };
  const handleAdd = (newA, newB, newN) => { setOp('+'); setA(newA); setB(newB); setN(newN); setActiveSec(2); };
  const handleMul = (newA, newB, newN) => { setOp('*'); setA(newA); setB(newB); setN(newN); setActiveSec(3); };
  const handleNeg = (newA, newN) => { setOp('neg'); setA(newA); setN(newN); setActiveSec(4); };

  return (
    <div className="container animate-fade-in modular-page-container">
      <SEO 
        title="Modular Arithmetic - AlgoWorld" 
        description="Learn Modular Arithmetic through an interactive Clock Math visualizer." 
        path="/modular" 
      />
      
      <div className="modular-header">
        <h1>Modular Arithmetic <Hash size={36} className="inline-icon" /></h1>
        <p className="subtitle">An interactive lesson on Clock Math and the foundation of Cryptography.</p>
      </div>

      <div className="modular-layout">
        
        {/* LEFT PANEL: INTERACTIVE LESSON */}
        <div className="lesson-panel">
          
          {/* SEC 1: The Remainder */}
          <section className={`lesson-section ${activeSec === 1 ? 'active' : ''}`} onClick={() => handleRem(15, 12)}>
            <h2 className="lesson-title"><BookOpen size={20}/> 1. What is Modulo?</h2>
            <div className="lesson-text">
              <p>In programming, the modulo operator (usually <strong>%</strong>) calculates the <strong>remainder</strong> of a division.</p>
              <p>If you have 15 hours and a 12-hour clock, you divide 15 by 12. The quotient is 1 (it goes around once), and the remainder is <strong>3</strong>.</p>
            </div>
            <div className="lesson-interactive" onClick={e => e.stopPropagation()}>
              <span>Calculate: </span>
              <input type="number" className="inline-input" value={activeSec === 1 ? A : 15} onChange={e => handleRem(parseInt(e.target.value)||0, N)} />
              <span> mod </span>
              <input type="number" className="inline-input mod-input" value={activeSec === 1 ? N : 12} onChange={e => handleRem(A, Math.max(2, parseInt(e.target.value)||2))} />
              <Button variant="secondary" className="ml-auto px-2 py-1" onClick={() => handleRem(A, N)}><Play size={14}/></Button>
            </div>
          </section>

          {/* SEC 2: Addition */}
          <section className={`lesson-section ${activeSec === 2 ? 'active' : ''}`} onClick={() => handleAdd(8, 7, 12)}>
            <h2 className="lesson-title"><BookOpen size={20}/> 2. Clock Math (Addition)</h2>
            <div className="lesson-text">
              <p>Modular arithmetic is often called <strong>Clock Math</strong> because numbers wrap around a circle instead of going on infinitely.</p>
              <p>If it is <strong>8 O'Clock</strong>, and you add <strong>7 hours</strong>, you don't say it's "15 O'Clock". You wrap past 12 and land on <strong>3 O'Clock</strong>.</p>
            </div>
            <div className="lesson-interactive" onClick={e => e.stopPropagation()}>
              <input type="number" className="inline-input" value={activeSec === 2 ? A : 8} onChange={e => handleAdd(parseInt(e.target.value)||0, B, N)} />
              <span> + </span>
              <input type="number" className="inline-input" value={activeSec === 2 ? B : 7} onChange={e => handleAdd(A, parseInt(e.target.value)||0, N)} />
              <span> mod </span>
              <input type="number" className="inline-input mod-input" value={activeSec === 2 ? N : 12} onChange={e => handleAdd(A, B, Math.max(2, parseInt(e.target.value)||2))} />
            </div>
          </section>

          {/* SEC 3: Multiplication */}
          <section className={`lesson-section ${activeSec === 3 ? 'active' : ''}`} onClick={() => handleMul(3, 4, 10)}>
            <h2 className="lesson-title"><BookOpen size={20}/> 3. Multiplication & Patterns</h2>
            <div className="lesson-text">
              <p>Multiplication is just repeated addition. In modular math, repeatedly jumping around a circle creates beautiful geometric patterns.</p>
              <p>Try jumping by <strong>3</strong> steps, <strong>4</strong> times, on a clock of size <strong>10</strong>. Notice the star shape it creates as it bounces around!</p>
            </div>
            <div className="lesson-interactive" onClick={e => e.stopPropagation()}>
              <input type="number" className="inline-input" value={activeSec === 3 ? A : 3} onChange={e => handleMul(parseInt(e.target.value)||0, B, N)} />
              <span> × </span>
              <input type="number" className="inline-input" value={activeSec === 3 ? B : 4} onChange={e => handleMul(A, parseInt(e.target.value)||0, N)} />
              <span> mod </span>
              <input type="number" className="inline-input mod-input" value={activeSec === 3 ? N : 10} onChange={e => handleMul(A, B, Math.max(2, parseInt(e.target.value)||2))} />
            </div>
          </section>

          {/* SEC 4: Negative Numbers */}
          <section className={`lesson-section ${activeSec === 4 ? 'active' : ''}`} onClick={() => handleNeg(3, 12)}>
            <h2 className="lesson-title"><BookOpen size={20}/> 4. Negative Modulo</h2>
            <div className="lesson-text">
              <p>What happens if we go backwards? In pure mathematics, a negative modulo means walking <strong>counter-clockwise</strong>.</p>
              <p>If you start at 0 and go backwards 3 hours, you land on 9. <br/><br/><em>Note: Many programming languages (like JS and C++) actually calculate this incorrectly as -3, requiring a special formula: <code>((n % m) + m) % m</code> to get the true mathematical 9.</em></p>
            </div>
            <div className="lesson-interactive" onClick={e => e.stopPropagation()}>
              <span>-</span>
              <input type="number" className="inline-input" value={activeSec === 4 ? A : 3} onChange={e => handleNeg(parseInt(e.target.value)||0, N)} />
              <span> mod </span>
              <input type="number" className="inline-input mod-input" value={activeSec === 4 ? N : 12} onChange={e => handleNeg(A, Math.max(2, parseInt(e.target.value)||2))} />
            </div>
          </section>

          {/* SEC 5: Cryptography */}
          <section className={`lesson-section`}>
            <h2 className="lesson-title"><BookOpen size={20}/> 5. The Cryptography Connection</h2>
            <div className="lesson-text" style={{marginBottom: 0}}>
              <p>Why do we care about this? Modular arithmetic forms the absolute foundation of modern cybersecurity (like <strong>RSA Encryption</strong>).</p>
              <p>It acts as a <strong>"One-Way Function"</strong>. If I tell you `A + B = 11`, you have a good idea what A and B might be. But if I tell you `A * B mod 12 = 3`, they could have wrapped around the circle thousands of times! It is incredibly difficult to reverse-engineer division on a clock, which makes it perfect for hiding secret keys.</p>
            </div>
          </section>

        </div>

        {/* RIGHT PANEL: VISUALIZATION */}
        <div className="visual-panel">
          <h3 className="visual-title">Clock Face (Mod {N})</h3>
          
          <div className="svg-container">
            <svg className="clock-svg" viewBox="0 0 400 400">
              {/* Base Circle */}
              <circle cx={cx} cy={cy} r={r} className="clock-circle" />

              {/* Path */}
              {pathD && <path d={pathD} className="path-line" key={pathD} />}

              {/* Nodes */}
              {nodes.map(node => {
                const isStart = node.id === startNode && op !== '*'; // Don't highlight 0 as start for multiply
                const isEnd = node.id === endNode;
                const isPath = pathNodes.includes(node.id);
                
                let classList = 'clock-node';
                if (isStart) classList += ' active-start';
                else if (isEnd) classList += ' active-end';
                else if (isPath) classList += ' path-node';

                return (
                  <circle 
                    key={`node-${node.id}`}
                    cx={node.x} 
                    cy={node.y} 
                    r={12} 
                    className={classList}
                  />
                );
              })}

              {/* Text Labels */}
              {nodes.map(node => {
                const isStart = node.id === startNode && op !== '*';
                const isEnd = node.id === endNode;
                const isPath = pathNodes.includes(node.id);
                
                let classList = 'clock-text';
                if (isStart) classList += ' active-start';
                else if (isEnd) classList += ' active-end';
                else if (isPath) classList += ' path-node';

                // Push text slightly outwards so it doesn't overlap the node
                const theta = (node.id / N) * 2 * Math.PI - Math.PI / 2;
                const tx = cx + (r + 25) * Math.cos(theta);
                const ty = cy + (r + 25) * Math.sin(theta);

                return (
                  <text 
                    key={`text-${node.id}`}
                    x={tx} 
                    y={ty} 
                    className={classList}
                  >
                    {node.id}
                  </text>
                );
              })}
            </svg>
          </div>

          <div className="math-result">
            {resultStr}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ModularArithmetic;
