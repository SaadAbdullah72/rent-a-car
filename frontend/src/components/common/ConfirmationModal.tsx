import React from 'react';
import { AlertTriangle, Trash2, X, CheckCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Yes, Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md p-6 bg-slateDark-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top accent strip */}
        <div 
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            variant === 'danger' ? 'bg-rose-500' : variant === 'warning' ? 'bg-amber-500' : 'bg-brand-500'
          }`} 
        />

        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl shrink-0 ${
            variant === 'danger' 
              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
              : variant === 'warning' 
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
              : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
          }`}>
            {variant === 'danger' ? (
              <Trash2 size={26} />
            ) : (
              <AlertTriangle size={26} />
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6 whitespace-pre-line">{message}</p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
              >
                {cancelText}
              </button>
              
              <button
                type="button"
                onClick={onConfirm}
                className={`px-5 py-2 text-sm font-semibold text-white rounded-lg shadow-lg flex items-center gap-2 transition ${
                  variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/40'
                    : variant === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/40'
                    : 'bg-brand-600 hover:bg-brand-500 shadow-brand-900/40'
                }`}
              >
                {variant === 'danger' ? <Trash2 size={16} /> : <CheckCircle size={16} />}
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
