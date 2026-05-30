import { useState, useEffect } from 'react';
import { Cpu, Code, Info } from 'lucide-react';
import SEO from '../components/SEO';
import Button from '../components/Button';
import Card from '../components/Card';
import CodeModal from '../components/CodeModal';
import { floatSnippets } from '../utils/codeSnippets';
import './FloatingPointVisualizer.css';
import '../components/EducationalGuide.css';

// Helper to convert float to 32-bit binary string
const getIEEE754 = (num) => {
  const floatArr = new Float32Array(1);
  const intArr = new Uint32Array(floatArr.buffer);
  floatArr[0] = num;
  return intArr[0].toString(2).padStart(32, '0');
};

const presets = [
  { label: 'Pi (3.14159)', value: '3.14159' },
  { label: 'Negative (-10.5)', value: '-10.5' },
  { label: 'Small (0.1)', value: '0.1' },
  { label: 'One (1.0)', value: '1' },
  { label: 'Zero (0)', value: '0' },
  { label: 'Negative Zero (-0)', value: '-0' },
  { label: '+Infinity', value: 'Infinity' },
  { label: 'NaN', value: 'NaN' }
];

const FloatingPointVisualizer = () => {
  const [inputValue, setInputValue] = useState('3.14159');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  
  // Parsed values
  const [binString, setBinString] = useState('00000000000000000000000000000000');
  
  useEffect(() => {
    let num;
    if (inputValue === 'Infinity' || inputValue === '+Infinity') num = Infinity;
    else if (inputValue === '-Infinity') num = -Infinity;
    else if (inputValue === 'NaN') num = NaN;
    else if (inputValue === '-0') num = -0;
    else num = parseFloat(inputValue);

    if (inputValue === '-0') {
      // parseFloat('-0') is -0, but sometimes it gets lost. Let's force the bit string for -0.
      setBinString('10000000000000000000000000000000');
    } else {
      setBinString(getIEEE754(num || 0)); // Fallback to 0 if totally invalid parse, but NaN parses to NaN
    }
    
    // Exact NaN fix (since JS NaN can have different mantissas, we can standardize it or show actual)
    if (Number.isNaN(num)) {
      setBinString(getIEEE754(NaN));
    }
  }, [inputValue]);

  const signBit = binString[0];
  const expBits = binString.slice(1, 9);
  const manBits = binString.slice(9, 32);

  const expInt = parseInt(expBits, 2);
  
  // Calculate Mantissa sum
  let manSum = 0;
  for (let i = 0; i < 23; i++) {
    if (manBits[i] === '1') {
      manSum += Math.pow(2, -(i + 1));
    }
  }

  // Determine Type and actual values
  let isDenormal = false;
  let isZero = false;
  let isInfinity = false;
  let isNaN = false;
  
  let actualExp = 0;
  let actualMan = 0;
  let finalValueStr = "";

  if (expInt === 255) {
    if (manSum === 0) {
      isInfinity = true;
      finalValueStr = signBit === '1' ? "-Infinity" : "+Infinity";
    } else {
      isNaN = true;
      finalValueStr = "NaN (Not a Number)";
    }
  } else if (expInt === 0) {
    if (manSum === 0) {
      isZero = true;
      finalValueStr = signBit === '1' ? "-0" : "0";
    } else {
      isDenormal = true;
      actualExp = -126;
      actualMan = manSum;
      const val = (signBit === '1' ? -1 : 1) * Math.pow(2, actualExp) * actualMan;
      finalValueStr = val.toExponential(4);
    }
  } else {
    // Normal Number
    actualExp = expInt - 127;
    actualMan = 1 + manSum;
    const val = (signBit === '1' ? -1 : 1) * Math.pow(2, actualExp) * actualMan;
    finalValueStr = val.toPrecision(7);
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="container animate-fade-in float-page-container">
      <SEO 
        title="Floating Point - AlgoWorld" 
        description="Visualize IEEE-754 Single Precision Floating Point numbers." 
        path="/floating-point" 
      />
      
      <div className="float-header">
        <h1>Floating Point <Cpu size={36} className="inline-icon" /></h1>
        <p className="subtitle">Visualizing the IEEE-754 32-bit architecture for decimal memory.</p>
      </div>

      <div className="float-layout">
        <div className="float-sidebar">
          <Card className="controls-card">
            <h3>Configuration</h3>
            
            <div className="input-group mb-4">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Decimal Input:</div>
              <input 
                type="text" 
                value={inputValue} 
                onChange={handleInputChange} 
                placeholder="e.g. 3.14"
                className="float-input"
              />
            </div>
            
            <div className="divider"></div>
            
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Special Cases:</div>
            <div className="float-preset-grid">
              {presets.map(p => (
                <button 
                  key={p.label} 
                  className="float-preset-btn"
                  onClick={() => setInputValue(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <Button variant="outline" onClick={() => setIsCodeModalOpen(true)} className="w-full flex-center gap-2 mt-4">
              <Code size={16} /> How it Works
            </Button>
          </Card>
        </div>
        
        <div className="float-main">
          <Card className="float-card">
            
            {/* Bit Rendering */}
            <div className="bit-container">
              <div className="bit-group-label">
                <span className="bit-label-sign">Sign (1 bit)</span>
                <span className="bit-label-exponent">Exponent (8 bits)</span>
                <span className="bit-label-mantissa">Mantissa / Fraction (23 bits)</span>
              </div>
              
              <div className="bit-boxes">
                <div className={`bit-box bit-sign bit-${signBit}`}>{signBit}</div>
                
                <div style={{width: '8px'}}></div>
                
                {expBits.split('').map((b, i) => (
                  <div key={`exp-${i}`} className={`bit-box bit-exponent bit-${b}`}>{b}</div>
                ))}
                
                <div style={{width: '8px'}}></div>
                
                {manBits.split('').map((b, i) => (
                  <div key={`man-${i}`} className={`bit-box bit-mantissa bit-${b}`}>{b}</div>
                ))}
              </div>
            </div>

            {/* Math Reconstruction */}
            <div className="float-math-panel">
              <div className="math-row">
                <span className="math-label">Sign Bit ({signBit})</span>
                <span className="math-value" style={{color: '#ff1744'}}>{signBit === '1' ? 'Negative (-1)' : 'Positive (+1)'}</span>
              </div>
              
              <div className="math-row">
                <span className="math-label">Exponent ({expBits})</span>
                <span className="math-value" style={{color: '#9d4edd'}}>
                  {isZero || isDenormal ? (
                    `All Zeros (Special)`
                  ) : isInfinity || isNaN ? (
                    `All Ones (Special)`
                  ) : (
                    `${expInt} - 127 Bias = ${actualExp}`
                  )}
                </span>
              </div>

              <div className="math-row">
                <span className="math-label">Mantissa ({manBits.slice(0, 5)}...)</span>
                <span className="math-value" style={{color: '#00e5ff'}}>
                  {isZero ? '0' : isDenormal ? `0 + ${manSum.toFixed(5)}...` : isInfinity || isNaN ? `Undefined` : `1 + ${manSum.toFixed(5)}... = ${actualMan.toFixed(5)}`}
                </span>
              </div>

              <div className="math-formula">
                {isZero ? (
                  <><span className="math-highlight" style={{color: '#ff1744'}}>{signBit === '1' ? '-' : '+'}</span><span className="math-highlight">0</span></>
                ) : isInfinity ? (
                  <><span className="math-highlight" style={{color: '#ff1744'}}>{signBit === '1' ? '-' : '+'}</span><span className="math-highlight">Infinity</span></>
                ) : isNaN ? (
                  <span className="math-highlight">NaN (Not a Number)</span>
                ) : (
                  <>
                    <span className="math-highlight" style={{color: '#ff1744'}}>{signBit === '1' ? '-1' : '1'}</span> 
                    {' × '}
                    <span className="math-highlight" style={{color: '#9d4edd'}}>2<sup>{actualExp}</sup></span> 
                    {' × '}
                    <span className="math-highlight" style={{color: '#00e5ff'}}>{actualMan.toFixed(5)}</span> 
                    {' = '}
                    <strong>{finalValueStr}</strong>
                  </>
                )}
              </div>
            </div>

          </Card>
        </div>
      </div>

      {/* EDUCATIONAL GUIDE */}
      <div className="edu-guide-container">
        <div className="edu-guide-header">
          <h2>IEEE-754 Floating Point</h2>
        </div>

        <div className="edu-section">
          <h3>The Problem with Decimals</h3>
          <p>Computers only understand 1s and 0s. Storing a clean integer like <code>5</code> is easy. But how do you store <code>3.14159</code>? You can't just put a decimal point in RAM. The IEEE-754 standard solves this by treating decimals like Scientific Notation (e.g., <code>1.23 x 10²</code>), but in binary!</p>
        </div>

        <div className="edu-section">
          <h3>The 3 Blocks of Memory</h3>
          <p>A standard 32-bit float rips a number into three separate chunks:</p>
          <ul>
            <li><strong>Sign (1 bit):</strong> The simplest part. <code>0</code> means positive, <code>1</code> means negative.</li>
            <li><strong>Exponent (8 bits):</strong> Controls the scale of the number. It acts like the <code>x 10²</code> part of scientific notation, but using base-2. It has a "bias" of 127 so it can scale down to microscopic fractions or scale up to massive galaxies.</li>
            <li><strong>Mantissa / Fraction (23 bits):</strong> The actual precision of the number. It stores the digits that come <em>after</em> the decimal point.</li>
          </ul>
        </div>

        <div className="edu-section">
          <h3>Why 0.1 + 0.2 = 0.30000000000000004</h3>
          <p>Because there are only 23 bits of precision in the Mantissa, a computer physically cannot store certain numbers perfectly. Just like <code>1/3</code> is an infinite repeating decimal <code>0.333333...</code> in Base-10, the number <code>0.1</code> is an infinite repeating decimal in Base-2. The computer eventually has to cut it off to fit in 32 bits, resulting in tiny rounding errors.</p>
        </div>
      </div>
      
      <CodeModal 
        isOpen={isCodeModalOpen} 
        onClose={() => setIsCodeModalOpen(false)} 
        code={floatSnippets.IEEE754} 
        title="IEEE-754 Standard" 
      />
    </div>
  );
};

export default FloatingPointVisualizer;
