import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Dialog({ open, onOpenChange, children }) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto
              bg-card/95 dark:bg-slate-900/95 backdrop-blur-xl
              border border-border/50 dark:border-white/10
              rounded-t-2xl sm:rounded-2xl
              shadow-2xl shadow-black/20 dark:shadow-black/50
              p-6"
          >
            {children}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center
                rounded-full bg-muted/50 hover:bg-muted
                text-muted-foreground hover:text-foreground
                transition-colors"
            >
              ×
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function DialogContent({ children, className = '' }) {
  return <div className={`mt-2 ${className}`}>{children}</div>;
}

export function DialogHeader({ children }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children, className = '' }) {
  return <h2 className={`text-xl font-semibold text-foreground ${className}`}>{children}</h2>;
}

export default Dialog;
