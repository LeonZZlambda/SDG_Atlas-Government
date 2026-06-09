import { useEffect } from 'preact/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { usePlatform } from '../context/PlatformContext';
import { getIcon } from './ODSIcons';

export function Toast() {
  const { state, dispatch } = usePlatform();

  return (
    <div className="no-print" style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxWidth: '350px',
      width: '100%'
    }}>
      <AnimatePresence>
        {state.toasts.map(toast => (
          <ToastCard key={toast.id} toast={toast} onClose={(id) => dispatch({ type: 'REMOVE_TOAST', payload: id })} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast, onClose }: { toast: { id: string; message: string; type: string }; onClose: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const typeStyles = {
    success: { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff' },
    warning: { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#ffffff' },
    error: { bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#ffffff' },
    info: { bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#ffffff' }
  }[toast.type as 'success' | 'warning' | 'error' | 'info'] || { bg: '#ffffff', color: '#000000' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
      style={{
        background: typeStyles.bg,
        color: typeStyles.color,
        padding: '16px 20px',
        borderRadius: '16px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), inset -3px -3px 6px rgba(0,0,0,0.15), inset 3px 3px 6px rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pointerEvents: 'auto',
        cursor: 'pointer'
      }}
      onClick={() => onClose(toast.id)}
      role="alert"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '18px', height: '18px' }}>
          {toast.type === 'success' && getIcon('check', '', '#10b981')}
          {toast.type === 'warning' && getIcon('warning', '', '#f59e0b')}
          {toast.type === 'error' && getIcon('x', '', '#ef4444')}
          {toast.type === 'info' && getIcon('info', '', '#6366f1')}
        </div>
        <p style={{ margin: 0, color: 'inherit', fontSize: 'clamp(12px, 1.2vw, 14px)', fontWeight: 500 }}>
          {toast.message}
        </p>
      </div>
      <button
        type="button"
        style={{
          background: 'none',
          border: 'none',
          color: 'inherit',
          fontSize: 'clamp(14px, 1.5vw, 18px)',
          cursor: 'pointer',
          padding: '0 0 0 12px',
          opacity: 0.8
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClose(toast.id);
        }}
        aria-label="Dismiss alert"
      >
        ×
      </button>
    </motion.div>
  );
}
