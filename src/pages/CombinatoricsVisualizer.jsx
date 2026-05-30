import { useState, useMemo } from 'react';
import { Hash, Settings2 } from 'lucide-react';
import SEO from '../components/SEO';
import Card from '../components/Card';
import './CombinatoricsVisualizer.css';
import '../components/EducationalGuide.css';

const factorial = (n) => {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
};

const expandFactorial = (n) => {
  if (n <= 0) return '1';
  let str = '';
  for (let i = n; i > 0; i--) {
    str += i + (i > 1 ? ' × ' : '');
  }
  return str;
};

// Generate combinations: nCr
const getCombinations = (arr, r) => {
  if (r === 0) return [[]];
  if (arr.length === 0) return [];
  const [first, ...rest] = arr;
  
  const withFirst = getCombinations(rest, r - 1).map(c => [first, ...c]);
  const withoutFirst = getCombinations(rest, r);
  
  return [...withFirst, ...withoutFirst];
};

// Generate permutations: nPr
const getPermutations = (arr, r) => {
  if (r === 0) return [[]];
  if (arr.length === 0) return [];
  
  const perms = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const subPerms = getPermutations(remaining, r - 1);
    for (const sub of subPerms) {
      perms.push([current, ...sub]);
    }
  }
  return perms;
};

const ITEM_NAMES = ['A', 'B', 'C', 'D', 'E'];

const CombinatoricsVisualizer = () => {
  const [n, setN] = useState(4);
  const [r, setR] = useState(2);
  const [mode, setMode] = useState('permutations'); // 'permutations' | 'combinations'

  // Validate R against N
  if (r > n) setR(n);

  const pool = useMemo(() => Array.from({ length: n }, (_, i) => ({
    id: i,
    name: ITEM_NAMES[i],
    colorClass: `color-${i}`
  })), [n]);

  const results = useMemo(() => {
    if (mode === 'combinations') {
      return getCombinations(pool, r);
    } else {
      return getPermutations(pool, r);
    }
  }, [pool, r, mode]);

  const nFact = factorial(n);
  const nrFact = factorial(n - r);
  const rFact = factorial(r);
  
  const resultCount = mode === 'combinations' 
    ? nFact / (rFact * nrFact) 
    : nFact / nrFact;

  return (
    <div className="container animate-fade-in combinatorics-container">
      <SEO 
        title="Combinatorics - AlgoWorld" 
        description="Visualize Permutations and Combinations. See the difference between order mattering and order not mattering." 
        path="/combinatorics" 
      />
      <div className="combinatorics-header">
        <h1>Combinatorics <Hash size={36} className="inline-icon" /></h1>
        <p className="subtitle">Visualizing Permutations (nPr) vs Combinations (nCr).</p>
      </div>

      <div className="combinatorics-layout">
        <div className="combinatorics-sidebar">
          <Card className="controls-card">
            <h3>Configuration</h3>
            
            <div className="toggle-group mt-4">
              <button 
                className={`toggle-btn ${mode === 'permutations' ? 'active' : ''}`}
                onClick={() => setMode('permutations')}
              >
                Permutations
              </button>
              <button 
                className={`toggle-btn ${mode === 'combinations' ? 'active' : ''}`}
                onClick={() => setMode('combinations')}
              >
                Combinations
              </button>
            </div>

            <div className="control-group">
              <label className="flex-center" style={{justifyContent: 'space-between'}}>
                <span className="flex-center gap-2"><Settings2 size={16} /> Total Items (n): {n}</span>
              </label>
              <input 
                type="range" 
                min={2} 
                max={5} 
                value={n}
                onChange={(e) => setN(parseInt(e.target.value))}
                className="slider"
              />
            </div>

            <div className="control-group">
              <label className="flex-center" style={{justifyContent: 'space-between'}}>
                <span className="flex-center gap-2"><Settings2 size={16} /> Choose (r): {r}</span>
              </label>
              <input 
                type="range" 
                min={1} 
                max={n} 
                value={r}
                onChange={(e) => setR(parseInt(e.target.value))}
                className="slider"
              />
            </div>

            <div className="math-formula-box">
              <div className="math-title">
                {mode === 'permutations' ? 'Permutation Formula (nPr)' : 'Combination Formula (nCr)'}
              </div>
              <div className="math-equation">
                {mode === 'permutations' 
                  ? <span>P({n},{r}) = n! / (n - r)!</span>
                  : <span>C({n},{r}) = n! / (r!(n - r)!)</span>
                }
              </div>
              <div className="math-expansion">
                {mode === 'permutations' ? (
                  <>
                    = {n}! / {n - r}!<br/>
                    = ({expandFactorial(n)}) / ({expandFactorial(n-r)})<br/>
                    = {nFact} / {nrFact}<br/>
                    = {resultCount}
                  </>
                ) : (
                  <>
                    = {n}! / ({r}! × {n - r}!)<br/>
                    = ({expandFactorial(n)}) / (({expandFactorial(r)}) × ({expandFactorial(n-r)}))<br/>
                    = {nFact} / ({rFact} × {nrFact})<br/>
                    = {resultCount}
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>
        
        <div className="combinatorics-main">
          <Card className="pool-card">
            <h3 className="pool-title">The Item Pool (n = {n})</h3>
            <div className="pool-items">
              {pool.map(item => (
                <div key={item.id} className={`ball ${item.colorClass}`}>
                  {item.name}
                </div>
              ))}
            </div>
          </Card>

          <Card className="results-card">
            <div className="results-header">
              <h3>
                {mode === 'permutations' ? 'All Permutations' : 'All Combinations'}
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginLeft: '0.5rem', fontWeight: 'normal' }}>
                  (Choosing {r})
                </span>
              </h3>
              <div className="result-count">{resultCount} Possible</div>
            </div>
            
            <div className="results-grid">
              {results.map((resultSet, idx) => (
                <div key={idx} className="result-set">
                  {resultSet.map((item, itemIdx) => (
                    <div key={`${item.id}-${itemIdx}`} className={`ball ${item.colorClass}`}>
                      {item.name}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* EDUCATIONAL GUIDE */}
      <div className="edu-guide-container mt-4">
        <div className="edu-guide-header">
          <h2>Permutations vs Combinations</h2>
        </div>

        <div className="edu-section">
          <h3>The Fruit Salad vs Combination Lock</h3>
          <p>The difference between the two concepts boils down to one simple question: <strong>Does order matter?</strong></p>
          <ul>
            <li><strong>Fruit Salad (Combination):</strong> If you mix Apples, Bananas, and Grapes, it is the exact same fruit salad as mixing Grapes, Bananas, and Apples. <strong>Order does NOT matter.</strong></li>
            <li><strong>Combination Lock (Permutation):</strong> A "Combination Lock" is actually terribly named! It should be called a Permutation Lock. If the code is 1-2-3, entering 3-2-1 will not open it. <strong>Order DOES matter.</strong></li>
          </ul>
        </div>

        <div className="edu-section">
          <h3>The Math: Why are there fewer Combinations?</h3>
          <p>Notice that when you switch from Permutations to Combinations, the total count drops significantly. Why? Because Combinations divide out the duplicates.</p>
          <p>If you pick Red and Blue, a Permutation counts <code>[Red, Blue]</code> and <code>[Blue, Red]</code> as two completely separate outcomes. A Combination recognizes they are the exact same group of items, just shuffled. To get the Combination formula, we just take the Permutation formula and divide it by <code>r!</code> (the number of ways to shuffle the chosen items) to kill the duplicates.</p>
        </div>
      </div>
    </div>
  );
};

export default CombinatoricsVisualizer;
