import { useState, useEffect } from 'react';
import { Play, Hash, AlertCircle } from 'lucide-react';
import SEO from '../components/SEO';
import Button from '../components/Button';
import Card from '../components/Card';
import './KaprekarRoutine.css';

const KaprekarRoutine = () => {
  const [inputValue, setInputValue] = useState('3524');
  const [steps, setSteps] = useState([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);

  const formatNumber = (num) => {
    return num.toString().padStart(4, '0');
  };

  const sortDigits = (numStr, descending) => {
    const chars = numStr.split('');
    chars.sort((a, b) => descending ? b - a : a - b);
    return chars.join('');
  };

  // Generate sequence immediately on valid input
  useEffect(() => {
    setError(null);
    setSteps([]);
    setVisibleCount(0);

    let val = inputValue.toString();
    if (val.length > 4 || val.length === 0) {
      if (val.length > 4) setError("Please enter at most 4 digits.");
      return;
    }
    
    val = val.padStart(4, '0');
    
    // Check for repdigits (e.g., 1111, 2222) which evaluate to 0
    if (new Set(val.split('')).size === 1) {
      setError("Number must contain at least two different digits.");
      return;
    }

    const calculatedSteps = [];
    let current = val;
    let iterations = 0;

    // Kaprekar's constant for 4 digits is 6174
    // 0 is the trap for repdigits
    while (current !== '6174' && current !== '0000' && iterations < 15) {
      const desc = sortDigits(current, true);
      const asc = sortDigits(current, false);
      
      const diff = parseInt(desc) - parseInt(asc);
      const diffStr = formatNumber(diff);
      
      calculatedSteps.push({
        desc,
        asc,
        diff: diffStr
      });
      
      current = diffStr;
      iterations++;
    }

    setSteps(calculatedSteps);
    setVisibleCount(calculatedSteps.length); // default show all
  }, [inputValue]);

  const runAnimation = () => {
    if (isRunning || steps.length === 0 || error) return;
    setIsRunning(true);
    setVisibleCount(0);
    
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleCount(count);
      if (count >= steps.length) {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 800); // 800ms per step
  };

  return (
    <div className="container animate-fade-in kaprekar-container">
      <SEO 
        title="Kaprekar's Routine - AlgoWorld" 
        description="Visualize Kaprekar's Routine for 4-digit numbers and discover the magic of the 6174 constant." 
        path="/kaprekar" 
      />
      <div className="kaprekar-header">
        <h1>Kaprekar's Routine <Hash size={36} className="inline-icon" /></h1>
        <p className="subtitle">The mystery of 6174: All 4-digit numbers lead here.</p>
      </div>

      <div className="kaprekar-layout">
        <div className="kaprekar-sidebar">
          <Card className="controls-card">
            <h3>Configure</h3>
            <div className="input-group mb-4">
              <label>Enter up to 4 digits:</label>
              <input 
                type="number" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                min={0}
                max={9999}
                disabled={isRunning}
                className="kaprekar-input"
              />
            </div>

            {error && (
              <div className="error-msg flex-center gap-2 mb-4">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <Button 
              variant="primary" 
              onClick={runAnimation} 
              disabled={isRunning || steps.length === 0 || error !== null} 
              className="w-full flex-center gap-2 kaprekar-btn"
            >
              <Play size={16} /> Animate Routine
            </Button>
            
            <div className="rules mt-4">
              <h4>The Algorithm:</h4>
              <ol>
                <li>Take any 4-digit number.</li>
                <li>Sort digits descending to get <strong>A</strong>.</li>
                <li>Sort digits ascending to get <strong>B</strong>.</li>
                <li>Calculate <strong>A - B</strong>.</li>
                <li>Repeat with the result.</li>
              </ol>
            </div>
          </Card>
        </div>
        
        <div className="kaprekar-main">
          <Card className="routine-card">
            {steps.length > 0 ? (
              <div className="steps-container">
                <div className="starting-number">
                  Starting Number: <span>{formatNumber(inputValue)}</span>
                </div>
                
                {steps.slice(0, visibleCount).map((step, idx) => (
                  <div key={idx} className="kaprekar-step">
                    <div className="step-number">Step {idx + 1}</div>
                    <div className="equation">
                      <div className="term desc" title="Descending">{step.desc}</div>
                      <div className="operator">-</div>
                      <div className="term asc" title="Ascending">{step.asc}</div>
                      <div className="operator">=</div>
                      <div className={`term result ${step.diff === '6174' ? 'final' : ''}`}>
                        {step.diff}
                      </div>
                    </div>
                  </div>
                ))}
                
                {visibleCount === steps.length && steps[steps.length - 1]?.diff === '6174' && (
                  <div className="success-msg animate-fade-in">
                    Kaprekar's Constant Reached in {steps.length} {steps.length === 1 ? 'step' : 'steps'}!
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                {error ? "Resolve the error to see the routine." : "Enter a 4-digit number to begin."}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KaprekarRoutine;
