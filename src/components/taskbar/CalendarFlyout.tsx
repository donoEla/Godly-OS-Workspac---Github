import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../../context/OSContext';
import { ChevronLeft, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

export const CalendarFlyout: React.FC = () => {
  const { calendarOpen, settings } = useOS();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const currentYear  = currentTime.getFullYear();
  const currentMonth = currentTime.getMonth();
  const currentDate  = currentTime.getDate();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth     = new Date(currentYear, currentMonth + 1, 0).getDate();

  const timeString = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const dateString = currentTime.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <AnimatePresence>
      {calendarOpen && (
        <motion.div
      initial={settings.animationsEnabled ? { opacity: 0, y: 20, scale: 0.96, filter: 'blur(6px)' } : undefined}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 14, scale: 0.97 }}
      transition={{ type: 'spring', damping: 28, stiffness: 420 }}
      onClick={(e) => e.stopPropagation()}
      className="fixed bottom-14 right-4 z-50 w-72 select-none overflow-hidden"
      style={{
        borderRadius: 22,
        background: 'rgba(8, 8, 14, 0.94)',
        backdropFilter: 'blur(52px) saturate(180%)',
        WebkitBackdropFilter: 'blur(52px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 28px 70px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      {/* Accent strip */}
      <div
        className="absolute top-0 left-1/3 right-1/3 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)' }}
      />

      <div className="p-4">
        {/* Clock Hero */}
        <div className="mb-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div
            className="text-4xl font-black font-mono tracking-tighter leading-none"
            style={{ color: 'rgba(255,255,255,0.92)' }}
          >
            {timeString}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <Clock size={10} className="text-violet-400" />
            <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.40)' }}>
              {dateString}
            </span>
          </div>
        </div>

        {/* Month Nav */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] font-bold" style={{ color: 'rgba(255,255,255,0.80)' }}>
            {monthNames[currentMonth]} <span className="opacity-40">{currentYear}</span>
          </span>
          <div className="flex items-center gap-0.5">
            <button
              className="w-7 h-7 rounded-xl flex items-center justify-center transition-all"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              className="w-7 h-7 rounded-xl flex items-center justify-center transition-all"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {/* Day headers */}
          {dayNames.map((d) => (
            <div key={d} className="text-[9px] font-bold py-1.5 font-mono" style={{ color: 'rgba(255,255,255,0.22)' }}>
              {d}
            </div>
          ))}

          {/* Empty offset cells */}
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
            <div key={`empty-${idx}`} />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1;
            const isToday = day === currentDate;
            return (
              <div
                key={day}
                className="py-1.5 text-[11px] font-medium rounded-xl cursor-pointer transition-all duration-150"
                style={
                  isToday
                    ? {
                        background: 'var(--accent)',
                        color: 'white',
                        fontWeight: 700,
                        boxShadow: '0 4px 14px rgba(139,92,246,0.45)',
                      }
                    : { color: 'rgba(255,255,255,0.55)' }
                }
                onMouseEnter={(e) => {
                  if (!isToday) e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                }}
                onMouseLeave={(e) => {
                  if (!isToday) e.currentTarget.style.background = 'transparent';
                }}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Agenda footer */}
        <div
          className="mt-4 pt-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="flex items-center gap-2.5 p-2.5 rounded-xl text-[11px]"
            style={{
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.15)',
              color: 'rgba(255,255,255,0.50)',
            }}
          >
            <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
            No upcoming meetings. You're free!
          </div>
        </div>
      </div>
    </motion.div>
      )}
    </AnimatePresence>
  );
};
