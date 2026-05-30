import { useState } from 'react';
import { Cpu, Code, Info } from 'lucide-react';
import SEO from '../components/SEO';
import Button from '../components/Button';
import Card from '../components/Card';
import CodeModal from '../components/CodeModal';
import LogicCanvas from '../components/LogicCanvas';
import { logicSnippets } from '../utils/codeSnippets';
import './LogicGatesVisualizer.css';
import '../components/EducationalGuide.css';

// Pre-defined SVGs for Gates
const GatePaths = {
  AND: "M 0 0 L 30 0 A 30 30 0 0 1 30 60 L 0 60 Z",
  NAND: "M 0 0 L 30 0 A 30 30 0 0 1 30 60 L 0 60 Z",
  OR: "M 0 0 C 20 0 45 15 60 30 C 45 45 20 60 0 60 C 15 45 15 15 0 0 Z",
  NOR: "M 0 0 C 20 0 45 15 60 30 C 45 45 20 60 0 60 C 15 45 15 15 0 0 Z",
  XOR: "M 5 0 C 25 0 50 15 65 30 C 50 45 25 60 5 60 C 20 45 20 15 5 0 Z",
  NOT: "M 0 5 L 40 30 L 0 55 Z"
};

const Gate = ({ type, x, y, inputs, active }) => {
  const isNand = type === 'NAND';
  const isNor = type === 'NOR';
  const isNot = type === 'NOT';
  
  return (
    <g transform={`translate(${x}, ${y})`} className={`logic-gate ${active ? 'active' : ''}`}>
      {type === 'XOR' && <path d="M -5 0 C 10 15 10 45 -5 60" fill="none" stroke="currentColor" strokeWidth="2" />}
      
      <path d={GatePaths[type]} />
      
      {(isNand || isNor || isNot) && (
        <circle cx={isNot ? 45 : 65} cy={30} r={5} fill="var(--bg-primary)" stroke="currentColor" strokeWidth="2" />
      )}
      
      <text x={isNot ? 15 : 25} y={35} className="logic-gate-text" textAnchor="middle">{type}</text>
    </g>
  );
};

// Node (Switch or Output)
const LogicNode = ({ x, y, label, state, isInput = false, onClick = null }) => {
  return (
    <g transform={`translate(${x}, ${y})`} onClick={onClick} style={{ cursor: isInput ? 'pointer' : 'default' }}>
      <circle cx={0} cy={0} r={15} className={`logic-node state-${state}`} />
      <text x={0} y={5} className={`logic-gate-text`} textAnchor="middle" fill={state ? '#000' : '#fff'}>{state}</text>
      <text x={isInput ? -25 : 25} y={5} className={`logic-node-label state-${state}`} textAnchor={isInput ? 'end' : 'start'}>{label}</text>
    </g>
  );
};

// Wire connecting points
const Wire = ({ path, state }) => {
  return <path d={path} className={`logic-wire state-${state}`} />;
};

const circuits = [
  { id: 'AND', name: 'Basic: AND Gate' },
  { id: 'OR', name: 'Basic: OR Gate' },
  { id: 'XOR', name: 'Basic: XOR Gate' },
  { id: 'NOT', name: 'Basic: NOT Gate' },
  { id: 'HALF_ADDER', name: 'Combinational: Half Adder' },
  { id: 'FULL_ADDER', name: 'Combinational: Full Adder' },
  { id: 'MUX', name: 'Combinational: 2-to-1 MUX' }
];

