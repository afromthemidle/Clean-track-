import React, { useState, useEffect } from 'react';
import { getCleaningAdvice } from '../services/geminiService';
import { useApp } from '../context/AppContext';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
  areaName: string;
}

const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose, taskTitle, areaName }) => {
  const { t, language } = useApp();
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && taskTitle) {
      setLoading(true);
      getCleaningAdvice(taskTitle, areaName, language)
        .then(text => setAdvice(text))
        .catch(() => setAdvice(t('failedToFetchAdvice')))
        .finally(() => setLoading(false));
    } else {
      setAdvice('');
    }
  }, [isOpen, taskTitle, areaName, t, language]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] border border-slate-100">
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-6 flex justify-between items-center text-white shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -ml-10 -mb-10"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-sm">
              <i className="fa-solid fa-wand-magic-sparkles text-yellow-300 text-lg"></i>
            </div>
            <h3 className="font-display font-bold text-xl tracking-tight">{t('aiCleaningAssistant')}</h3>
          </div>
          <button onClick={onClose} className="w-10 h-10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all active:scale-95 relative z-10 backdrop-blur-sm">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto text-slate-700 leading-relaxed bg-slate-50/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                <i className="fa-solid fa-sparkles absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-400 text-xl animate-pulse"></i>
              </div>
              <p className="text-slate-500 font-medium animate-pulse">{t('askingGemini')}</p>
            </div>
          ) : (
            <div className="prose prose-slate prose-sm max-w-none">
                <h4 className="text-xl font-display font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-6 bg-indigo-500 rounded-full inline-block"></span>
                  {t('howToClean')} <span className="text-indigo-600">{taskTitle}</span>
                </h4>
                <div className="whitespace-pre-line text-sm bg-white p-6 rounded-2xl shadow-sm border border-slate-100/50 text-slate-600 leading-relaxed">
                  {advice}
                </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs font-medium text-slate-400 text-center flex items-center justify-center gap-2">
          <i className="fa-solid fa-bolt text-amber-400"></i> {t('poweredByGemini')}
        </div>
      </div>
    </div>
  );
};

export default AIChatModal;