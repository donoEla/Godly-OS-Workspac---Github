import React, { useState, useEffect, useRef } from 'react';
import { Play, Terminal, Code2, Eye, FileCode, RotateCcw, Save, Sparkles } from 'lucide-react';
import { sound } from '../../utils/sound';

interface VirtualFile {
  name: string;
  type: 'file' | 'dir';
  content?: string;
  children?: Record<string, VirtualFile>;
}

const DEFAULT_CODE = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      background: radial-gradient(circle at 50% 50%, #1e1035, #080810);
      color: #fff;
      font-family: 'Inter', system-ui, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      overflow: hidden;
    }
    .card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 32px 48px;
      border-radius: 24px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      backdrop-filter: blur(20px);
      text-align: center;
    }
    h1 {
      margin: 0 0 10px;
      font-size: 28px;
      background: linear-gradient(135deg, #a855f7, #38bdf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p { color: rgba(255,255,255,0.7); margin: 0; font-size: 14px; }
    button {
      margin-top: 20px;
      padding: 10px 24px;
      border-radius: 12px;
      border: none;
      background: #8b5cf6;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }
    button:hover { transform: scale(1.05); }
  </style>
</head>
<body>
  <div class="card">
    <h1>Godly Code Studio</h1>
    <p>Live sandbox powered by Godly OS in-memory engine</p>
    <button onclick="alert('Hello from Godly OS Sandbox!')">Trigger Pulse</button>
  </div>
</body>
</html>`;

export const CodeEditorApp: React.FC = () => {
  const [code, setCode] = useState<string>(() => {
    return localStorage.getItem('godly_editor_code') || DEFAULT_CODE;
  });
  const [activeLang, setActiveLang] = useState<'html' | 'javascript' | 'css' | 'python'>('html');
  const [previewSrcDoc, setPreviewSrcDoc] = useState<string>(code);
  const [showTerminal, setShowTerminal] = useState<boolean>(true);
  const [splitWidth, setSplitWidth] = useState<number>(50); // 50% split

  // Terminal State
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'Godly OS Virtual Shell v2.4 (x86_64-godly-wasm)',
    'Type "help" to display available virtual commands.',
    '',
  ]);
  const [termInput, setTermInput] = useState<string>('');
  const [currentDir, setCurrentDir] = useState<string>('~/projects');
  const termEndRef = useRef<HTMLDivElement>(null);

  // In-memory Virtual Filesystem
  const vfs = useRef<Record<string, VirtualFile>>({
    '~': {
      name: '~',
      type: 'dir',
      children: {
        projects: {
          name: 'projects',
          type: 'dir',
          children: {
            'index.html': { name: 'index.html', type: 'file', content: DEFAULT_CODE },
            'main.js': { name: 'main.js', type: 'file', content: 'console.log("Godly OS v4.2 active");' },
            'notes.txt': { name: 'notes.txt', type: 'file', content: 'Godly OS Architecture Notes:\n- Zero Latency\n- Fluid Motion' },
          },
        },
      },
    },
  });

  // Debounced live preview update
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewSrcDoc(code);
      localStorage.setItem('godly_editor_code', code);
    }, 500);
    return () => clearTimeout(timer);
  }, [code]);

  // Handle Ctrl+S
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      setPreviewSrcDoc(code);
      sound.playSnap();
    }
  };

  // Virtual Shell Command Execution
  const executeCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const newHistory = [...terminalHistory, `${currentDir} $ ${trimmed}`];

    switch (cmd) {
      case 'help':
        newHistory.push(
          'Available commands:',
          '  ls           List files and directories in current path',
          '  cd <dir>     Change virtual directory (e.g. cd ~, cd ..)',
          '  pwd          Print current working directory',
          '  echo <txt>   Print text to console',
          '  cat <file>   Display file contents',
          '  clear        Clear virtual terminal screen',
          '  run          Execute current editor buffer in preview',
          '  help         Display this help message'
        );
        break;

      case 'clear':
        setTerminalHistory([]);
        setTermInput('');
        return;

      case 'pwd':
        newHistory.push(currentDir);
        break;

      case 'ls':
        newHistory.push('index.html   main.js   notes.txt   style.css');
        break;

      case 'cd':
        if (!args[0] || args[0] === '~') {
          setCurrentDir('~');
        } else if (args[0] === '..') {
          setCurrentDir('~');
        } else {
          setCurrentDir(`~/${args[0].replace('/', '')}`);
        }
        break;

      case 'echo':
        newHistory.push(args.join(' '));
        break;

      case 'cat':
        if (args[0] === 'index.html') {
          newHistory.push(code.slice(0, 300) + '... (truncated)');
        } else if (args[0] === 'notes.txt') {
          newHistory.push('Godly OS Architecture Notes:\n- Zero Latency\n- Fluid Motion');
        } else {
          newHistory.push(`cat: ${args[0]}: No such file or directory`);
        }
        break;

      case 'run':
        setPreviewSrcDoc(code);
        newHistory.push('Buffer deployed to live sandbox preview.');
        sound.playSnap();
        break;

      default:
        newHistory.push(`godly-sh: command not found: ${cmd}. Type 'help' for commands.`);
        break;
    }

    newHistory.push('');
    setTerminalHistory(newHistory);
    setTermInput('');
    setTimeout(() => {
      termEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="h-full w-full flex flex-col bg-[#0b0c14] text-white select-none overflow-hidden font-sans">
      {/* Top Studio Toolbar */}
      <div className="h-10 px-4 bg-black/40 border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-xs font-semibold text-purple-300">
            <FileCode size={14} />
            <span>index.html</span>
          </div>

          <div className="flex items-center gap-1 bg-black/30 p-0.5 rounded-lg border border-white/5">
            {(['html', 'javascript', 'css', 'python'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors uppercase ${
                  activeLang === lang ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white/80'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setPreviewSrcDoc(code);
              sound.playSnap();
            }}
            className="px-3 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shadow-lg"
          >
            <Play size={12} fill="currentColor" />
            <span>Run (Ctrl+S)</span>
          </button>

          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all ${
              showTerminal
                ? 'bg-purple-600/30 border-purple-500/40 text-purple-300'
                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
            }`}
          >
            <Terminal size={12} />
            <span>Virtual Shell</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Section */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Pane: Code Editor */}
        <div
          className="h-full flex overflow-hidden border-r border-white/10 relative"
          style={{ width: `${splitWidth}%` }}
        >
          {/* Line Numbers */}
          <div className="w-12 bg-black/30 border-r border-white/5 py-4 px-2 text-right select-none font-mono text-xs text-white/20 overflow-hidden">
            {lineNumbers.map((num) => (
              <div key={num} className="leading-6">
                {num}
              </div>
            ))}
          </div>

          {/* Textarea Editor */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="flex-1 h-full bg-transparent p-4 text-xs font-mono text-emerald-300 leading-6 resize-none focus:outline-none overflow-auto selection:bg-purple-600/40"
            style={{ tabSize: 2 }}
          />
        </div>

        {/* Resize Split Handle */}
        <div
          onPointerDown={(e) => {
            const startX = e.clientX;
            const startWidth = splitWidth;
            const onMove = (moveEvt: PointerEvent) => {
              const delta = ((moveEvt.clientX - startX) / window.innerWidth) * 100;
              setSplitWidth(Math.max(25, Math.min(75, startWidth + delta)));
            };
            const onUp = () => {
              window.removeEventListener('pointermove', onMove);
              window.removeEventListener('pointerup', onUp);
            };
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
          }}
          className="w-1.5 bg-white/5 hover:bg-purple-500/50 cursor-col-resize transition-colors flex items-center justify-center z-10"
        />

        {/* Right Pane: Live Sandbox Preview */}
        <div className="flex-1 h-full flex flex-col bg-white overflow-hidden relative">
          <div className="h-6 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between select-none">
            <span className="text-[10px] font-mono text-slate-400">Sandbox Preview (sandboxed iframe)</span>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Engine Ready</span>
            </div>
          </div>
          <iframe
            srcDoc={previewSrcDoc}
            title="Sandbox Live Preview"
            sandbox="allow-scripts allow-modals allow-forms"
            className="flex-1 w-full border-none bg-white"
          />
        </div>
      </div>

      {/* Bottom Pane: Simulated Virtual Bash Terminal */}
      {showTerminal && (
        <div className="h-44 bg-black/90 border-t border-white/10 flex flex-col font-mono text-xs overflow-hidden flex-shrink-0">
          <div className="h-6 px-3 bg-white/5 border-b border-white/10 flex items-center justify-between text-white/50 text-[10px] select-none">
            <div className="flex items-center gap-2">
              <Terminal size={11} className="text-purple-400" />
              <span>godly-sh — Virtual In-Memory Filesystem</span>
            </div>
            <span>Press Enter to execute</span>
          </div>

          {/* Terminal History */}
          <div className="flex-1 p-3 overflow-y-auto space-y-1 select-text">
            {terminalHistory.map((line, idx) => (
              <div key={idx} className={line.startsWith('~') ? 'text-purple-400 font-semibold' : 'text-slate-300'}>
                {line}
              </div>
            ))}
            <div ref={termEndRef} />
          </div>

          {/* Terminal Prompt Input */}
          <div className="h-8 px-3 bg-black/60 border-t border-white/5 flex items-center gap-2">
            <span className="text-purple-400 font-bold">{currentDir} $</span>
            <input
              type="text"
              value={termInput}
              onChange={(e) => setTermInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  executeCommand(termInput);
                }
              }}
              placeholder="ls, cd, cat, echo, run, help..."
              className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};
