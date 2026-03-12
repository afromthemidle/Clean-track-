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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        <div className="bg-gradient-to-r from-primary to-blue-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-sparkles text-yellow-300"></i>
            <h3 className="font-bold text-lg">{t('aiCleaningAssistant')}</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-2 transition">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto text-gray-700 leading-relaxed">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <i className="fa-solid fa-circle-notch fa-spin text-4xl text-primary mb-4"></i>
              <p className="text-gray-500">{t('askingGemini')}</p>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('howToClean')}{taskTitle}
                </h4>
                <div className="whitespace-pre-line text-sm">
                  {advice}
                </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t text-xs text-gray-500 text-center">
          {t('poweredByGemini')}
        </div>
      </div>
    </div>
  );
};

export default AIChatModal;