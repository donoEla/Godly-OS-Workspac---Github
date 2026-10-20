import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Delete, RotateCcw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { sound } from '../../utils/sound';

type Mode = 'standard' | 'scientific' | 'graphing';

export const CalculatorApp: React.FC = () => {
  const [mode, setMode] = useState<Mode>('scientific');
  const [display, setDisplay] = useState('0');
  const [formula, setFormula] = useState('');
  const [isRad, setIsRad] = useState(true);
  const [memory, setMemory] = useState(0);
  const [history, setHistory] = useState<string[]>([]);

  // Graphing mode state
  const [graphFunc, setGraphFunc] = useState('sin(x) * 2');
  const [zoom, setZoom] = useState(30);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleNum = (num: string) => {
    sound.playClick();
    setDisplay((prev) => (prev === '0' || prev === 'Error' ? num : prev + num));
  };

  const handleOp = (op: string) => {
    sound.playClick();
    setFormula((prev) => `${prev} ${display} ${op}`);
    setDisplay('0');
  };

  const handleClear = () => {
    sound.playClick();
    setDisplay('0');
    setFormula('');
  };

  const handleBackspace = () => {
    sound.playClick();
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const evaluateScientific = (funcName: string) => {
    sound.playClick();
    try {
      const val = parseFloat(display);
      let res = 0;
      switch (funcName) {
        case 'sin':
          res = isRad ? Math.sin(val) : Math.sin((val * Math.PI) / 180);
          break;
        case 'cos':
          res = isRad ? Math.cos(val) : Math.cos((val * Math.PI) / 180);
          break;
        case 'tan':
          res = isRad ? Math.tan(val) : Math.tan((val * Math.PI) / 180);
          break;
        case 'sqrt':
          res = Math.sqrt(val);
          break;
        case 'square':
          res = Math.pow(val, 2);
          break;
        case 'cube':
          res = Math.pow(val, 3);
          break;
        case 'ln':
          res = Math.log(val);
          break;
        case 'log10':
          res = Math.log10(val);
          break;
        case 'exp':
          res = Math.exp(val);
          break;
        case '1/x':
          res = 1 / val;
          break;
        case 'fact': {
          let f = 1;
          for (let i = 2; i <= Math.min(val, 100); i++) f *= i;
          res = f;
          break;
        }
        case 'abs':
          res = Math.abs(val);
          break;
        default:
          res = val;
      }
      const rounded = Math.round(res * 100000000) / 100000000;
      setDisplay(String(rounded));
      setHistory((prev) => [`${funcName}(${val}) = ${rounded}`, ...prev.slice(0, 8)]);
    } catch {
      setDisplay('Error');
    }
  };

  const handleEqual = () => {
    sound.playClick();
    try {
      let fullExpr = `${formula} ${display}`
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/%/g, '/100');

      const sanitized = fullExpr.replace(/[^0-9+\-*/().]/g, '');
      const result = Function(`"use strict"; return (${sanitized})`)();
      const rounded = Math.round(result * 100000000) / 100000000;
      setDisplay(String(rounded));
      setHistory((prev) => [`${formula} ${display} = ${rounded}`, ...prev.slice(0, 8)]);
      setFormula('');
    } catch {
      setDisplay('Error');
    }
  };

  // Safe expression evaluator for graphing
  const evalGraphExpr = useCallback(
    (expr: string, xVal: number): number => {
      try {
        let clean = expr
          .replace(/sin/g, 'Math.sin')
          .replace(/cos/g, 'Math.cos')
          .replace(/tan/g, 'Math.tan')
          .replace(/sqrt/g, 'Math.sqrt')
          .replace(/abs/g, 'Math.abs')
          .replace(/pi/gi, 'Math.PI')
          .replace(/e/gi, 'Math.E')
          .replace(/\^/g, '**');

        clean = clean.replace(/(\d)(x)/gi, '$1*$2');
        const fn = new Function('x', `"use strict"; return (${clean});`);
        return fn(xVal);
      } catch {
        return NaN;
      }
    },
    []
  );

  // Graph canvas draw effect
  useEffect(() => {
    if (mode !== 'graphing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 400;
    canvas.height = canvas.parentElement?.clientHeight || 300;

    const w = canvas.width;
    const h = canvas.height;
    const originX = w / 2;
    const originY = h / 2;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    for (let x = originX % zoom; x < w; x += zoom) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = originY % zoom; y < h; y += zoom) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(w, originY);
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, h);
    ctx.stroke();

    // Plot Function curve
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 8;
    ctx.beginPath();

    let started = false;
    for (let px = 0; px < w; px += 2) {
      const mathX = (px - originX) / zoom;
      const mathY = evalGraphExpr(graphFunc, mathX);
      if (!isNaN(mathY) && isFinite(mathY)) {
        const py = originY - mathY * zoom;
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      } else {
        started = false;
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [mode, graphFunc, zoom, evalGraphExpr]);

  return (
    <div className="flex flex-col h-full bg-[var(--window-glass)] backdrop-blur-2xl text-white select-none">
      {/* Mode Selector Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-black/40 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/10 shadow-inner">
          {(['standard', 'scientific', 'graphing'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                sound.playClick();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                mode === m
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 border border-white/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {mode === 'scientific' && (
          <button
            onClick={() => setIsRad(!isRad)}
            className="px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-purple-300 font-mono border border-white/10"
          >
            {isRad ? 'RAD' : 'DEG'}
          </button>
        )}
      </div>

      {mode !== 'graphing' ? (
        <div className="flex-1 flex flex-col p-4 justify-between">
          {/* OLED Display Screen */}
          <div className="bg-black/50 backdrop-blur-2xl rounded-2xl p-4 mb-3 border border-white/15 flex flex-col justify-end text-right min-h-[96px] shadow-[inset_0_2px_8px_rgba(0,0,0,0.7)] relative overflow-hidden">
            <div className="text-xs font-mono text-purple-400/80 tracking-wider overflow-hidden text-ellipsis h-5">
              {formula}
            </div>
            <div className="text-3xl font-mono font-bold tracking-tight text-white overflow-x-auto whitespace-nowrap">
              {display}
            </div>
          </div>

          {/* Scientific Extended Pad */}
          {mode === 'scientific' && (
            <div className="grid grid-cols-4 gap-1.5 mb-2 text-xs font-medium font-mono">
              {['sin', 'cos', 'tan', 'sqrt', 'ln', 'log10', 'square', 'fact'].map((fn) => (
                <button
                  key={fn}
                  onClick={() => evaluateScientific(fn)}
                  className="py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] text-purple-300 border border-white/10 backdrop-blur-md transition-all active:scale-95 shadow-sm"
                >
                  {fn === 'sqrt' ? '√x' : fn === 'square' ? 'x²' : fn === 'fact' ? 'n!' : fn}
                </button>
              ))}
            </div>
          )}

          {/* Standard Keypad Matrix */}
          <div className="grid grid-cols-4 gap-2 text-base font-semibold">
            <button
              onClick={handleClear}
              className="py-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.16] text-rose-400 border border-white/10 backdrop-blur-md transition-all active:scale-95 shadow-sm"
            >
              C
            </button>
            <button
              onClick={handleBackspace}
              className="py-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.16] text-amber-400 border border-white/5 transition-all active:scale-95 flex items-center justify-center"
            >
              <Delete size={18} />
            </button>
            <button
              onClick={() => handleOp('%')}
              className="py-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.16] text-white/80 border border-white/5 transition-all active:scale-95"
            >
              %
            </button>
            <button
              onClick={() => handleOp('÷')}
              className="py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold border border-amber-400 transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
            >
              ÷
            </button>

            {['7', '8', '9'].map((n) => (
              <button
                key={n}
                onClick={() => handleNum(n)}
                className="py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.14] text-white border border-white/5 transition-all active:scale-95 shadow-sm"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => handleOp('×')}
              className="py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold border border-amber-400 transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
            >
              ×
            </button>

            {['4', '5', '6'].map((n) => (
              <button
                key={n}
                onClick={() => handleNum(n)}
                className="py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.14] text-white border border-white/5 transition-all active:scale-95 shadow-sm"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => handleOp('-')}
              className="py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold border border-amber-400 transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
            >
              −
            </button>

            {['1', '2', '3'].map((n) => (
              <button
                key={n}
                onClick={() => handleNum(n)}
                className="py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.14] text-white border border-white/5 transition-all active:scale-95 shadow-sm"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => handleOp('+')}
              className="py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold border border-amber-400 transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
            >
              +
            </button>

            <button
              onClick={() => handleNum('0')}
              className="col-span-2 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.14] text-white border border-white/5 transition-all active:scale-95 shadow-sm"
            >
              0
            </button>
            <button
              onClick={() => handleNum('.')}
              className="py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.14] text-white border border-white/5 transition-all active:scale-95 shadow-sm"
            >
              .
            </button>
            <button
              onClick={handleEqual}
              className="py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold border border-purple-400 transition-all active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              =
            </button>
          </div>
        </div>
      ) : (
        /* Interactive Graphing Mode */
        <div className="flex-1 flex flex-col p-4">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={graphFunc}
              onChange={(e) => setGraphFunc(e.target.value)}
              placeholder="e.g. sin(x) * 2"
              className="flex-1 bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-purple-300 font-mono outline-none"
            />
            <button
              onClick={() => setZoom((z) => Math.min(80, z + 5))}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(10, z - 5))}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5"
            >
              <ZoomOut size={14} />
            </button>
          </div>
          <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/10">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>
        </div>
      )}
    </div>
  );
};
