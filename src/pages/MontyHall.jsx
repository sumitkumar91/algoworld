import { useState } from 'react';
import { Play, RotateCcw, CarFront, HelpCircle } from 'lucide-react';
import SEO from '../components/SEO';
import Button from '../components/Button';
import Card from '../components/Card';
import './MontyHall.css';

const generateDoors = () => {
  const carIndex = Math.floor(Math.random() * 3);
  return Array.from({ length: 3 }, (_, i) => ({
    id: i,
    hasCar: i === carIndex,
    isOpen: false,
  }));
};

const MontyHall = () => {
  const [doors, setDoors] = useState(generateDoors());
  // phase: 'pick' | 'host_reveal' | 'swap_choice' | 'result'
  const [phase, setPhase] = useState('pick');
  const [playerPick, setPlayerPick] = useState(null);
  const [hostPick, setHostPick] = useState(null);
  const [finalPick, setFinalPick] = useState(null);
  
  const [stats, setStats] = useState({
    stayWins: 0,
    stayTotal: 0,
    swapWins: 0,
    swapTotal: 0,
  });

  const handleDoorClick = (doorId) => {
    if (phase === 'pick') {
      setPlayerPick(doorId);
      
      // Host reveals a goat door that the player didn't pick
      const availableHostDoors = doors.filter(d => d.id !== doorId && !d.hasCar);
      const hostReveals = availableHostDoors[Math.floor(Math.random() * availableHostDoors.length)].id;
      
      setHostPick(hostReveals);
      
      // Open the host's door
      setDoors(prev => prev.map(d => d.id === hostReveals ? { ...d, isOpen: true } : d));
      setPhase('swap_choice');
    }
  };

  const handleSwapChoice = (swap) => {
    if (phase !== 'swap_choice') return;

    const finalDoorId = swap ? doors.find(d => d.id !== playerPick && d.id !== hostPick).id : playerPick;
    setFinalPick(finalDoorId);
    
    // Open all doors
    setDoors(prev => prev.map(d => ({ ...d, isOpen: true })));
    
    const won = doors[finalDoorId].hasCar;
    
    setStats(prev => ({
      ...prev,
      stayTotal: prev.stayTotal + (swap ? 0 : 1),
      stayWins: prev.stayWins + (!swap && won ? 1 : 0),
      swapTotal: prev.swapTotal + (swap ? 1 : 0),
      swapWins: prev.swapWins + (swap && won ? 1 : 0),
    }));
    
    setPhase('result');
  };

  const resetGame = () => {
    setDoors(generateDoors());
    setPhase('pick');
    setPlayerPick(null);
    setHostPick(null);
    setFinalPick(null);
  };

  const autoSimulate = (runs) => {
    let newSwapWins = 0;
    let newSwapTotal = runs;
    let newStayWins = 0;
    let newStayTotal = runs;

    for (let i = 0; i < runs; i++) {
      const car = Math.floor(Math.random() * 3);
      const pick = Math.floor(Math.random() * 3);
      
      // If we stay, we win if our initial pick was the car
      if (pick === car) {
        newStayWins++;
      }
      
      // If we swap, we win if our initial pick was a goat
      if (pick !== car) {
        newSwapWins++;
      }
    }

    setStats(prev => ({
      stayWins: prev.stayWins + newStayWins,
      stayTotal: prev.stayTotal + newStayTotal,
      swapWins: prev.swapWins + newSwapWins,
      swapTotal: prev.swapTotal + newSwapTotal,
    }));
    
    // Reset visual state
    resetGame();
  };

  const swapWinRate = stats.swapTotal > 0 ? ((stats.swapWins / stats.swapTotal) * 100).toFixed(1) : '0.0';
  const stayWinRate = stats.stayTotal > 0 ? ((stats.stayWins / stats.stayTotal) * 100).toFixed(1) : '0.0';

  const getMessage = () => {
    switch(phase) {
      case 'pick': return "Pick a door to start!";
      case 'swap_choice': return "The host opened a door with a goat. Do you want to SWAP your choice or STAY?";
      case 'result': return doors[finalPick].hasCar ? "🎉 You Won a Car! 🎉" : "🐐 You got a Goat! 🐐";
      default: return "";
    }
  };

  return (
    <div className="container animate-fade-in mh-container">
      <SEO 
        title="Monty Hall Problem - AlgoWorld" 
        description="Simulate the Monty Hall Problem to see why switching doors doubles your chances of winning." 
        path="/monty-hall" 
      />
      <div className="mh-header">
        <h1>Monty Hall Problem</h1>
        <p className="subtitle">Is it better to swap your choice or stay after the host reveals a goat? Simulate it to find out.</p>
      </div>

      <div className="mh-layout">
        <div className="mh-main">
          <div className="message-banner">
            <h3>{getMessage()}</h3>
          </div>

          <div className="doors-container">
            {doors.map(door => (
              <div 
                key={door.id} 
                className={`door-wrapper ${playerPick === door.id ? 'selected' : ''}`}
                onClick={() => handleDoorClick(door.id)}
              >
                {playerPick === door.id && <div className="player-indicator">Your Pick</div>}
                
                <div className={`door-frame ${door.isOpen ? 'open' : ''} ${phase === 'pick' ? 'hoverable' : ''}`}>
                  <div className="door-content">
                    {door.hasCar ? (
                      <div className="prize car"><CarFront size={60} color="#00e676" /></div>
                    ) : (
                      <div className="prize goat">🐐</div>
                    )}
                  </div>
                  <div className="door-front">
                    <span className="door-number">{door.id + 1}</span>
                    <HelpCircle className="door-icon" size={40} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {phase === 'swap_choice' && (
            <div className="action-buttons animate-fade-in" style={{justifyContent: 'center', gap: '1rem', marginTop: '2rem'}}>
              <Button variant="secondary" onClick={() => handleSwapChoice(false)}>Stay with Door {playerPick + 1}</Button>
              <Button variant="primary" onClick={() => handleSwapChoice(true)}>Swap Door</Button>
            </div>
          )}

          {phase === 'result' && (
            <div className="action-buttons animate-fade-in" style={{justifyContent: 'center', marginTop: '2rem'}}>
              <Button variant="primary" onClick={resetGame} className="flex-center gap-2">
                <RotateCcw size={18} /> Play Again
              </Button>
            </div>
          )}
        </div>

        <div className="mh-sidebar">
          <Card className="stats-card">
            <h3>Statistics</h3>
            
            <div className="stat-row">
              <div className="stat-label">Wins by Staying</div>
              <div className="stat-bar-container">
                <div className="stat-bar stay" style={{width: `${stayWinRate}%`}}></div>
              </div>
              <div className="stat-text">{stats.stayWins} / {stats.stayTotal} ({stayWinRate}%)</div>
            </div>

            <div className="stat-row">
              <div className="stat-label">Wins by Swapping</div>
              <div className="stat-bar-container">
                <div className="stat-bar swap" style={{width: `${swapWinRate}%`}}></div>
              </div>
              <div className="stat-text">{stats.swapWins} / {stats.swapTotal} ({swapWinRate}%)</div>
            </div>
            
            <div className="divider"></div>

            <div className="sim-controls">
              <h4>Auto Simulate</h4>
              <p className="sim-desc">Run thousands of games instantly to see the probabilities converge.</p>
              
              <Button variant="secondary" onClick={() => autoSimulate(100)} className="w-full mb-2 flex-center gap-2">
                <Play size={16} /> Simulate 100x
              </Button>
              <Button variant="primary" onClick={() => autoSimulate(1000)} className="w-full flex-center gap-2">
                <Play size={16} /> Simulate 1000x
              </Button>
              <Button 
                variant="danger" 
                onClick={() => setStats({ stayWins: 0, stayTotal: 0, swapWins: 0, swapTotal: 0 })} 
                className="w-full mt-4 flex-center gap-2"
              >
                <RotateCcw size={16} /> Reset Stats
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MontyHall;
