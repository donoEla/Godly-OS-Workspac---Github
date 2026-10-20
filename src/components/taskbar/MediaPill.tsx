import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, Disc3, X } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { sound } from '../../utils/sound';

export const MediaPill: React.FC = () => {
  const {
    nowPlaying,
    togglePlayPauseNowPlaying,
    nextTrackNowPlaying,
    openApp,
    settings,
    updateSettings,
  } = useOS();

  const [isHovered, setIsHovered] = useState(false);

  if (!settings.mediaPillEnabled) return null;

  const handlePillClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.media-control-btn')) return;
    sound.playClick();
    openApp('spotify');
  };

  return (
    <motion.div
      initial={{ y: -40, opacity: 0, filter: 'blur(8px)' }}
      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
      exit={{ y: -40, opacity: 0, filter: 'blur(8px)' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePillClick}
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[8500] cursor-pointer select-none flex items-center gap-2.5 px-3 py-1.5 transition-all duration-300"
      style={{
        borderRadius: 999,
        background: isHovered
          ? 'rgba(8, 8, 14, 0.92)'
          : 'rgba(8, 8, 14, 0.75)',
        backdropFilter: 'blur(40px) saturate(200%)',
        WebkitBackdropFilter: 'blur(40px) saturate(200%)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: isHovered
          ? '0 16px 48px rgba(0,0,0,0.8), 0 0 24px rgba(139,92,246,0.20), inset 0 1px 0 rgba(255,255,255,0.12)'
          : '0 8px 28px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.08)',
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      {/* Disc artwork */}
      <div
        className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0"
        style={{ border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
      >
        {nowPlaying.cover ? (
          <img
            src={nowPlaying.cover}
            alt=""
            className={`w-full h-full object-cover ${nowPlaying.isPlaying ? 'disc-spin' : ''}`}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'rgba(139,92,246,0.15)' }}
          >
            <Disc3 size={14} style={{ color: 'var(--accent)' }} />
          </div>
        )}
        {/* Center hole */}
        <div
          className="absolute inset-0 m-auto w-2 h-2 rounded-full"
          style={{ background: 'rgba(0,0,0,0.85)', border: '0.5px solid rgba(255,255,255,0.15)' }}
        />
      </div>

      {/* Track info */}
      <div className="flex flex-col min-w-[100px] max-w-[160px]">
        <span className="text-[11px] font-semibold truncate tracking-tight" style={{ color: 'rgba(255,255,255,0.88)' }}>
          {nowPlaying.title}
        </span>
        <span className="text-[9px] truncate font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {nowPlaying.artist}
        </span>
      </div>

      {/* Equalizer bars */}
      <div className="flex items-end gap-0.5 h-3 flex-shrink-0">
        {[0.4, 0.9, 0.6, 1.0, 0.7].map((h, i) => (
          <span
            key={i}
            className="w-0.5 rounded-full eq-bar"
            style={{
              height: nowPlaying.isPlaying ? `${h * 100}%` : '20%',
              background: 'var(--accent)',
              opacity: nowPlaying.isPlaying ? 0.8 : 0.25,
              animationDelay: `${i * 0.12}s`,
              animationDuration: `${0.45 + i * 0.1}s`,
              animationPlayState: nowPlaying.isPlaying ? 'running' : 'paused',
            }}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-0.5 flex-shrink-0 pl-1.5" style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); togglePlayPauseNowPlaying(); }}
          className="media-control-btn w-6 h-6 rounded-full flex items-center justify-center transition-all"
          style={{ color: 'rgba(255,255,255,0.75)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
        >
          {nowPlaying.isPlaying ? <Pause size={11} /> : <Play size={11} className="ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); nextTrackNowPlaying(); }}
          className="media-control-btn w-6 h-6 rounded-full flex items-center justify-center transition-all"
          style={{ color: 'rgba(255,255,255,0.45)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
        >
          <SkipForward size={11} />
        </button>

        {isHovered && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); sound.playClick(); updateSettings({ mediaPillEnabled: false }); }}
            className="media-control-btn w-5 h-5 rounded-full flex items-center justify-center transition-all ml-0.5"
            style={{ color: 'rgba(255,255,255,0.25)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}
            title="Hide"
          >
            <X size={9} />
          </button>
        )}
      </div>
    </motion.div>
  );
};
