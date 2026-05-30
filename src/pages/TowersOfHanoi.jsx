import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Play, Settings2 } from 'lucide-react';
import SEO from '../components/SEO';
import Button from '../components/Button';
import Card from '../components/Card';
import './TowersOfHanoi.css';
import '../components/EducationalGuide.css';

const MAX_DISKS = 8;
const MIN_DISKS = 3;

const generateInitialPegs = (numDisks) => {
  const initialPeg = Array.from({ length: numDisks }, (_, i) => numDisks - i);
  return [initialPeg, [], []];
};

const TowersOfHanoi = () => {
  const [numDisks, setNumDisks] = useState(4);
  const [pegs, setPegs] = useState(generateInitialPegs(4));
  const [selectedPeg, setSelectedPeg] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [movesCount, setMovesCount] = useState(0);

  const resetGame = useCallback(() => {
    setPegs(generateInitialPegs(numDisks));
    setSelectedPeg(null);
    setIsSimulating(false);
    setMovesCount(0);
  }, [numDisks]);

  useEffect(() => {
    resetGame();
  }, [numDisks, resetGame]);

  const handlePegClick = (pegIndex) => {
    if (isSimulating) return;

    if (selectedPeg === null) {
      if (pegs[pegIndex].length > 0) {
        setSelectedPeg(pegIndex);
      }
    } else {
      if (selectedPeg === pegIndex) {
        setSelectedPeg(null);
        return;
      }

      const sourcePeg = pegs[selectedPeg];
      const targetPeg = pegs[pegIndex];
      const diskToMove = sourcePeg[sourcePeg.length - 1];
      const topTargetDisk = targetPeg[targetPeg.length - 1];

      if (!topTargetDisk || diskToMove < topTargetDisk) {
        const newPegs = [...pegs];
        newPegs[selectedPeg] = sourcePeg.slice(0, -1);
        newPegs[pegIndex] = [...targetPeg, diskToMove];
        setPegs(newPegs);
        setMovesCount(m => m + 1);
      }
      setSelectedPeg(null);
    }
  };

  const autoSimulate = () => {
    if (isSimulating) return;
    
    // Reset to initial state first if not already
    const initial = generateInitialPegs(numDisks);
    setPegs(initial);
    setMovesCount(0);
    setSelectedPeg(null);
    setIsSimulating(true);

    const moves = [];
    const solve = (n, source, target, aux) => {
      if (n > 0) {
        solve(n - 1, source, aux, target);
        moves.push([source, target]);
        solve(n - 1, aux, target, source);
      }
    };
    solve(numDisks, 0, 2, 1);

    let currentMoveIndex = 0;
    let currentPegs = [...initial];

    const interval = setInterval(() => {
      if (currentMoveIndex >= moves.length) {
        clearInterval(interval);
        setIsSimulating(false);
        return;
      }

      const [source, target] = moves[currentMoveIndex];
      
      const diskToMove = currentPegs[source][currentPegs[source].length - 1];
      
      const newPegs = [
        [...currentPegs[0]],
        [...currentPegs[1]],
        [...currentPegs[2]]
      ];
      
      newPegs[source].pop();
      newPegs[target].push(diskToMove);
      
      currentPegs = newPegs;
      setPegs(newPegs);
      setMovesCount(currentMoveIndex + 1);
      currentMoveIndex++;
    }, 500);
  };

  const isComplete = pegs[2].length === numDisks;

  return (
    <div className="container animate-fade-in tohi-container">
      <SEO 
        title="Towers of Hanoi - AlgoWorld" 
        description="Visualize and solve the classic Towers of Hanoi puzzle recursively. Adjust disks and see the optimal solution." 
        path="/hanoi" 
      />
      <div className="tohi-header">
        <h1>Towers of Hanoi</h1>
        <p className="subtitle">Move all disks from the first peg to the last peg. You cannot place a larger disk onto a smaller disk.</p>
      </div>

      <div className="tohi-layout">
        <div className="tohi-main">
          <Card className="tohi-board-card">
            <div className="tohi-board">
              {pegs.map((peg, pegIndex) => (
                <div 
                  key={pegIndex} 
                  className={`peg-container ${selectedPeg === pegIndex ? 'selected' : ''}`}
                  onClick={() => handlePegClick(pegIndex)}
                >
                  <div className="peg-stick"></div>
                  <div className="peg-base"></div>
                  <div className="disks-container">
                    {peg.map((diskSize, i) => (
                      <div 
                        key={diskSize} 
                        className={`disk disk-${diskSize} ${selectedPeg === pegIndex && i === peg.length - 1 ? 'disk-selected' : ''}`}
                        style={{ 
                          width: `${(diskSize / MAX_DISKS) * 90 + 10}%`,
                          bottom: `${i * 24}px`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {isComplete && !isSimulating && (
              <div className="completion-message animate-fade-in">
                <h3>Puzzle Solved!</h3>
                <p>You completed it in {movesCount} moves.</p>
              </div>
            )}
          </Card>
        </div>

        <div className="tohi-sidebar">
          <Card className="controls-card">
            <h3>Controls</h3>
            
            <div className="control-group">
              <label className="flex-center" style={{justifyContent: 'space-between'}}>
                <span className="flex-center gap-2"><Settings2 size={16} /> Disks: {numDisks}</span>
              </label>
              <input 
                type="range" 
                min={MIN_DISKS} 
                max={MAX_DISKS} 
                value={numDisks}
                onChange={(e) => setNumDisks(parseInt(e.target.value))}
                disabled={isSimulating}
                className="slider"
              />
            </div>

            <div className="stats-panel">
              <div className="stat-box">
                <span className="stat-label">Moves</span>
                <span className="stat-value">{movesCount}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Minimum</span>
                <span className="stat-value">{Math.pow(2, numDisks) - 1}</span>
              </div>
            </div>

            <div className="action-buttons">
              <Button 
                variant="primary" 
                onClick={autoSimulate} 
                disabled={isSimulating || isComplete}
                className="w-full flex-center gap-2"
              >
                <Play size={18} /> {isSimulating ? 'Simulating...' : 'Auto Simulate'}
              </Button>
              <Button 
                variant="secondary" 
                onClick={resetGame}
                disabled={isSimulating}
                className="w-full flex-center gap-2 mt-2"
              >
                <RotateCcw size={18} /> Reset
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* EDUCATIONAL GUIDE */}
      <div className="edu-guide-container">
        <div className="edu-guide-header">
          <h2>Towers of Hanoi</h2>
        </div>

        <div className="edu-section">
          <h3>The Power of Recursion</h3>
          <p>Towers of Hanoi is the quintessential puzzle to teach <strong>Recursion</strong> (a function calling itself). To a human, moving 8 disks seems incredibly complex. But to a computer using recursion, the solution is practically 3 lines of code. It breaks the massive problem down into a smaller identical problem.</p>
        </div>

        <div className="edu-section">
          <h3>The 3-Step Recursive Trick</h3>
          <p>To move <code>N</code> disks from Peg A to Peg C, you only need to do 3 things:</p>
          <ol>
            <li>Move <code>N-1</code> disks from Peg A to Peg B (the spare peg).</li>
            <li>Move the 1 remaining largest disk from Peg A directly to Peg C.</li>
            <li>Move the <code>N-1</code> disks from Peg B onto Peg C.</li>
          </ol>
          <p>That's it! The algorithm just calls itself to repeat those 3 steps over and over until <code>N = 1</code>.</p>
        </div>

        <div className="edu-section">
          <h3>Exponential Growth (O(2^N))</h3>
          <p>The minimum number of moves required is exactly <code>2<sup>N</sup> - 1</code>. If monks in a temple were moving a tower of 64 golden disks at a rate of 1 disk per second, it would take them <strong>585 billion years</strong> to finish. That is the terrifying power of exponential time complexity.</p>
        </div>
      </div>
    </div>
  );
};

export default TowersOfHanoi;
