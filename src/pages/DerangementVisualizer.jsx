import { useState, useMemo } from 'react';
import { Settings2, Shuffle } from 'lucide-react';
import SEO from '../components/SEO';
import Card from '../components/Card';
import './DerangementVisualizer.css';
import '../components/EducationalGuide.css';

// Generate permutations
const getPermutations = (arr) => {
  if (arr.length === 0) return [[]];
  const perms = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const subPerms = getPermutations(remaining);
    for (const sub of subPerms) {
      perms.push([current, ...sub]);
    }
  }
  return perms;
};

const ITEMS = [
  { id: 0, hat: '🎩', person: '👨‍💼' },
  { id: 1, hat: '🧢', person: '👱‍♂️' },
  { id: 2, hat: '👒', person: '👩‍🌾' },
  { id: 3, hat: '🎓', person: '👩‍🎓' },
  { id: 4, hat: '⛑️', person: '👷‍♂️' },
];

const DerangementVisualizer = () => {
  const [n, setN] = useState(4);

  const originalSet = useMemo(() => ITEMS.slice(0, n), [n]);
  
  const allPermutations = useMemo(() => {
    return getPermutations(originalSet);
  }, [originalSet]);

  const analyzedPermutations = useMemo(() => {
    let derangementCount = 0;
    const analyzed = allPermutations.map(perm => {
      let isDerangement = true;
      const matches = perm.map((item, index) => {
        const isMatch = item.id === originalSet[index].id;
        if (isMatch) isDerangement = false;
        return isMatch;
      });
      
      if (isDerangement) derangementCount++;
      
      return {
        items: perm,
        matches,
        isDerangement
      };
    });

    // Sort to show derangements first for better visibility, or keep natural order?
    // Let's keep natural order to show how rare they are.
    return { analyzed, derangementCount };
  }, [allPermutations, originalSet]);

  const { analyzed, derangementCount } = analyzedPermutations;
  const totalCount = allPermutations.length;

  return (
    <div className="container animate-fade-in derangement-container">
      <SEO 
        title="Derangements - AlgoWorld" 
        description="Visualize Derangements (subfactorials). See the probability of nobody getting their own hat back." 
        path="/derangements" 
      />
      
      <div className="derangement-header">
        <h1>Derangements <Shuffle size={36} className="inline-icon" /></h1>
        <p className="subtitle">The Hat Check Problem: What are the odds nobody gets their own hat back?</p>
      </div>

      <div className="derangement-layout">
        <div className="derangement-sidebar">
          <Card className="controls-card">
            <h3>Configuration</h3>
            
            <div className="control-group mt-4">
              <label>
                <span className="flex-center gap-2"><Settings2 size={16} /> Total People (N): {n}</span>
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

            <div className="math-box">
              <div className="math-title">Subfactorial Math (!n)</div>
              <div className="math-equation">
                n! = {totalCount} <br/>
                !n = {derangementCount} <br/>
                <br/>
                Probability (!n / n!): <br/>
                <strong style={{color: '#00e676'}}>{((derangementCount / totalCount) * 100).toFixed(1)}%</strong>
              </div>
            </div>
          </Card>
        </div>

        <div className="derangement-main">
          
          <Card className="original-set-card">
            <h3>The Original Setup (Home Positions)</h3>
            <div className="hats-container">
              {originalSet.map(item => (
                <div key={item.id} className="hat">
                  <span className="hat-icon">{item.hat}</span>
                  <span className="person-icon">{item.person}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="results-header">
              <h3>All Possible Scenarios</h3>
              <div className="stats-badges">
                <span className="badge total">{totalCount} Total</span>
                <span className="badge derangements">{derangementCount} Derangements</span>
              </div>
            </div>

            <div className="results-grid">
              {analyzed.map((perm, idx) => (
                <div 
                  key={idx} 
                  className={`permutation-box ${perm.isDerangement ? 'is-derangement' : 'not-derangement'}`}
                >
                  <div className="perm-items">
                    {perm.items.map((item, itemIdx) => (
                      <div key={item.id} className={`perm-item ${perm.matches[itemIdx] ? 'match' : ''}`}>
                        <span className="hat-icon">{item.hat}</span>
                        <span className="person-icon">{originalSet[itemIdx].person}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{textAlign: 'center', fontSize: '0.8rem', color: perm.isDerangement ? '#00e676' : 'var(--text-secondary)'}}>
                    {perm.isDerangement ? 'Derangement!' : 'Match Found'}
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>

      {/* EDUCATIONAL GUIDE */}
      <div className="edu-guide-container mt-4">
        <div className="edu-guide-header">
          <h2>Derangements (Subfactorials)</h2>
        </div>

        <div className="edu-section">
          <h3>The Hat Check Problem</h3>
          <p>Imagine 4 people check their hats at a restaurant. A storm knocks the power out, and the coat-check attendant hands the hats back completely randomly in the dark. What are the odds that <strong>nobody</strong> gets their own hat back?</p>
          <p>A permutation where NO element appears in its original position is called a <strong>Derangement</strong>. It is represented by the subfactorial symbol <code>!n</code>.</p>
        </div>

        <div className="edu-section">
          <h3>The Visual Proof</h3>
          <p>Look at the grid above. The boxes in red are regular permutations where at least one person got their own hat back (highlighted with a red background). The boxes in green are true Derangements, where every single person got the wrong hat.</p>
        </div>

        <div className="edu-section">
          <h3>The Magic of Euler's Number (e)</h3>
          <p>As the number of people (N) grows larger, the probability of a derangement (!n / n!) doesn't go to 0. It perfectly stabilizes at <code>1 / e</code> (roughly <strong>36.8%</strong>). It doesn't matter if there are 10 people checking hats or 1,000,000 people checking hats. The odds that nobody gets their own hat back will always be exactly 36.8%!</p>
        </div>
      </div>
    </div>
  );
};

export default DerangementVisualizer;
