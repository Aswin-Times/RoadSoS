import React, { useEffect } from 'react';
import { useToastStore } from '../../store/useToastStore';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-24 left-1/2 z-[9999] flex -translate-x-1/2 flex-col gap-2 w-[90%] max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, removeToast }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  const icons = {
    success: <CheckCircle size={20} className="text-safe" />,
    error: <AlertCircle size={20} className="text-emergency" />,
    info: <Info size={20} className="text-blue-400" />
  };

  const bgs = {
    success: 'bg-safe/10 border-safe/30 text-safe',
    error: 'bg-emergency/10 border-emergency/30 text-emergency',
    info: 'bg-blue-400/10 border-blue-400/30 text-blue-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`flex items-center gap-3 rounded-card border p-3 shadow-lg pointer-events-auto backdrop-blur-md bg-asphalt-800 ${bgs[toast.type || 'info']}`}
    >
      {icons[toast.type || 'info']}
      <p className="flex-1 text-sm font-medium text-smoke-100">{toast.message}</p>
      <button onClick={() => removeToast(toast.id)} className="text-smoke-400 hover:text-smoke-100">
        <X size={16} />
      </button>
    </motion.div>
  );
}
