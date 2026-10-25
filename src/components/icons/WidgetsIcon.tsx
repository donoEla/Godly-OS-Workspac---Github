import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const WidgetsIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 128 128"
    width={size || undefined}
    height={size || undefined}
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="wdi-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#110d22" />
        <stop offset="50%" stopColor="#18132f" />
        <stop offset="100%" stopColor="#261b46" />
      </linearGradient>
      <linearGradient id="wdi-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7c3aed" />
        <stop offset="100%" stopColor="#4f46e5" />
      </linearGradient>
      <linearGradient id="wdi-metric" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9333ea" />
        <stop offset="100%" stopColor="#6b21a8" />
      </linearGradient>
      <linearGradient id="wdi-control" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
    </defs>

    {/* Base Container */}
    <rect x="4" y="4" width="120" height="120" rx="28" fill="url(#wdi-bg)" stroke="#c084fc" strokeOpacity="0.35" strokeWidth="1.5" />

    {/* Top Wide Widget Card */}
    <rect x="22" y="24" width="84" height="34" rx="10" fill="url(#wdi-top)" stroke="#c084fc" strokeWidth="1" strokeOpacity="0.8" />
    <circle cx="38" cy="41" r="6" fill="#ffffff" fillOpacity="0.9" />
    <circle cx="38" cy="41" r="2.5" fill="#4f46e5" />
    <rect x="52" y="38" width="38" height="6" rx="3" fill="#ffffff" fillOpacity="0.4" />
    <circle cx="92" cy="41" r="3" fill="#a78bfa" />

    {/* Bottom-Left Metric Widget Card */}
    <rect x="22" y="66" width="38" height="38" rx="10" fill="url(#wdi-metric)" stroke="#e879f9" strokeWidth="1" strokeOpacity="0.8" />
    <path d="M 33 88 A 10 10 0 1 1 49 88" stroke="#fbcfe8" strokeWidth="3" strokeLinecap="round" />
    <circle cx="41" cy="85" r="2.5" fill="#ffffff" />

    {/* Bottom-Right Control Widget Card */}
    <rect x="68" y="66" width="38" height="38" rx="10" fill="url(#wdi-control)" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.8" />
    <rect x="76" y="76" width="22" height="4" rx="2" fill="#0369a1" />
    <circle cx="88" cy="78" r="3.5" fill="#ffffff" />
    <rect x="76" y="88" width="22" height="4" rx="2" fill="#0369a1" />
    <circle cx="80" cy="90" r="3.5" fill="#7dd3fc" />
  </svg>
);