const LogicGatesVisualizer = () => {
  const [viewMode, setViewMode] = useState('prefab'); // 'prefab' | 'custom'
  const [circuitType, setCircuitType] = useState('HALF_ADDER');
  
  // States for inputs
  const [inputs, setInputs] = useState({ A: 0, B: 0, C: 0 }); // C is usually Carry-In or Selector
  
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  const toggleInput = (key) => {
    setInputs(prev => ({ ...prev, [key]: prev[key] === 0 ? 1 : 0 }));
  };

  const handleCircuitChange = (e) => {
    setCircuitType(e.target.value);
    setInputs({ A: 0, B: 0, C: 0 });
  };

  // Logic evaluations
  const evals = {};
  if (circuitType === 'AND') evals.Out = inputs.A & inputs.B;
  if (circuitType === 'OR') evals.Out = inputs.A | inputs.B;
  if (circuitType === 'XOR') evals.Out = inputs.A ^ inputs.B;
  if (circuitType === 'NOT') evals.Out = inputs.A === 0 ? 1 : 0;
  
  if (circuitType === 'HALF_ADDER') {
    evals.Sum = inputs.A ^ inputs.B;
    evals.Carry = inputs.A & inputs.B;
  }
  
  if (circuitType === 'FULL_ADDER') {
    evals.HA1_Sum = inputs.A ^ inputs.B;
    evals.HA1_Carry = inputs.A & inputs.B;
    evals.Sum = evals.HA1_Sum ^ inputs.C;
    evals.HA2_Carry = evals.HA1_Sum & inputs.C;
    evals.CarryOut = evals.HA1_Carry | evals.HA2_Carry;
  }

  if (circuitType === 'MUX') {
    // C is Selector (S)
    evals.TopAnd = inputs.A & (inputs.C === 0 ? 1 : 0);
    evals.BotAnd = inputs.B & inputs.C;
    evals.Out = evals.TopAnd | evals.BotAnd;
  }

  const renderCircuit = () => {
    switch(circuitType) {
      case 'AND':
      case 'OR':
      case 'XOR':
        return (
          <>
            <Wire path="M 100 100 L 250 100" state={inputs.A} />
            <Wire path="M 100 200 L 250 200" state={inputs.B} />
            <Wire path="M 250 100 L 250 120 L 300 120" state={inputs.A} />
            <Wire path="M 250 200 L 250 180 L 300 180" state={inputs.B} />
            
            <Gate type={circuitType} x={300} y={120} active={evals.Out} />
            
            <Wire path="M 360 150 L 500 150" state={evals.Out} />
            
            <LogicNode x={100} y={100} label="A" state={inputs.A} isInput onClick={() => toggleInput('A')} />
            <LogicNode x={100} y={200} label="B" state={inputs.B} isInput onClick={() => toggleInput('B')} />
            <LogicNode x={500} y={150} label="Out" state={evals.Out} />
          </>
        );
      
      case 'NOT':
        return (
          <>
            <Wire path="M 150 150 L 300 150" state={inputs.A} />
            <Gate type="NOT" x={300} y={120} active={evals.Out} />
            <Wire path="M 350 150 L 500 150" state={evals.Out} />
            
            <LogicNode x={150} y={150} label="A" state={inputs.A} isInput onClick={() => toggleInput('A')} />
            <LogicNode x={500} y={150} label="Out" state={evals.Out} />
          </>
        );

      case 'HALF_ADDER':
        return (
          <>
            {/* Wires from A */}
            <Wire path="M 100 100 L 200 100" state={inputs.A} />
            <Wire path="M 200 100 L 300 100" state={inputs.A} />
            <Wire path="M 200 100 L 200 250 L 300 250" state={inputs.A} />
            <circle cx={200} cy={100} r={4} fill="var(--text-secondary)" />

            {/* Wires from B */}
            <Wire path="M 100 200 L 250 200" state={inputs.B} />
            <Wire path="M 250 200 L 250 130 L 300 130" state={inputs.B} />
            <Wire path="M 250 200 L 250 280 L 300 280" state={inputs.B} />
            <circle cx={250} cy={200} r={4} fill="var(--text-secondary)" />

            {/* Gates */}
            <Gate type="XOR" x={300} y={85} active={evals.Sum} />
            <Gate type="AND" x={300} y={235} active={evals.Carry} />

            {/* Outputs */}
            <Wire path="M 365 115 L 500 115" state={evals.Sum} />
            <Wire path="M 360 265 L 500 265" state={evals.Carry} />

            <LogicNode x={100} y={100} label="A" state={inputs.A} isInput onClick={() => toggleInput('A')} />
            <LogicNode x={100} y={200} label="B" state={inputs.B} isInput onClick={() => toggleInput('B')} />
            
            <LogicNode x={500} y={115} label="Sum" state={evals.Sum} />
            <LogicNode x={500} y={265} label="Carry" state={evals.Carry} />
          </>
        );

      case 'FULL_ADDER':
        return (
          <>
            {/* Input A */}
            <Wire path="M 100 80 L 250 80 L 250 120 L 300 120" state={inputs.A} />
            <Wire path="M 250 80 L 250 240 L 300 240" state={inputs.A} />
            <circle cx={250} cy={80} r={4} fill="var(--text-secondary)" />

            {/* Input B */}
            <Wire path="M 100 140 L 200 140 L 200 150 L 300 150" state={inputs.B} />
            <Wire path="M 200 140 L 200 270 L 300 270" state={inputs.B} />
            <circle cx={200} cy={140} r={4} fill="var(--text-secondary)" />

            {/* HA1 XOR */}
            <Gate type="XOR" x={300} y={105} active={evals.HA1_Sum} />
            {/* HA1 AND */}
            <Gate type="AND" x={300} y={225} active={evals.HA1_Carry} />

            {/* Input Cin */}
            <Wire path="M 100 200 L 400 200 L 400 150 L 450 150" state={inputs.C} />
            <Wire path="M 400 200 L 400 320 L 450 320" state={inputs.C} />
            <circle cx={400} cy={200} r={4} fill="var(--text-secondary)" />

            {/* HA1 Sum splits to HA2 XOR and HA2 AND */}
            <Wire path="M 365 135 L 420 135 L 420 120 L 450 120" state={evals.HA1_Sum} />
            <Wire path="M 420 135 L 420 290 L 450 290" state={evals.HA1_Sum} />
            <circle cx={420} cy={135} r={4} fill="var(--text-secondary)" />

            {/* HA2 XOR (Final Sum) */}
            <Gate type="XOR" x={450} y={105} active={evals.Sum} />
            {/* HA2 AND */}
            <Gate type="AND" x={450} y={275} active={evals.HA2_Carry} />

            {/* OR Gate for CarryOut */}
            <Wire path="M 360 255 L 530 255 L 530 330 L 550 330" state={evals.HA1_Carry} />
            <Wire path="M 510 305 L 530 305 L 530 360 L 550 360" state={evals.HA2_Carry} />
            <Gate type="OR" x={550} y={315} active={evals.CarryOut} />

            {/* Outputs */}
            <Wire path="M 515 135 L 680 135" state={evals.Sum} />
            <Wire path="M 610 345 L 680 345" state={evals.CarryOut} />

            <LogicNode x={100} y={80} label="A" state={inputs.A} isInput onClick={() => toggleInput('A')} />
            <LogicNode x={100} y={140} label="B" state={inputs.B} isInput onClick={() => toggleInput('B')} />
            <LogicNode x={100} y={200} label="Cin" state={inputs.C} isInput onClick={() => toggleInput('C')} />
            
            <LogicNode x={680} y={135} label="Sum" state={evals.Sum} />
            <LogicNode x={680} y={345} label="Cout" state={evals.CarryOut} />
          </>
        );

      case 'MUX':
        const notS = inputs.C === 0 ? 1 : 0;
        return (
          <>
            {/* Inputs */}
            <Wire path="M 100 100 L 300 100" state={inputs.A} />
            <Wire path="M 100 250 L 300 250" state={inputs.B} />
            
            {/* Selector S */}
            <Wire path="M 100 350 L 200 350 L 200 150 L 220 150" state={inputs.C} />
            <Wire path="M 200 350 L 200 280 L 300 280" state={inputs.C} />
            <circle cx={200} cy={350} r={4} fill="var(--text-secondary)" />

            {/* NOT gate for top AND */}
            <Gate type="NOT" x={220} y={120} active={notS} />
            <Wire path="M 270 150 L 300 150" state={notS} />

            {/* AND Gates */}
            <Gate type="AND" x={300} y={85} active={evals.TopAnd} />
            <Gate type="AND" x={300} y={235} active={evals.BotAnd} />

            {/* OR Gate */}
            <Wire path="M 360 115 L 400 115 L 400 160 L 450 160" state={evals.TopAnd} />
            <Wire path="M 360 265 L 400 265 L 400 190 L 450 190" state={evals.BotAnd} />
            <Gate type="OR" x={450} y={145} active={evals.Out} />

            {/* Output */}
            <Wire path="M 510 175 L 600 175" state={evals.Out} />

            <LogicNode x={100} y={100} label="D0 (A)" state={inputs.A} isInput onClick={() => toggleInput('A')} />
            <LogicNode x={100} y={250} label="D1 (B)" state={inputs.B} isInput onClick={() => toggleInput('B')} />
            <LogicNode x={100} y={350} label="Sel (S)" state={inputs.C} isInput onClick={() => toggleInput('C')} />
            
            <LogicNode x={600} y={175} label="Out" state={evals.Out} />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container animate-fade-in logic-page-container">
      <SEO 
        title="Logic Gates - AlgoWorld" 
        description="Interactive Logic Gates and Combinational Circuits Visualizer." 
        path="/logic-gates" 
      />
      <div className="logic-header">
        <h1>Logic Gates <Cpu size={36} className="inline-icon" /></h1>
        <p className="subtitle">Visualize boolean logic, half adders, full adders, and multiplexers.</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <Button 
            variant={viewMode === 'prefab' ? 'primary' : 'outline'} 
            onClick={() => setViewMode('prefab')}
          >
            Pre-Fab Circuits
          </Button>
          <Button 
            variant={viewMode === 'custom' ? 'primary' : 'outline'} 
            onClick={() => setViewMode('custom')}
          >
            Custom Sandbox
          </Button>
        </div>
      </div>

      {viewMode === 'prefab' ? (
        <div className="logic-layout">
          <div className="logic-sidebar">
            <Card className="controls-card">
              <h3>Configuration</h3>
              
              <div className="input-group mb-4">
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Circuit:</div>
                <select 
                  value={circuitType} 
                  onChange={handleCircuitChange}
                  className="logic-input mb-4"
                >
                  {circuits.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="divider"></div>

              <div style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem'}}>
                <Info size={14} style={{display: 'inline', marginRight: '5px'}}/>
                Click the input nodes on the diagram (A, B, Cin) to toggle their states.
              </div>

              <Button variant="outline" onClick={() => setIsCodeModalOpen(true)} className="w-full flex-center gap-2">
                <Code size={16} /> View Truth Table
              </Button>
            </Card>
          </div>
          
          <div className="logic-main">
            <Card className="logic-card">
              <div className="logic-status-bar">
                Output Status: {evals.Out !== undefined ? evals.Out : (evals.Sum !== undefined ? `Sum: ${evals.Sum} | Carry: ${evals.Carry !== undefined ? evals.Carry : evals.CarryOut}` : '...')}
              </div>
              
              <div className="logic-circuit-container">
                <svg 
                  viewBox="0 0 800 400"
                  preserveAspectRatio="xMidYMid meet"
                  className="logic-svg"
                >
                  {/* Background grid pattern */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1" fill="rgba(255, 255, 255, 0.05)" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {renderCircuit()}
                </svg>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="logic-layout" style={{ display: 'block' }}>
          <Card className="logic-card" style={{ padding: '0', background: 'var(--bg-primary)' }}>
            <LogicCanvas />
          </Card>
        </div>
      )}

      {/* EDUCATIONAL GUIDE */}
      <div className="edu-guide-container">
        <div className="edu-guide-header">
          <h2>Logic Gates & Circuits</h2>
        </div>

        <div className="edu-section">
          <h3>The Core Concept: Transistors</h3>
          <p>Logic gates aren't magic. Under the hood, they are just microscopic electronic switches called <strong>Transistors</strong>. By wiring a few transistors together, we can create basic "if/then" logic rules based purely on electricity flowing (1) or not flowing (0).</p>
        </div>

        <div className="edu-section">
          <h3>Basic Gates</h3>
          <ul>
            <li><strong>AND Gate:</strong> Only outputs electricity if BOTH inputs have electricity.</li>
            <li><strong>OR Gate:</strong> Outputs electricity if AT LEAST ONE input has electricity.</li>
            <li><strong>XOR Gate:</strong> Outputs electricity if the inputs are DIFFERENT. It strictly means "One or the other, but NOT both."</li>
            <li><strong>NOT Gate:</strong> An inverter. It outputs electricity if the input is OFF, and shuts down if the input is ON.</li>
          </ul>
        </div>

        <div className="edu-section">
          <h3>Combinational Circuits</h3>
          <p>By chaining these simple gates together, we can do complex math without writing any code:</p>
          <ul>
            <li><strong>Half Adder:</strong> Wires an XOR gate and an AND gate together. This allows the computer to add two binary digits and calculate a "Carry" bit, just like you do in grade school math when adding 9 + 5.</li>
            <li><strong>Full Adder:</strong> Links two Half Adders together to factor in a Carry-In from a previous addition. String 32 of these together, and you have the Arithmetic Logic Unit (ALU) that sits inside a modern CPU!</li>
            <li><strong>Multiplexer (MUX):</strong> A digital railroad switch. It uses a "Selector" pin to decide which input channel gets sent to the output. Useful for routing data across the motherboard.</li>
          </ul>
        </div>
      </div>
      
      <CodeModal 
        isOpen={isCodeModalOpen} 
        onClose={() => setIsCodeModalOpen(false)} 
        code={logicSnippets[circuitType] || '// No snippet available.'} 
        title={`${circuits.find(c => c.id === circuitType)?.name} Truth Table`} 
      />
    </div>
  );
};

export default LogicGatesVisualizer;
