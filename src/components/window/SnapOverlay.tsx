import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../../context/OSContext';
import { SnapRegion } from '../../types/os';

export const SnapOverlay: React.FC = () => {
  const { snapPreview, settings } = useOS();

  if (!settings.windowSnapping || snapPreview === 'none') {
    return null;
  }

  const isTopTaskbar = settings.taskbarPosition === 'top';
  const topOffset = isTopTaskbar ? 58 : 8;
  const bottomOffset = isTopTaskbar ? 8 : 58;
  const heightStyle = `calc(100vh - ${topOffset + bottomOffset}px)`;
  const halfHeightStyle = `calc(50vh - ${(topOffset + bottomOffset) / 2 + 6}px)`;

  const getBounds = () => {
    switch (snapPreview) {
      // 1. Half Splits
      case 'left':
        return {
          left: 10,
          top: topOffset,
          width: 'calc(50vw - 16px)',
          height: heightStyle,
          label: 'Split Left (50%)',
        };
      case 'right':
        return {
          left: 'calc(50vw + 6px)',
          top: topOffset,
          width: 'calc(50vw - 16px)',
          height: heightStyle,
          label: 'Split Right (50%)',
        };
      case 'top':
        return {
          left: 10,
          top: topOffset,
          width: 'calc(100vw - 20px)',
          height: heightStyle,
          label: 'Maximize (Full Display)',
        };

      // 2. 2x2 Quad Grid (Corners)
      case 'top-left':
        return {
          left: 10,
          top: topOffset,
          width: 'calc(50vw - 16px)',
          height: halfHeightStyle,
          label: 'Quad Top-Left (25%)',
        };
      case 'top-right':
        return {
          left: 'calc(50vw + 6px)',
          top: topOffset,
          width: 'calc(50vw - 16px)',
          height: halfHeightStyle,
          label: 'Quad Top-Right (25%)',
        };
      case 'bottom-left':
        return {
          left: 10,
          top: `calc(${topOffset}px + ${halfHeightStyle} + 12px)`,
          width: 'calc(50vw - 16px)',
          height: halfHeightStyle,
          label: 'Quad Bottom-Left (25%)',
        };
      case 'bottom-right':
        return {
          left: 'calc(50vw + 6px)',
          top: `calc(${topOffset}px + ${halfHeightStyle} + 12px)`,
          width: 'calc(50vw - 16px)',
          height: halfHeightStyle,
          label: 'Quad Bottom-Right (25%)',
        };

      // 3. 3-Column Equal Split (33 / 33 / 33)
      case 'col-1-of-3':
        return {
          left: 10,
          top: topOffset,
          width: 'calc(33.333vw - 14px)',
          height: heightStyle,
          label: 'Column 1 of 3 (33%)',
        };
      case 'col-2-of-3':
        return {
          left: 'calc(33.333vw + 4px)',
          top: topOffset,
          width: 'calc(33.333vw - 12px)',
          height: heightStyle,
          label: 'Column 2 of 3 (Center 33%)',
        };
      case 'col-3-of-3':
        return {
          left: 'calc(66.666vw + 4px)',
          top: topOffset,
          width: 'calc(33.333vw - 14px)',
          height: heightStyle,
          label: 'Column 3 of 3 (33%)',
        };

      // 4. Zen 70/20/10 Split
      case 'zen-70':
        return {
          left: 10,
          top: topOffset,
          width: 'calc(70vw - 16px)',
          height: heightStyle,
          label: 'Zen Focus Zone (70%)',
        };
      case 'zen-20':
        return {
          left: 'calc(70vw + 4px)',
          top: topOffset,
          width: 'calc(20vw - 12px)',
          height: heightStyle,
          label: 'Zen Companion (20%)',
        };
      case 'zen-10':
        return {
          left: 'calc(90vw + 2px)',
          top: topOffset,
          width: 'calc(10vw - 12px)',
          height: heightStyle,
          label: 'Zen Sidebar (10%)',
        };

      // 5. 70/30 Code-Browser Split
      case 'split-70':
        return {
          left: 10,
          top: topOffset,
          width: 'calc(70vw - 16px)',
          height: heightStyle,
          label: 'Code / Main Stage (70%)',
        };
      case 'split-30':
        return {
          left: 'calc(70vw + 6px)',
          top: topOffset,
          width: 'calc(30vw - 16px)',
          height: heightStyle,
          label: 'Browser / Live Preview (30%)',
        };

      default:
        return null;
    }
  };

  const bounds = getBounds();
  if (!bounds) return null;

  const { label, ...styleProps } = bounds;

  return (
    <AnimatePresence>
      <motion.div
        key={`snap-${snapPreview}`}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        className="fixed z-[9990] pointer-events-none rounded-2xl overflow-hidden backdrop-blur-md"
        style={{
          ...styleProps,
          backgroundColor: 'rgba(168, 85, 247, 0.14)',
          border: '2px solid rgba(192, 132, 252, 0.9)',
          boxShadow: '0 0 45px rgba(168, 85, 247, 0.45), inset 0 0 25px rgba(255, 255, 255, 0.12)',
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="px-4 py-2.5 rounded-xl bg-black/60 backdrop-blur-xl border border-white/15 text-white/95 text-xs font-semibold tracking-wide flex items-center gap-2.5 shadow-2xl">
            <span className="w-2.5 h-2.5 rounded-full animate-ping bg-purple-400" />
            <span>{label}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
