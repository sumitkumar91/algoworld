import { useState, useEffect } from 'react';
import { Cpu, Code, Clock, FastForward, Play, Square, Info } from 'lucide-react';
import SEO from '../components/SEO';
import Button from '../components/Button';
import Card from '../components/Card';
import CodeModal from '../components/CodeModal';
import { pipelineSnippets } from '../utils/codeSnippets';
import './PipelineVisualizer.css';
import '../components/EducationalGuide.css';

// ---------------------------
// DATA / SCENARIOS
// ---------------------------

const STAGES = ['IF', 'ID', 'EX', 'MEM', 'WB'];

const SCENARIOS = {
  ideal: {
    name: 'Ideal Pipeline (No Hazards)',
    desc: 'Perfect execution of independent instructions. IPC (Instructions Per Cycle) approaches 1.0.',
    instructions: [
      'LOAD R1, [100]',
      'ADD R2, R3, R4',
      'SUB R5, R6, R7',
      'STORE R8, [200]'
    ],
    getTimeline: () => [
      ['IF', 'ID', 'EX', 'MEM', 'WB', '', '', ''],
      ['', 'IF', 'ID', 'EX', 'MEM', 'WB', '', ''],
      ['', '', 'IF', 'ID', 'EX', 'MEM', 'WB', ''],
      ['', '', '', 'IF', 'ID', 'EX', 'MEM', 'WB']
    ]
  },
  data_stall: {
    name: 'Data Hazard (Stall / Bubble)',
    desc: 'SUB needs R1, but ADD doesn\'t write it to the register until the WB stage. The pipeline must stall.',
    instructions: [
      'ADD R1, R2, R3',
      'SUB R4, R1, R5',
      'AND R6, R7, R8'
    ],
    getTimeline: (forwardingEnabled) => {
      if (forwardingEnabled) {
        // With forwarding, result goes from EX/MEM straight to EX of SUB
        return [
          ['IF', 'ID', 'EX', 'MEM', 'WB', ''],
          ['', 'IF', 'ID', 'EX', 'MEM', 'WB'],
          ['', '', 'IF', 'ID', 'EX', 'MEM', 'WB']
        ];
      } else {
        // Stall 2 cycles in ID waiting for WB
        return [
          ['IF', 'ID', 'EX', 'MEM', 'WB', '', '', ''],
          ['', 'IF', 'ID', 'STALL', 'STALL', 'EX', 'MEM', 'WB'],
          ['', '', 'IF', 'STALL', 'STALL', 'ID', 'EX', 'MEM', 'WB']
        ];
      }
    }
  },
  branch: {
    name: 'Control Hazard (Branch Flush)',
    desc: 'The CPU fetches instructions linearly, but in EX it realizes it must jump. It flushes the wrong instructions.',
    instructions: [
      'JMP LABEL_X',
      'ADD R1, R2, R3 (Flushed)',
      'SUB R4, R5, R6 (Flushed)',
      'LOAD R7, [100] (Target)'
    ],
    getTimeline: () => [
      ['IF', 'ID', 'EX', 'MEM', 'WB', '', '', ''],
      ['', 'IF', 'ID', 'FLUSH', '', '', '', ''],
      ['', '', 'IF', 'FLUSH', '', '', '', ''],
      ['', '', '', 'IF', 'ID', 'EX', 'MEM', 'WB']
    ]
  }
};

// ---------------------------
// COMPONENT
// ---------------------------

