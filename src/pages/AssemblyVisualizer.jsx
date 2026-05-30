import { useState, useEffect, useRef } from 'react';
import { Cpu, Code, Play, StepForward, RotateCcw, AlertCircle, Info } from 'lucide-react';
import SEO from '../components/SEO';
import Button from '../components/Button';
import Card from '../components/Card';
import CodeModal from '../components/CodeModal';
import { assemblySnippets } from '../utils/codeSnippets';
import './AssemblyVisualizer.css';

const DEFAULT_CODE = `; Multiply R1 by 2, five times
MOV R0, 5
MOV R1, 1

; --- Loop Start (Line 5) ---
ADD R1, R1
SUB R0, 1
JNZ R0, 5

; Store result in memory slot 10
STORE R1, 10`;

const AssemblyVisualizer = () => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  
  // CPU State
  const [registers, setRegisters] = useState({ R0: 0, R1: 0, R2: 0, R3: 0, PC: 0 });
  const [memory, setMemory] = useState(Array(16).fill(0));
  
  // Visuals & Status
  const [error, setError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [updatedReg, setUpdatedReg] = useState(null);
  const [updatedMem, setUpdatedMem] = useState(null);

  const textareaRef = useRef(null);

  const resetCPU = () => {
    setRegisters({ R0: 0, R1: 0, R2: 0, R3: 0, PC: 0 });
    setMemory(Array(16).fill(0));
    setError(null);
    setUpdatedReg(null);
    setUpdatedMem(null);
    setIsRunning(false);
  };

  const handleCodeChange = (e) => {
    setCode(e.target.value);
    resetCPU();
  };

  // Helper to sync textarea scroll with line numbers
  const [scrollTop, setScrollTop] = useState(0);
  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  const lines = code.split('\n');

  // Parse and execute one instruction
  const executeStep = () => {
    if (registers.PC >= lines.length) {
      setIsRunning(false);
      return false; // Program finished
    }

    const currentLine = lines[registers.PC].trim();
    let nextPC = registers.PC + 1;
    let newRegs = { ...registers };
    let newMem = [...memory];
    let justUpdatedReg = null;
    let justUpdatedMem = null;
    let currentError = null;

    // Ignore empty lines and comments
    if (currentLine === '' || currentLine.startsWith(';') || currentLine.startsWith('//')) {
      setRegisters({ ...newRegs, PC: nextPC });
      setUpdatedReg(null);
      setUpdatedMem(null);
      return true;
    }

    try {
      const parts = currentLine.replace(/,/g, ' ').split(/\s+/).filter(p => p.length > 0);
      const opcode = parts[0].toUpperCase();
      const arg1 = parts[1];
      const arg2 = parts[2];

      const getValue = (arg) => {
        if (arg in newRegs) return newRegs[arg];
        const val = parseInt(arg, 10);
        if (isNaN(val)) throw new Error(`Invalid argument: ${arg}`);
        return val;
      };

      const setRegister = (reg, val) => {
        if (!(reg in newRegs) || reg === 'PC') throw new Error(`Invalid register: ${reg}`);
        newRegs[reg] = Math.max(0, Math.min(255, val)); // 8-bit clamp
        justUpdatedReg = reg;
      };

      switch (opcode) {
        case 'MOV':
          setRegister(arg1, getValue(arg2));
          break;
        case 'ADD':
          setRegister(arg1, getValue(arg1) + getValue(arg2));
          break;
        case 'SUB':
          setRegister(arg1, getValue(arg1) - getValue(arg2));
          break;
        case 'LOAD': {
          const addr = getValue(arg2);
          if (addr < 0 || addr >= 16) throw new Error(`Memory Access Violation at ${addr}`);
          setRegister(arg1, newMem[addr]);
          justUpdatedMem = addr; // highlight read
          break;
        }
        case 'STORE': {
          const addr = getValue(arg2);
          if (addr < 0 || addr >= 16) throw new Error(`Memory Access Violation at ${addr}`);
          newMem[addr] = getValue(arg1);
          justUpdatedMem = addr;
          break;
        }
        case 'JMP': {
          const targetLine = getValue(arg1);
          nextPC = targetLine - 1; // 1-indexed to 0-indexed
          if (nextPC < 0 || nextPC >= lines.length) throw new Error(`Invalid Jump Target: Line ${targetLine}`);
          break;
        }
        case 'JNZ': {
          // JNZ reg, line
          if (getValue(arg1) !== 0) {
            const targetLine = getValue(arg2);
            nextPC = targetLine - 1;
            if (nextPC < 0 || nextPC >= lines.length) throw new Error(`Invalid Jump Target: Line ${targetLine}`);
          }
          break;
        }
        default:
          throw new Error(`Unknown instruction: ${opcode}`);
      }

      newRegs.PC = nextPC;
      setRegisters(newRegs);
      setMemory(newMem);
      setUpdatedReg(justUpdatedReg);
      setUpdatedMem(justUpdatedMem);
      setError(null);
      return true;

    } catch (err) {
      setError(`Line ${registers.PC + 1}: ${err.message}`);
      setIsRunning(false);
      return false;
    }
  };

  // Run loop
  useEffect(() => {
    let timeout;
    if (isRunning) {
      timeout = setTimeout(() => {
        const canContinue = executeStep();
        if (!canContinue) setIsRunning(false);
      }, 500); // 500ms delay per instruction
    }
    return () => clearTimeout(timeout);
  }, [isRunning, registers.PC, memory]);

  return (
    <div className="container animate-fade-in assembly-page-container">
      <SEO 
        title="Assembly Sandbox - AlgoWorld" 
        description="Write and execute Assembly Language code in a virtual CPU." 
        path="/assembly" 
      />
      
      <div className="assembly-header">
        <h1>Assembly Sandbox <Cpu size={36} className="inline-icon" /></h1>
        <p className="subtitle">Write raw CPU instructions and watch the hardware respond.</p>
      </div>

      <div className="assembly-layout">
        
        {/* Editor Panel */}
        <div className="assembly-editor-container">
          <div className="assembly-editor-header">
            <span>assembly.asm</span>
            <Button variant="ghost" className="p-1 h-auto text-cyan-400 hover:text-cyan-300" onClick={() => setIsCodeModalOpen(true)}>
              <Info size={16} /> ISA Specs
            </Button>
          </div>
          
          <div className="assembly-editor-content">
            <div className="assembly-line-numbers" style={{ transform: `translateY(-${scrollTop}px)` }}>
              {lines.map((_, i) => (
                <div key={i} className={`assembly-line-number ${i === registers.PC ? 'active' : ''}`}>
                  {i + 1}
                </div>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              className="assembly-textarea"
              value={code}
              onChange={handleCodeChange}
              onScroll={handleScroll}
              spellCheck="false"
            />
          </div>

          <div className="assembly-controls">
            <Button 
              variant="primary" 
              onClick={() => setIsRunning(!isRunning)}
              className="flex-1 flex-center gap-2"
              style={isRunning ? { background: 'rgba(255, 23, 68, 0.2)', color: '#ff1744', borderColor: '#ff1744' } : {}}
            >
              {isRunning ? 'Pause' : <><Play size={16} /> Run</>}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => executeStep()}
              disabled={isRunning || registers.PC >= lines.length}
              className="flex-1 flex-center gap-2"
            >
              <StepForward size={16} /> Step
            </Button>
            <Button 
              variant="outline" 
              onClick={resetCPU}
              className="flex-center"
              title="Reset CPU"
            >
              <RotateCcw size={16} />
            </Button>
          </div>

          {error && (
            <div className="assembly-error flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}
        </div>

        {/* Visuals Panel */}
        <div className="assembly-main">
          <Card className="float-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>CPU Status</h3>
            
            <div className="assembly-visuals-grid">
              
              {/* Registers */}
              <div className="registers-panel">
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Registers (8-bit)</div>
                {['R0', 'R1', 'R2', 'R3', 'PC'].map(reg => (
                  <div key={reg} className={`register-card ${updatedReg === reg ? 'updated' : ''} ${reg === 'PC' ? 'mt-4' : ''}`}>
                    <span className="register-label">{reg}</span>
                    <span className="register-value" style={reg === 'PC' ? { color: '#ff4081' } : {}}>
                      {registers[reg]}
                    </span>
                  </div>
                ))}
              </div>

              {/* Memory Grid */}
              <div className="memory-panel">
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>RAM (16 bytes)</div>
                <div className="memory-grid">
                  {memory.map((val, idx) => (
                    <div key={idx} className={`memory-cell ${updatedMem === idx ? 'updated' : ''}`}>
                      <span className="memory-address">M{idx}</span>
                      <span className="memory-value">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </Card>
        </div>

      </div>

      <CodeModal 
        isOpen={isCodeModalOpen} 
        onClose={() => setIsCodeModalOpen(false)} 
        code={assemblySnippets.ISA} 
        title="Instruction Set Architecture (ISA)" 
      />
    </div>
  );
};

export default AssemblyVisualizer;
