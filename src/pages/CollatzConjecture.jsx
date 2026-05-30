import { useState, useRef, useEffect } from 'react';
import { Play, TrendingDown, TrendingUp } from 'lucide-react';
import SEO from '../components/SEO';
import Button from '../components/Button';
import Card from '../components/Card';
import './CollatzConjecture.css';
import '../components/EducationalGuide.css';

const SVG_WIDTH = 800;
const SVG_HEIGHT = 400;

const CollatzConjecture = () => {
  const [inputValue, setInputValue] = useState('27');
  const [sequence, setSequence] = useState([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [maxValue, setMaxValue] = useState(0);

  // Generate sequence immediately when input changes
  useEffect(() => {
    let n = parseInt(inputValue);
    if (isNaN(n) || n <= 0) {
      setSequence([]);
      return;
    }
    
    // Cap at a reasonable number to prevent infinite/massive loops 
    // (though Collatz is conjectured to always terminate, large inputs can take many steps)
    if (n > 1000000) n = 1000000;

    const seq = [n];
    let current = n;
    while (current > 1) {
      if (current % 2 === 0) {
        current = current / 2;
      } else {
        current = current * 3 + 1;
      }
      seq.push(current);
    }
    setSequence(seq);
    setMaxValue(Math.max(...seq));
    setVisibleCount(seq.length); // default to showing full sequence
  }, [inputValue]);

  const runAnimation = () => {
    if (isRunning || sequence.length === 0) return;
    setIsRunning(true);
    setVisibleCount(1);
    
    // Dynamic speed based on sequence length
    const speed = Math.max(10, Math.min(200, 2000 / sequence.length));

    let count = 1;
    const interval = setInterval(() => {
      count++;
      setVisibleCount(count);
      if (count >= sequence.length) {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, speed);
  };

  // Generate SVG coordinates
  const points = sequence.slice(0, visibleCount).map((val, idx) => {
    const x = sequence.length > 1 ? (idx / (sequence.length - 1)) * (SVG_WIDTH - 40) + 20 : SVG_WIDTH / 2;
    const padding = 20;
    const y = maxValue > 0 
      ? (SVG_HEIGHT - padding) - ((val / maxValue) * (SVG_HEIGHT - padding * 2))
      : SVG_HEIGHT - padding;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="container animate-fade-in collatz-container">
      <SEO 
        title="Collatz Conjecture - AlgoWorld" 
        description="Visualize the Collatz Conjecture (3n + 1 problem). See the hailstone sequence graph for any starting number." 
        path="/collatz" 
      />
      <div className="collatz-header">
        <h1>Collatz Conjecture <TrendingUp size={36} className="inline-icon" /></h1>
        <p className="subtitle">The "3n + 1" Problem: Will it always reach 1?</p>
      </div>

      <div className="collatz-layout">
        <div className="collatz-sidebar">
          <Card className="controls-card">
            <h3>Configure</h3>
            <div className="input-group mb-4">
              <label>Starting Number (n &gt; 0):</label>
              <input 
                type="number" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                min={1}
                disabled={isRunning}
                className="collatz-input"
              />
            </div>

            <Button 
              variant="primary" 
              onClick={runAnimation} 
              disabled={isRunning || sequence.length === 0} 
              className="w-full flex-center gap-2 mt-4 collatz-btn"
            >
              <Play size={16} /> Animate Sequence
            </Button>
            
            <div className="stats mt-4">
              <div className="stat-row">
                <span>Total Steps:</span>
                <strong>{sequence.length > 0 ? sequence.length - 1 : 0}</strong>
              </div>
              <div className="stat-row">
                <span>Peak Value:</span>
                <strong>{maxValue}</strong>
              </div>
            </div>
            
            <div className="rules mt-4">
              <h4>The Rules:</h4>
              <ul>
                <li>If <strong>n</strong> is even: <code>n = n / 2</code></li>
                <li>If <strong>n</strong> is odd: <code>n = 3n + 1</code></li>
              </ul>
            </div>
          </Card>
        </div>
        
        <div className="collatz-main">
          <Card className="chart-card">
            {sequence.length > 0 ? (
              <div className="collatz-svg-container">
                <div className="y-axis-label">{maxValue}</div>
                <div className="y-axis-label bottom">0</div>
                <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="collatz-svg">
                  {/* Grid lines */}
                  <line x1="0" y1={SVG_HEIGHT/2} x2={SVG_WIDTH} y2={SVG_HEIGHT/2} className="grid-line" />
                  <line x1="0" y1={SVG_HEIGHT-20} x2={SVG_WIDTH} y2={SVG_HEIGHT-20} className="grid-line" />
                  
                  {/* The Sequence Line */}
                  {points && <polyline points={points} className="seq-line" />}
                  
                  {/* The Nodes */}
                  {sequence.slice(0, visibleCount).map((val, idx) => {
                    const x = sequence.length > 1 ? (idx / (sequence.length - 1)) * (SVG_WIDTH - 40) + 20 : SVG_WIDTH / 2;
                    const padding = 20;
                    const y = maxValue > 0 
                      ? (SVG_HEIGHT - padding) - ((val / maxValue) * (SVG_HEIGHT - padding * 2))
                      : SVG_HEIGHT - padding;
                    
                    const isLast = idx === visibleCount - 1;
                    return (
                      <circle 
                        key={idx} 
                        cx={x} cy={y} 
                        r={isLast ? "6" : "3"} 
                        className={`seq-node ${isLast ? 'active' : ''}`} 
                      />
                    );
                  })}
                </svg>
              </div>
            ) : (
              <div className="empty-state">Enter a valid positive number to see the sequence graph.</div>
            )}
          </Card>
          
          {sequence.length > 0 && (
            <Card className="sequence-card mt-4">
              <h3>Sequence Values</h3>
              <div className="sequence-list">
                {sequence.slice(0, visibleCount).map((val, idx) => (
                  <span key={idx} className="seq-number">
                    {val}{idx < visibleCount - 1 && <span className="seq-arrow">→</span>}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* EDUCATIONAL GUIDE */}
      <div className="edu-guide-container">
        <div className="edu-guide-header">
          <h2>Collatz Conjecture</h2>
        </div>

        <div className="edu-section">
          <h3>The Impossible Math Problem</h3>
          <p>The Collatz Conjecture (or "3n + 1" problem) is famously unsolved. The rules are so simple a 1st grader can do them, yet we cannot mathematically prove if every single number eventually reaches 1.</p>
        </div>

        <div className="edu-section">
          <h3>The Rules</h3>
          <ul>
            <li>Take any positive integer <strong>n</strong>.</li>
            <li>If it's even, cut it in half (<code>n / 2</code>).</li>
            <li>If it's odd, multiply by 3 and add 1 (<code>3n + 1</code>).</li>
            <li>Repeat.</li>
          </ul>
        </div>

        <div className="edu-section">
          <h3>The Hailstone Sequence</h3>
          <p>The numbers bounce up and down wildly like a hailstone trapped in a storm cloud before finally crashing down to 1. No matter what number you try (computers have checked up to 2<sup>68</sup>), they all seem to eventually get sucked into the <code>4 → 2 → 1</code> infinite loop. But "seems to" isn't a mathematical proof!</p>
        </div>
      </div>
    </div>
  );
};

export default CollatzConjecture;
