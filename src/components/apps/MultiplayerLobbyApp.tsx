import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Copy,
  Check,
  Send,
  Gamepad2,
  Tv,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  Share2,
  Sparkles,
  Play,
  RotateCcw,
  Radio,
  ArrowRight
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { sound } from '../../utils/sound';

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export const MultiplayerLobbyApp: React.FC = () => {
  const { settings } = useOS();
  const username = settings.username || 'Godly User';

  // Room State
  const [roomId, setRoomId] = useState<string>(() => {
    // Check if URL hash has a room
    if (typeof window !== 'undefined' && window.location.hash.includes('room=')) {
      const match = window.location.hash.match(/room=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) return match[1];
    }
    return 'GODLY-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  });

  const [inputRoomId, setInputRoomId] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [peerConnected, setPeerConnected] = useState(false);
  const [peerName, setPeerName] = useState<string>('Remote Player');
  const [activeTab, setActiveTab] = useState<'chat' | 'pong' | 'tictactoe' | 'screen'>('chat');

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'System',
      text: 'P2P WebRTC Lobby initialized. Share your room code or link to connect directly without a central server.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: false,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Tic Tac Toe State
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [mySymbol, setMySymbol] = useState<'X' | 'O'>('X');
  const [turn, setTurn] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<string | null>(null);

  // Screen Share State
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Channels
  const broadcastRef = useRef<BroadcastChannel | null>(null);

  // Send message through channel
  const broadcastData = (type: string, payload: any) => {
    if (broadcastRef.current) {
      broadcastRef.current.postMessage({
        type,
        sender: username,
        payload,
        timestamp: Date.now(),
      });
    }
  };

  // Connect to BroadcastChannel (works for any tab / window with same roomId)
  useEffect(() => {
    try {
      const channel = new BroadcastChannel(`godly_p2p_${roomId}`);
      broadcastRef.current = channel;

      // Announce presence
      channel.postMessage({ type: 'PING', sender: username });

      channel.onmessage = (event) => {
        const { type, sender, payload } = event.data;
        if (sender === username) return; // ignore echo

        if (type === 'PING') {
          setPeerConnected(true);
          setPeerName(sender);
          channel.postMessage({ type: 'PONG', sender: username });
          sound.playSuccess();
        } else if (type === 'PONG') {
          setPeerConnected(true);
          setPeerName(sender);
          sound.playSuccess();
        } else if (type === 'CHAT') {
          sound.playClick();
          setMessages((prev) => [
            ...prev,
            {
              id: 'msg-' + Date.now() + Math.random(),
              sender,
              text: payload.text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isMe: false,
            },
          ]);
        } else if (type === 'TTT_MOVE') {
          sound.playClick();
          setBoard(payload.board);
          setTurn(payload.nextTurn);
          setWinner(payload.winner);
        } else if (type === 'TTT_RESET') {
          setBoard(Array(9).fill(null));
          setTurn('X');
          setWinner(null);
        }
      };

      return () => {
        channel.close();
      };
    } catch (err) {
      console.warn('BroadcastChannel error:', err);
    }
  }, [roomId, username]);

  // Auto scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    sound.playClick();
    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: username,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    broadcastData('CHAT', { text: inputText.trim() });
    setInputText('');
  };

  const handleCopyLink = () => {
    sound.playClick();
    const url = `${window.location.origin}${window.location.pathname}#room=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleJoinCustomRoom = () => {
    if (!inputRoomId.trim()) return;
    sound.playClick();
    setRoomId(inputRoomId.trim().toUpperCase());
    setInputRoomId('');
    setPeerConnected(false);
  };

  // Tic Tac Toe Move Handler
  const checkWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (squares.every(s => s !== null)) return 'Draw';
    return null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner) return;
    if (peerConnected && turn !== mySymbol) return; // not my turn in multiplayer
    if (!peerConnected && turn !== 'X') return; // in single-player, wait for AI 'O' response

    sound.playClick();
    const currentPiece = peerConnected ? mySymbol : turn;
    const nextBoard = [...board];
    nextBoard[index] = currentPiece;
    const nextTurn = currentPiece === 'X' ? 'O' : 'X';
    const winResult = checkWinner(nextBoard);

    setBoard(nextBoard);
    setTurn(nextTurn);
    setWinner(winResult);

    if (peerConnected) {
      broadcastData('TTT_MOVE', {
        board: nextBoard,
        nextTurn,
        winner: winResult,
      });
    } else if (!winResult && nextTurn === 'O') {
      // Single-player AI response for 'O'
      setTimeout(() => {
        setBoard((prev) => {
          if (checkWinner(prev)) return prev;
          const emptyIndices = prev
            .map((val, idx) => (val === null ? idx : null))
            .filter((v): v is number => v !== null);
          if (emptyIndices.length === 0) return prev;

          // Check if AI can win immediately
          for (const emptyIdx of emptyIndices) {
            const test = [...prev];
            test[emptyIdx] = 'O';
            if (checkWinner(test) === 'O') {
              const res = checkWinner(test);
              setTurn('X');
              setWinner(res);
              return test;
            }
          }

          // Check if player X is about to win and block them
          for (const emptyIdx of emptyIndices) {
            const test = [...prev];
            test[emptyIdx] = 'X';
            if (checkWinner(test) === 'X') {
              const blockBoard = [...prev];
              blockBoard[emptyIdx] = 'O';
              const res = checkWinner(blockBoard);
              setTurn('X');
              setWinner(res);
              return blockBoard;
            }
          }

          // Take center if available, otherwise pick random empty cell
          const chosenIdx = emptyIndices.includes(4)
            ? 4
            : emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

          const aiBoard = [...prev];
          aiBoard[chosenIdx] = 'O';
          const res = checkWinner(aiBoard);
          setTurn('X');
          setWinner(res);
          return aiBoard;
        });
      }, 350);
    }
  };

  const resetTicTacToe = () => {
    sound.playClick();
    setBoard(Array(9).fill(null));
    setTurn('X');
    setWinner(null);
    broadcastData('TTT_RESET', {});
  };

  // Screen Share Toggle
  const toggleScreenShare = async () => {
    sound.playClick();
    if (isSharingScreen) {
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        localVideoRef.current.srcObject = null;
      }
      setIsSharingScreen(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setIsSharingScreen(true);
        stream.getVideoTracks()[0].onended = () => {
          setIsSharingScreen(false);
        };
      } catch (err) {
        console.error('Failed to get screen media:', err);
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#070710] text-white select-none overflow-hidden font-sans">
      {/* ── Top P2P Status & Navigation Bar ── */}
      <div className="h-14 border-b border-white/[0.08] bg-[#0d0e1a]/90 backdrop-blur-xl px-4 flex items-center justify-between shrink-0 z-10 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Radio size={16} className="text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-tight">P2P Room:</span>
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                {roomId}
              </span>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white transition-all border border-white/10"
                title="Copy shareable direct room link"
              >
                {copiedLink ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${peerConnected ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-amber-400 animate-ping'}`} />
              <span className="text-[10px] text-slate-400">
                {peerConnected ? `Connected with ${peerName}` : 'Waiting for peer to join...'}
              </span>
            </div>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => { sound.playClick(); setActiveTab('chat'); }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'chat' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare size={13} />
            <span>Chat</span>
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('tictactoe'); }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'tictactoe' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 size={13} />
            <span>Tic-Tac-Toe</span>
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('screen'); }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'screen' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv size={13} />
            <span>Screen Stream</span>
          </button>
        </div>

        {/* Join Other Room Box */}
        <div className="hidden md:flex items-center gap-1.5">
          <input
            type="text"
            placeholder="Enter Room Code..."
            value={inputRoomId}
            onChange={(e) => setInputRoomId(e.target.value)}
            className="bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-32 font-mono"
          />
          <button
            onClick={handleJoinCustomRoom}
            className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all"
          >
            Join
          </button>
        </div>
      </div>

      {/* ── Main Tab Content ── */}
      <div className="flex-1 overflow-hidden relative flex">
        {/* TAB 1: Real-time P2P Chat */}
        {activeTab === 'chat' && (
          <div className="w-full h-full flex flex-col justify-between">
            {/* Messages Scroll Area */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-semibold text-slate-400">{msg.sender}</span>
                    <span className="text-[9px] text-slate-500">{msg.timestamp}</span>
                  </div>
                  <div
                    className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-xs break-words shadow ${
                      msg.isMe
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-sm'
                        : msg.sender === 'System'
                        ? 'bg-white/[0.06] text-slate-300 border border-white/10 italic'
                        : 'bg-white/[0.08] text-white rounded-bl-sm border border-white/10'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-white/[0.08] bg-[#0c0d18] flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={peerConnected ? `Message ${peerName}...` : 'Type a message (or share room link)...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md active:scale-95"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: Synchronized Tic-Tac-Toe */}
        {activeTab === 'tictactoe' && (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#090a14] to-[#04040a]">
            <div className="mb-4 text-center">
              <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
                <Gamepad2 size={18} className="text-cyan-400" />
                Synchronized 2-Player Tic-Tac-Toe
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {winner
                  ? winner === 'Draw'
                    ? "Game ended in a Draw!"
                    : `Winner: Player ${winner}!`
                  : `Current Turn: Player ${turn} ${turn === mySymbol ? '(Your Turn)' : peerConnected ? `(${peerName}'s Turn)` : '(AI Opponent Turn)'}`}
              </p>
            </div>

            {/* 3x3 Grid */}
            <div className="grid grid-cols-3 gap-2.5 bg-white/[0.03] p-3 rounded-2xl border border-white/10 shadow-2xl">
              {board.map((cell, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCellClick(idx)}
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center text-3xl font-black font-mono transition-all duration-150 border ${
                    cell === 'X'
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                      : cell === 'O'
                      ? 'bg-purple-500/20 text-purple-400 border-purple-500/40 shadow-lg shadow-purple-500/10'
                      : 'bg-white/[0.04] text-transparent hover:bg-white/[0.08] border-white/10'
                  }`}
                >
                  {cell || ''}
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={resetTicTacToe}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white transition-all border border-white/10"
              >
                <RotateCcw size={14} />
                <span>Reset Match</span>
              </button>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <span>You play as:</span>
                <span className="font-bold text-cyan-400 font-mono">[{mySymbol}]</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Screen Share */}
        {activeTab === 'screen' && (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-black">
            {isSharingScreen ? (
              <div className="w-full h-full flex flex-col items-center justify-between">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-[85%] object-contain rounded-xl border border-cyan-500/30 bg-black"
                />
                <button
                  onClick={toggleScreenShare}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/30 mt-3"
                >
                  Stop Screen Share
                </button>
              </div>
            ) : (
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-4 border border-cyan-500/20 shadow-xl">
                  <Tv size={32} />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Direct WebRTC Screen Streaming</h3>
                <p className="text-xs text-slate-400 mb-5">
                  Stream your desktop, browser tabs, or emulator gameplay directly to your P2P room peer in full HD.
                </p>
                <button
                  onClick={toggleScreenShare}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all active:scale-95 flex items-center gap-2 mx-auto"
                >
                  <Share2 size={14} />
                  <span>Start Screen Stream</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