const PipelineVisualizer = () => {
  const [activeScenario, setActiveScenario] = useState('ideal');
  const [forwarding, setForwarding] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const scenario = SCENARIOS[activeScenario];
  const timeline = scenario.getTimeline(forwarding);
  const totalCycles = timeline[0].length;

  useEffect(() => {
    let timeout;
    if (isPlaying) {
      timeout = setTimeout(() => {
        if (cycle < totalCycles - 1) {
          setCycle(c => c + 1);
        } else {
          setIsPlaying(false);
        }
      }, 800);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, cycle, totalCycles]);

  const reset = () => {
    setCycle(0);
    setIsPlaying(false);
  };

  const handleScenarioChange = (e) => {
    setActiveScenario(e.target.value);
    setCycle(0);
    setIsPlaying(false);
  };

  const handleForwardingToggle = () => {
    setForwarding(!forwarding);
    setCycle(0);
    setIsPlaying(false);
  };

  // Determine what is currently in each hardware stage
  // Hardware stages: IF, ID, EX, MEM, WB
  // We scan the timeline column for the current cycle to see which instruction is in which stage.
  const getHardwareState = () => {
    const hw = { IF: null, ID: null, EX: null, MEM: null, WB: null };
    
    for (let i = 0; i < scenario.instructions.length; i++) {
      const stateInCycle = timeline[i][cycle];
      if (stateInCycle && STAGES.includes(stateInCycle)) {
        hw[stateInCycle] = scenario.instructions[i];
      }
    }
    return hw;
  };

  const hwState = getHardwareState();

  return (
    <div className="container animate-fade-in pipeline-page-container">
      <SEO 
        title="CPU Pipeline - AlgoWorld" 
        description="Visualize a 5-Stage CPU Instruction Pipeline, Data Hazards, and Branch Predictions." 
        path="/pipeline" 
      />
      
      <div className="pipeline-header">
        <h1>CPU Pipeline <Cpu size={36} className="inline-icon" /></h1>
        <p className="subtitle">Watch instructions flow through the 5-Stage RISC architecture.</p>
      </div>

      <div className="pipeline-layout">
        
        {/* SIDEBAR */}
        <div className="pipeline-sidebar">
          <Card className="controls-card">
            <h3>Pipeline Scenarios</h3>
            
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', marginTop: '1rem' }}>Select Scenario:</div>
            <select className="pipeline-select" value={activeScenario} onChange={handleScenarioChange}>
              {Object.entries(SCENARIOS).map(([key, s]) => (
                <option key={key} value={key}>{s.name}</option>
              ))}
            </select>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              {scenario.desc}
            </p>

            {activeScenario === 'data_stall' && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Data Forwarding</span>
                  <input 
                    type="checkbox" 
                    checked={forwarding} 
                    onChange={handleForwardingToggle}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Bypass the WB stage and feed data directly from EX to EX to eliminate the stall bubble.
                </p>
              </div>
            )}

            <div className="divider"></div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>Clock Controls:</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Button 
                variant="primary" 
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex-1 flex-center"
                disabled={cycle >= totalCycles - 1 && !isPlaying}
              >
                {isPlaying ? <Square size={16} /> : <Play size={16} />}
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setCycle(c => Math.min(c + 1, totalCycles - 1))}
                className="flex-1 flex-center gap-1"
                disabled={cycle >= totalCycles - 1 || isPlaying}
              >
                Tick <FastForward size={14} />
              </Button>
              <Button 
                variant="outline" 
                onClick={reset}
                className="flex-center"
                title="Reset Clock"
              >
                Reset
              </Button>
            </div>

            <Button variant="outline" onClick={() => setIsCodeModalOpen(true)} className="w-full flex-center gap-2">
              <Info size={16} /> Pipelining Explained
            </Button>
          </Card>
        </div>
        
        {/* MAIN VISUALS */}
        <div className="pipeline-main">
          
          {/* Hardware Diagram */}
          <Card className="hardware-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3>5-Stage CPU Architecture</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-header)', color: '#00e5ff' }}>
                <Clock size={18} /> Clock Cycle: {cycle}
              </div>
            </div>
            
            <div className="hardware-stages">
              {STAGES.map(stage => {
                const instr = hwState[stage];
                return (
                  <div key={`hw-${stage}`} className="hw-stage-container">
                    <div className={`hw-stage-box stage-${stage.toLowerCase()} ${instr ? 'active' : ''}`}>
                      <span className="hw-instr-text">{instr || '-'}</span>
                    </div>
                    <div className="hw-stage-label">{stage}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Timeline Grid */}
          <Card className="timeline-panel">
            <h3 style={{ marginBottom: '1.5rem' }}>Pipeline Timeline Grid</h3>
            
            <div 
              className="timeline-grid" 
              style={{ gridTemplateColumns: `150px repeat(${totalCycles}, 1fr)` }}
            >
              {/* Header Row */}
              <div className="timeline-header-row">
                <div className="timeline-cell timeline-header-cell" style={{ justifyContent: 'flex-start', paddingLeft: '1rem' }}>
                  Instruction
                </div>
                {Array.from({length: totalCycles}).map((_, i) => (
                  <div 
                    key={`th-${i}`} 
                    className="timeline-cell timeline-header-cell"
                    style={i === cycle ? { color: '#00e5ff', background: 'rgba(0, 229, 255, 0.1)' } : {}}
                  >
                    CC {i}
                  </div>
                ))}
              </div>

              {/* Instruction Rows */}
              {scenario.instructions.map((instr, rIdx) => (
                <div key={`row-${rIdx}`} className="timeline-instr-row">
                  <div className="timeline-cell timeline-instr-cell" title={instr}>
                    {instr.split(' ')[0]} {instr.split(' ')[1]}
                  </div>
                  
                  {Array.from({length: totalCycles}).map((_, cIdx) => {
                    const state = timeline[rIdx][cIdx];
                    let cellClass = '';
                    if (state && STAGES.includes(state)) cellClass = `cell-${state}`;
                    if (state === 'STALL') cellClass = 'cell-STALL';
                    if (state === 'FLUSH') cellClass = 'cell-FLUSH';

                    // Dim future cycles
                    const isFuture = cIdx > cycle;
                    
                    return (
                      <div 
                        key={`cell-${rIdx}-${cIdx}`} 
                        className={`timeline-cell ${cellClass}`}
                        style={isFuture ? { opacity: 0.1, background: 'transparent', borderColor: 'rgba(255,255,255,0.05)' } : {}}
                      >
                        {!isFuture ? (state === 'FLUSH' ? 'X' : state) : ''}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>

      {/* EDUCATIONAL GUIDE */}
      <div className="edu-guide-container">
        <div className="edu-guide-header">
          <h2>CPU Instruction Pipeline</h2>
        </div>

        <div className="edu-section">
          <h3>The Laundry Analogy</h3>
          <p>Imagine doing 4 loads of laundry. If you wash, dry, fold, and put away Load 1 before even starting Load 2, it takes all day. But if you put Load 2 in the Washer as soon as Load 1 moves to the Dryer, you are <strong>pipelining</strong>. The CPU does the exact same thing. It splits instructions into 5 hardware stages: Fetch (IF), Decode (ID), Execute (EX), Memory (MEM), and Write-Back (WB). This allows 5 instructions to be processed at the exact same time.</p>
        </div>

        <div className="edu-section">
          <h3>Data Hazards & Stalling</h3>
          <p>Pipelining only works perfectly if every instruction is independent. But what if Instruction 2 needs the math result from Instruction 1? Instruction 2 has to stop and wait (Stall) for Instruction 1 to finish writing its result. The CPU injects empty bubbles into the pipeline while it waits.</p>
          <p><strong>The Fix (Data Forwarding):</strong> Instead of waiting for the calculation to be written completely back to RAM or Registers, the CPU uses a physical wire to shoot the calculation result directly from the Execute stage of Line 1 back into the Execute stage of Line 2.</p>
        </div>

        <div className="edu-section">
          <h3>Control Hazards (Branch Flushes)</h3>
          <p>The CPU is blindly fast and assumes code runs linearly. So it happily loads lines 2, 3, and 4 into the pipeline while line 1 is executing. But what if line 1 is an <code>IF</code> statement that jumps to line 100? The CPU just wasted time loading lines 2, 3, and 4. It has to throw them in the trash (Flush) and start over at line 100.</p>
          <p><strong>The Fix (Branch Prediction):</strong> Modern CPUs actually guess which way an <code>IF</code> statement will go based on past history, achieving over 95% accuracy and avoiding flushes almost entirely!</p>
        </div>
      </div>
      
      <CodeModal 
        isOpen={isCodeModalOpen} 
        onClose={() => setIsCodeModalOpen(false)} 
        code={pipelineSnippets.PIPELINE} 
        title="CPU Pipelining" 
      />
    </div>
  );
};

export default PipelineVisualizer;
