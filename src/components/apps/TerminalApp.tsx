import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { AppId } from '../../types/os';
import { sound } from '../../utils/sound';
import { Terminal, Sparkles, RefreshCw, Layers, ShieldCheck, Play } from 'lucide-react';

interface HistoryLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'art';
  text: string;
}

export const TerminalApp: React.FC = () => {
  const { 
    fileSystem, 
    createFile, 
    createFolder, 
    deleteFileItem, 
    openApp, 
    settings, 
    toggleTheme, 
    updateSettings,
    panicCloak
  } = useOS();

  const [currentPath, setCurrentPath] = useState<string>('/home/god');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>('documents');
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<HistoryLine[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const [isMatrixMode, setIsMatrixMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'shell' | 'fastfetch' | 'matrix'>('shell');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  // Initial welcome message + fastfetch
  useEffect(() => {
    runCommand('godlyfetch');
  }, []);

  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const addLine = (type: HistoryLine['type'], text: string) => {
    setHistory((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, type, text }]);
  };

  const godlyFetchArt = `
      /\\         OS: Godly OS 2.4.0 (Divine Edition)
     /  \\        Kernel: 6.12.0-godly-lux x86_64
    / /\\ \\       Host: Browser WebAssembly Compositor
   / /  \\ \\      Uptime: ${Math.floor(performance.now() / 60000)}m ${(Math.floor(performance.now() / 1000) % 60)}s
  / /    \\ \\     Packages: 8 (AppStore, Calc, Files, Games, Notes, Settings, Spotify, Terminal)
 / / /\\   \\ \\    Shell: godly-sh 5.2 (Starship Prompt)
/_/ /  \\   \\_\\   Resolution: ${window.innerWidth}x${window.innerHeight}
\\ \\/ /\\ \\  / /   WM: Godly Motion Compositor 120 FPS
 \\  /  \\ \\/ /    Theme: ${settings.theme.toUpperCase()} (${settings.accentColor})
  \\/    \\  /     Memory: 4120MiB / 16384MiB (Simulated)
         \\/      CPU: WebAssembly Engine (16) @ 4.80GHz
`;

  const runCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    addLine('input', `${trimmed}`);
    setCmdHistory((prev) => [...prev, trimmed]);
    setHistoryPointer(-1);

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'help':
        addLine('output', `Available Godly OS Terminal Commands:`);
        addLine('output', `  godlyfetch / neofetch - Display divine system info & ASCII art`);
        addLine('output', `  ls [dir]              - List files and directories`);
        addLine('output', `  cd <dir>              - Change current directory`);
        addLine('output', `  pwd                   - Print working directory`);
        addLine('output', `  cat <file>            - View file contents`);
        addLine('output', `  mkdir <name>          - Create a new directory`);
        addLine('output', `  touch <name>          - Create a new file`);
        addLine('output', `  rm <name>             - Remove a file or directory`);
        addLine('output', `  open <app>            - Launch an OS application (spotify, notes, calc, games, etc.)`);
        addLine('output', `  tour / tutorial       - Start the interactive OS feature showcase`);
        addLine('output', `  cmatrix               - Enter the digital falling code matrix`);
        addLine('output', `  top / htop            - Interactive simulated process monitor`);
        addLine('output', `  theme [dark|light]    - Toggle or set OS theme`);
        addLine('output', `  calc <expression>     - Evaluate math expression`);
        addLine('output', `  echo <text>           - Print text`);
        addLine('output', `  panic                 - Emergency disguise to Google Classroom`);
        addLine('output', `  clear / cls           - Clear terminal screen`);
        break;

      case 'tour':
      case 'tutorial':
      case 'showcase':
        window.dispatchEvent(new CustomEvent('godly-open-tutorial'));
        addLine('success', 'Starting interactive Godly OS onboarding tour and feature showcase...');
        break;

      case 'godlyfetch':
      case 'neofetch':
      case 'fastfetch':
        addLine('art', godlyFetchArt);
        break;

      case 'clear':
      case 'cls':
        setHistory([]);
        break;

      case 'pwd':
        addLine('output', currentPath);
        break;

      case 'whoami':
        addLine('output', 'god (Supreme Administrator)');
        break;

      case 'date':
        addLine('output', new Date().toString());
        break;

      case 'echo':
        addLine('output', args.join(' '));
        break;

      case 'panic':
        addLine('success', 'Triggering panic disguise...');
        panicCloak();
        break;

      case 'calc':
        try {
          const expr = args.join(' ');
          // Safe math evaluator
          const sanitized = expr.replace(/[^0-9+\-*/().]/g, '');
          const res = Function(`"use strict"; return (${sanitized})`)();
          addLine('success', `= ${res}`);
        } catch {
          addLine('error', 'Invalid mathematical expression.');
        }
        break;

      case 'theme':
        if (args[0] === 'dark' || args[0] === 'light') {
          updateSettings({ theme: args[0] });
          addLine('success', `Theme switched to ${args[0]}.`);
        } else {
          toggleTheme();
          addLine('success', `Theme toggled.`);
        }
        break;

      case 'open':
        if (!args[0]) {
          addLine('error', 'Usage: open <app-name> (e.g., spotify, notes, games, calculator, settings)');
        } else {
          const map: Record<string, AppId> = {
            zen: 'zen',
            browser: 'zen',
            spotify: 'spotify',
            music: 'spotify',
            notes: 'notes',
            files: 'file-manager',
            filemanager: 'file-manager',
            calc: 'calculator',
            calculator: 'calculator',
            games: 'games',
            arcade: 'games',
            store: 'app-store',
            appstore: 'app-store',
            settings: 'settings',
            terminal: 'terminal',
          };
          const target = map[args[0].toLowerCase()];
          if (target) {
            openApp(target);
            addLine('success', `Launched ${args[0]} application.`);
          } else {
            addLine('error', `Unknown application: ${args[0]}. Valid apps: spotify, notes, games, calculator, store, settings, files`);
          }
        }
        break;

      case 'cmatrix':
      case 'matrix':
        setIsMatrixMode(true);
        break;

      case 'top':
      case 'htop':
        addLine('art', `
PID  USER     PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
  1  god      20   0  712.4m  82.1m  44.2m S   1.2   0.5   0:14.28 godly-wm
 42  god      20   0  324.0m  42.0m  28.0m S   0.8   0.3   0:08.12 ambient-synth
 89  god      20   0  180.2m  31.4m  18.2m S   0.4   0.2   0:02.44 sw-proxy-mgr
104  god      20   0  412.8m  96.0m  52.1m S   2.1   0.6   0:19.82 arcade-stream
210  god      20   0   98.4m  14.2m   8.1m R   0.0   0.1   0:00.08 htop-daemon
        `);
        break;

      case 'ls': {
        const items = fileSystem.filter((f) => f.parentId === currentFolderId);
        if (items.length === 0) {
          addLine('output', '(empty directory)');
        } else {
          const list = items
            .map((item) => (item.type === 'folder' ? `📁 \x1b[34m${item.name}/\x1b[0m` : `📄 ${item.name} (${item.size || '1 KB'})`))
            .join('    ');
          addLine('output', list.replace(/\x1b\[[0-9;]*m/g, ''));
        }
        break;
      }

      case 'mkdir': {
        if (!args[0]) {
          addLine('error', 'mkdir: missing directory operand');
        } else {
          createFolder(currentFolderId, args[0]);
          addLine('success', `Created directory: ${args[0]}`);
        }
        break;
      }

      case 'touch': {
        if (!args[0]) {
          addLine('error', 'touch: missing file operand');
        } else {
          createFile(currentFolderId, args[0], '');
          addLine('success', `Created file: ${args[0]}`);
        }
        break;
      }

      case 'rm': {
        if (!args[0]) {
          addLine('error', 'rm: missing operand');
        } else {
          const item = fileSystem.find((f) => f.parentId === currentFolderId && f.name === args[0]);
          if (item) {
            deleteFileItem(item.id);
            addLine('success', `Removed '${args[0]}'`);
          } else {
            addLine('error', `rm: cannot remove '${args[0]}': No such file or directory`);
          }
        }
        break;
      }

      case 'cat': {
        if (!args[0]) {
          addLine('error', 'cat: missing file operand');
        } else {
          const item = fileSystem.find((f) => f.parentId === currentFolderId && f.name === args[0]);
          if (!item) {
            addLine('error', `cat: ${args[0]}: No such file`);
          } else if (item.type === 'folder') {
            addLine('error', `cat: ${args[0]}: Is a directory`);
          } else {
            addLine('output', item.content || '(empty file)');
          }
        }
        break;
      }

      default:
        addLine('error', `godly-sh: command not found: ${cmd}. Type 'help' for available commands.`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      runCommand(inputVal);
      setInputVal('');
      sound.playClick();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const nextIdx = historyPointer === -1 ? cmdHistory.length - 1 : Math.max(0, historyPointer - 1);
        setHistoryPointer(nextIdx);
        setInputVal(cmdHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cmdHistory.length > 0 && historyPointer !== -1) {
        const nextIdx = historyPointer + 1;
        if (nextIdx >= cmdHistory.length) {
          setHistoryPointer(-1);
          setInputVal('');
        } else {
          setHistoryPointer(nextIdx);
          setInputVal(cmdHistory[nextIdx]);
        }
      }
    }
  };

  // Matrix Rain Canvas Animation
  useEffect(() => {
    if (!isMatrixMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = '0123456789ABCDEFﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    const interval = setInterval(() => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#10b981';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }, 45);

    return () => clearInterval(interval);
  }, [isMatrixMode]);

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="relative flex flex-col h-full w-full bg-[var(--window-glass)] backdrop-blur-2xl text-[#e2e8f0] font-mono text-[13px] leading-relaxed select-text"
    >
      {/* Top Tab Bar & Quick Action Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-black/40 backdrop-blur-xl border-b border-white/10 shrink-0 select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs font-semibold text-purple-300">
            <Terminal size={12} className="text-purple-400" />
            <span>god@godly-os: ~</span>
          </div>
        </div>

        {/* Quick Toolbar Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => runCommand('godlyfetch')}
            className="px-2 py-0.5 rounded text-[11px] bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
          >
            fastfetch
          </button>
          <button
            onClick={() => runCommand('ls')}
            className="px-2 py-0.5 rounded text-[11px] bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
          >
            ls
          </button>
          <button
            onClick={() => setIsMatrixMode(true)}
            className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 transition-colors border border-emerald-500/20"
          >
            cmatrix
          </button>
          <button
            onClick={() => setHistory([])}
            className="px-2 py-0.5 rounded text-[11px] bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
          >
            clear
          </button>
        </div>
      </div>

      {isMatrixMode ? (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          <button
            onClick={() => setIsMatrixMode(false)}
            className="relative z-40 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-mono text-xs shadow-2xl transition-transform active:scale-95 border border-emerald-400"
          >
            Exit Matrix (ESC)
          </button>
        </div>
      ) : (
        <div className="flex-1 p-4 overflow-y-auto space-y-1">
          {/* History lines */}
          {history.map((line) => (
            <div key={line.id} className="whitespace-pre-wrap break-words">
              {line.type === 'input' && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30">
                    ⚡ godly-os
                  </span>
                  <span className="text-white/40">❯</span>
                  <span className="text-emerald-400 text-xs">{currentPath}</span>
                  <span className="text-white/40">❯</span>
                  <span className="text-white font-semibold">{line.text}</span>
                </div>
              )}
              {line.type === 'output' && (
                <div className="text-slate-300 pl-4 border-l border-white/5 my-0.5">{line.text}</div>
              )}
              {line.type === 'error' && (
                <div className="text-rose-400 pl-4 border-l border-rose-500/30 my-0.5 flex items-center gap-1.5">
                  <span>✖</span>
                  <span>{line.text}</span>
                </div>
              )}
              {line.type === 'success' && (
                <div className="text-emerald-400 pl-4 border-l border-emerald-500/30 my-0.5 flex items-center gap-1.5">
                  <span>✔</span>
                  <span>{line.text}</span>
                </div>
              )}
              {line.type === 'art' && (
                <div className="text-purple-300 leading-tight font-bold my-1 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  {line.text}
                </div>
              )}
            </div>
          ))}

          {/* Current Active Input Prompt */}
          <div className="flex items-center gap-2 pt-2">
            <span className="px-1.5 py-0.2 rounded bg-purple-500/25 text-purple-300 font-bold text-xs border border-purple-500/35 shrink-0">
              ⚡ godly-os
            </span>
            <span className="text-white/40">❯</span>
            <span className="text-emerald-400 text-xs shrink-0">{currentPath}</span>
            <span className="text-white/40">❯</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              spellCheck={false}
              className="flex-1 bg-transparent text-white focus:outline-none caret-purple-400 font-mono text-[13px]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
