import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Play, Settings2 } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import './TowersOfHanoi.css';

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
    </div>
  );
};

export default TowersOfHanoi;
