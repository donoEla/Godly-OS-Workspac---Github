import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../../context/OSContext';
import { Bell, X, Info, CheckCircle, AlertTriangle, AlertCircle, Trash2 } from 'lucide-react';
import { getAssetUrl } from '../../utils/assetHelper';

const PANEL_STYLES = {
  background: 'rgba(8, 8, 14, 0.94)',
  backdropFilter: 'blur(52px) saturate(180%)',
  WebkitBackdropFilter: 'blur(52px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.09)',
  boxShadow: '0 28px 70px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)',
} as const;

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    removeNotification,
    clearNotifications,
    notificationCenterOpen,
    setNotificationCenterOpen,
    settings,
  } = useOS();

  const getIcon = (type?: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={14} className="text-emerald-400" />;
      case 'warning': return <AlertTriangle size={14} className="text-amber-400" />;
      case 'alert':   return <AlertCircle size={14} className="text-rose-400" />;
      default:        return <Info size={14} className="text-violet-400" />;
    }
  };

  const getAccentColor = (type?: string) => {
    switch (type) {
      case 'success': return 'rgba(16,185,129,0.15)';
      case 'warning': return 'rgba(245,158,11,0.12)';
      case 'alert':   return 'rgba(239,68,68,0.12)';
      default:        return 'rgba(139,92,246,0.10)';
    }
  };

  return (
    <>
      {/* ── Toast notifications (bottom-right, floating) ── */}
      <div className="fixed bottom-14 right-4 z-[9800] flex flex-col gap-2 pointer-events-none w-80">
        <AnimatePresence>
          {notifications.slice(0, 3).map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 40, scale: 0.94 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.94 }}
              transition={{ type: 'spring', damping: 26, stiffness: 380 }}
              className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(10,10,18,0.92)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.10)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              {/* Colored left accent strip */}
              <div
                className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
                style={{ background: notif.type === 'success' ? '#10b981' : notif.type === 'warning' ? '#f59e0b' : notif.type === 'alert' ? '#ef4444' : 'var(--accent)' }}
              />

              <div className="flex-shrink-0 mt-0.5 ml-1.5">
                {notif.icon ? (
                  <img src={getAssetUrl(notif.icon)} alt="" className="w-5 h-5 rounded-lg object-cover" style={{ border: '1px solid rgba(255,255,255,0.10)' }} />
                ) : getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold truncate" style={{ color: 'rgba(255,255,255,0.92)' }}>
                  {notif.title}
                </div>
                <div className="text-[11px] mt-0.5 leading-snug line-clamp-2" style={{ color: 'rgba(255,255,255,0.48)' }}>
                  {notif.message}
                </div>
              </div>

              <button
                onClick={() => removeNotification(notif.id)}
                className="flex-shrink-0 w-5 h-5 rounded-lg flex items-center justify-center transition-all"
                style={{ color: 'rgba(255,255,255,0.25)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.25)';
                }}
              >
                <X size={11} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Notification Center Panel ── */}
      <AnimatePresence>
        {notificationCenterOpen && (
          <motion.div
          initial={settings.animationsEnabled ? { opacity: 0, y: 20, scale: 0.96, filter: 'blur(6px)' } : undefined}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 14, scale: 0.97 }}
          transition={{ type: 'spring', damping: 28, stiffness: 420 }}
          onClick={(e) => e.stopPropagation()}
          className="fixed bottom-14 right-4 z-50 w-80 select-none overflow-hidden flex flex-col"
          style={{
            ...PANEL_STYLES,
            borderRadius: 22,
            maxHeight: 480,
          }}
        >
          {/* Accent strip */}
          <div
            className="absolute top-0 left-1/3 right-1/3 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)' }}
          />

          {/* Header */}
          <div
            className="flex items-center justify-between p-4 pb-3 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-2">
              <Bell size={13} className="text-violet-400" />
              <span className="text-[12px] font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Notifications
              </span>
              <span className="accent-badge">{notifications.length}</span>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="flex items-center gap-1.5 text-[10px] font-medium transition-colors"
                style={{ color: 'rgba(239,68,68,0.6)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(239,68,68,0.6)')}
              >
                <Trash2 size={11} />
                Clear all
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell size={24} className="mx-auto mb-3 opacity-15" />
                <p className="text-[12px] font-mono" style={{ color: 'rgba(255,255,255,0.22)' }}>
                  All clear
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="group relative flex items-start gap-3 p-3 rounded-xl transition-all"
                  style={{
                    background: getAccentColor(notif.type),
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                >
                  <div className="mt-0.5 flex-shrink-0">{getIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="text-[12px] font-semibold" style={{ color: 'rgba(255,255,255,0.88)' }}>
                      {notif.title}
                    </div>
                    <div className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {notif.message}
                    </div>
                    <span className="text-[9px] font-mono mt-1.5 block" style={{ color: 'rgba(255,255,255,0.22)' }}>
                      {notif.time}
                    </span>
                  </div>
                  <button
                    onClick={() => removeNotification(notif.id)}
                    className="absolute top-2.5 right-2.5 w-5 h-5 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.35)';
                    }}
                  >
                    <X size={10} />
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
