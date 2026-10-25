import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const VmIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 128 128"
    width={size || undefined}
    height={size || undefined}
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="vmi-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0b111e" />
        <stop offset="50%" stopColor="#111827" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
      <linearGradient id="vmi-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7dd3fc" />
        <stop offset="100%" stopColor="#38bdf8" />
      </linearGradient>
      <linearGradient id="vmi-left" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>
      <linearGradient id="vmi-right" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0ea5e9" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
    </defs>

    {/* Base Container */}
    <rect x="4" y="4" width="120" height="120" rx="28" fill="url(#vmi-bg)" stroke="#38bdf8" strokeOpacity="0.3" strokeWidth="1.5" />

    {/* Hypervisor Brackets */}
    <g opacity="0.4" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round">
      <path d="M 22 34 L 22 22 L 34 22" />
      <path d="M 94 22 L 106 22 L 106 34" />
      <path d="M 22 94 L 22 106 L 34 106" />
      <path d="M 94 106 L 106 106 L 106 94" />
    </g>

    {/* Virtual Machine Isometric Core */}
    <polygon points="64,32 90,47 64,62 38,47" fill="url(#vmi-top)" stroke="#bae6fd" strokeWidth="1" strokeOpacity="0.7" />
    <polygon points="38,47 64,62 64,93 38,78" fill="url(#vmi-left)" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.4" />
    <polygon points="64,62 90,47 90,78 64,93" fill="url(#vmi-right)" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.5" />

    {/* Kernel Spark Node */}
    <circle cx="64" cy="62" r="4.5" fill="#ffffff" />
    <circle cx="64" cy="62" r="7.5" fill="none" stroke="#bae6fd" strokeWidth="1" strokeOpacity="0.8" />
  </svg>
);
