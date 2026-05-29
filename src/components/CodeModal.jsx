import React, { useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import './CodeModal.css';

SyntaxHighlighter.registerLanguage('javascript', js);

const CodeModal = ({ isOpen, onClose, code, title }) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-modal-overlay" onClick={onClose}>
      <div className="code-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="code-modal-header">
          <h2 className="code-modal-title">{title} Source Code</h2>
          <div className="code-modal-actions">
            <button className="code-action-btn" onClick={handleCopy} title="Copy to clipboard">
              {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
            </button>
            <button className="code-action-btn close-btn" onClick={onClose} title="Close">
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="code-modal-body">
          <SyntaxHighlighter 
            language="javascript" 
            style={atomOneDark}
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              background: 'transparent',
              fontSize: '0.9rem',
              lineHeight: '1.5',
              fontFamily: '"Fira Code", monospace'
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

export default CodeModal;
