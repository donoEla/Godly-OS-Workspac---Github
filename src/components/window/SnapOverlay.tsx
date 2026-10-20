import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../../context/OSContext';

export const SnapOverlay: React.FC = () => {
  const { snapPreview, settings } = useOS();

  if (!settings.windowSnapping || snapPreview === 'none') {
    return null;
  }

  const isTopTaskbar = settings.taskbarPosition === 'top';
  const topOffset = isTopTaskbar ? 60 : 10;
  const heightStyle = 'calc(100vh - 72px)';

  const getBounds = () => {
    switch (snapPreview) {
      case 'left':
        return {
          left: 10,
          top: topOffset,
          width: 'calc(50vw - 15px)',
          height: heightStyle,
        };
      case 'right':
        return {
          left: 'calc(50vw + 5px)',
          top: topOffset,
          width: 'calc(50vw - 15px)',
          height: heightStyle,
        };
      case 'top':
        return {
          left: 10,
          top: topOffset,
          width: 'calc(100vw - 20px)',
          height: heightStyle,
        };
      default:
        return null;
    }
  };

  const bounds = getBounds();
  if (!bounds) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={`snap-${snapPreview}`}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="fixed z-[9990] pointer-events-none rounded-2xl overflow-hidden backdrop-blur-md"
        style={{
          ...bounds,
          backgroundColor: 'rgba(var(--accent-glow-rgb, 147, 51, 234), 0.12)',
          border: '2px solid var(--accent-color, #a855f7)',
          boxShadow: '0 0 35px var(--accent-glow, rgba(168, 85, 247, 0.4)), inset 0 0 20px rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="px-4 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white/90 text-xs font-medium tracking-wide flex items-center gap-2 shadow-2xl">
            <span className="w-2 h-2 rounded-full animate-ping bg-accent" />
            <span>Snap {snapPreview === 'top' ? 'Maximize' : snapPreview === 'left' ? 'Split Left' : 'Split Right'}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
