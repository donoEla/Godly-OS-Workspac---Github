import React from 'react';
import { AppId } from '../../types/os';
import { useOS } from '../../context/OSContext';
import { sound } from '../../utils/sound';

interface DesktopIconProps {
  id: string;
  name: string;
  icon: string;
  isSelected: boolean;
  onSelect: () => void;
  onOpen?: () => void;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({
  id,
  name,
  icon,
  isSelected,
  onSelect,
  onOpen,
}) => {
  const { openApp, openContextMenu } = useOS();

  const handleOpen = () => {
    sound.playOpen();
    if (onOpen) {
      onOpen();
    } else {
      openApp(id as any);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    if (isSelected) {
      handleOpen();
    } else {
      onSelect();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    openContextMenu(e, 'item', { id, name });
  };

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleOpen}
      onContextMenu={handleContextMenu}
      className="group flex flex-col items-center justify-center p-2 w-[86px] cursor-pointer select-none transition-all duration-200"
      style={{ borderRadius: 18 }}
    >
      {/* Icon container */}
      <div
        className="relative w-[54px] h-[54px] overflow-hidden bg-[#0a0a12] transition-all duration-200 group-hover:-translate-y-0.5 group-active:scale-95 flex items-center justify-center"
        style={{
          borderRadius: 14,
          boxShadow: isSelected
            ? '0 8px 28px rgba(139,92,246,0.45), 0 0 0 1.5px rgba(139,92,246,0.5)'
            : '0 6px 20px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(255,255,255,0.10)',
          transform: isSelected ? 'scale(1.04)' : undefined,
        }}
      >
        <img
          src={icon}
          alt={name}
          className="w-full h-full object-cover"
          draggable={false}
          onError={(e) => {
            // If cache-busted or path fails, fallback to direct path
            const target = e.currentTarget;
            if (target.src.includes('?v=')) {
              target.src = target.src.split('?')[0];
            }
          }}
        />
        {/* Specular sheen */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Label */}
      <span
        className="mt-1.5 text-[11px] font-medium text-center leading-tight line-clamp-2 px-1.5 py-0.5 max-w-full rounded-lg transition-all"
        style={{
          color: 'rgba(255,255,255,0.92)',
          textShadow: '0 1px 4px rgba(0,0,0,0.9), 0 2px 10px rgba(0,0,0,0.7)',
          background: isSelected ? 'rgba(139,92,246,0.40)' : 'transparent',
          border: isSelected ? '1px solid rgba(139,92,246,0.35)' : '1px solid transparent',
          backdropFilter: isSelected ? 'blur(12px)' : 'none',
        }}
      >
        {name}
      </span>
    </div>
  );
};
