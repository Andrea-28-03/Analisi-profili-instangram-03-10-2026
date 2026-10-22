import React from "react";
import { AlertTriangle, Trash2, Eraser, RotateCcw, X, Check } from "lucide-react";

export type ConfirmActionType = "clear_analyses" | "clear_all" | "reset_sample" | "delete_profile";

interface ConfirmModalProps {
  isOpen: boolean;
  actionType: ConfirmActionType | null;
  targetName?: string;
  onClose: () => void;
  onConfirm: () => void;
  theme?: 'light' | 'dark';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  actionType,
  targetName,
  onClose,
  onConfirm,
  theme = 'light',
}) => {
  if (!isOpen || !actionType) return null;

  const modalBg = theme === 'dark' ? 'bg-[#22201D] text-[#F7F4EB] border-[#E5DFD2]' : 'bg-[#FFFDF9] text-[#1C1A17] border-[#1C1A17]';
  const subBoxBg = theme === 'dark' ? 'bg-[#181716] border-[#38332E]' : 'bg-[#FFF9E6] border-[#1C1A17]';

  const getConfig = () => {
    switch (actionType) {
      case "clear_analyses":
        return {
          icon: <Eraser className="w-8 h-8 text-[#FF7844]" />,
          title: "Cancella Tratti AI",
          description: "Vuoi svuotare i risultati delle analisi fatte finora? I profili verranno mantenuti nel taccuino, ma segnati come 'da analizzare'.",
          confirmText: "Sì, svuota analisi",
          confirmBg: "bg-[#FF7844] hover:bg-[#E05622] text-white border-2 border-[#1C1A17]",
          tapeClass: "washi-tape-yellow",
        };
      case "clear_all":
        return {
          icon: <Trash2 className="w-8 h-8 text-[#E63946]" />,
          title: "Strappa Pagine (Elimina Tutto)",
          description: "Sei sicuro di voler eliminare TUTTI i profili dal taccuino? Questa azione svuoterà completamente l'archivio locale.",
          confirmText: "Sì, elimina tutto",
          confirmBg: "bg-[#E63946] hover:bg-[#C9184A] text-white border-2 border-[#1C1A17]",
          tapeClass: "washi-tape-pink",
        };
      case "reset_sample":
        return {
          icon: <RotateCcw className="w-8 h-8 text-[#3A86FF]" />,
          title: "Ripristina 15 Studi Esempio",
          description: "Vuoi ricaricare il set iniziale di 15 studi di design e architetti internazionali (Pentagram, Sagmeister, DIA...)?",
          confirmText: "Sì, ricarica esempio",
          confirmBg: "bg-[#3A86FF] hover:bg-[#1D63D8] text-white border-2 border-[#1C1A17]",
          tapeClass: "washi-tape-blue",
        };
      case "delete_profile":
        return {
          icon: <AlertTriangle className="w-8 h-8 text-[#E63946]" />,
          title: "Elimina Profilo",
          description: `Rimuovere ${targetName || 'questo profilo'} dal taccuino?`,
          confirmText: "Sì, elimina",
          confirmBg: "bg-[#E63946] hover:bg-[#C9184A] text-white border-2 border-[#1C1A17]",
          tapeClass: "washi-tape-pink",
        };
    }
  };

  const config = getConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
      <div className={`relative w-full max-w-md ${modalBg} border-2 rounded-2xl shadow-doodle-lg p-6 overflow-hidden transition-colors`}>
        {/* Washi Tape */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-28 ${config.tapeClass} rounded-xs -rotate-1 pointer-events-none z-20`} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-xl opacity-70 hover:opacity-100 hover:bg-black/10 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className={`p-3 rounded-2xl border-2 ${subBoxBg} shadow-doodle-sm`}>
            {config.icon}
          </div>

          <h3 className="font-hand font-bold text-xl tracking-tight">
            {config.title}
          </h3>

          <p className="text-xs font-sans opacity-85 leading-relaxed max-w-sm">
            {config.description}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full pt-3">
            <button
              onClick={onClose}
              className={`flex-1 py-2 px-4 rounded-xl font-hand font-bold text-sm border-2 transition cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#2C2A26] border-[#E5DFD2] text-[#F7F4EB] hover:bg-[#38332E]'
                  : 'bg-[#FFF9E6] border-[#1C1A17] text-[#1C1A17] hover:bg-[#FFF3C4]'
              }`}
            >
              Annulla
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-2 px-4 rounded-xl font-hand font-bold text-sm shadow-doodle-sm btn-doodle transition cursor-pointer ${config.confirmBg}`}
            >
              {config.confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
