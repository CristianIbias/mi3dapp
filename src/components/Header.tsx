import React from 'react';
import { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  onOpenSettings: () => void;
  onOpenExport?: () => void;
  avatarUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenExport, avatarUrl }) => {
  const defaultAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuC9874AHKcJu_gu7xFkbCjkIJ6ax9n3P2_ISTJih5KQ3sZHW6tUPbxmf7-Bs5WIhZZgnYnudHnHKZo_X2ItgziG-_0a3C-_PGfjQ6X3j-mpzE3iwivcmUKIlZvMW3rI55y47RS_xMfxYRkg_SzLrzOU6ct4ZDNcySPOw6yUZxv0kY8DqvI1x84f1LW5ocWd4nyBwo1PKsBa2hKxPBaLSOMtZYQ8rFyFnQUKuAcFEhiAFtr8JvqWtFBqDg";

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0b1326]/70 backdrop-blur-glass border-b border-[#3b494c]/20 flex justify-between items-center px-6 h-16 shadow-none">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#00e5ff]/20 border border-[#00e5ff]/30 flex items-center justify-center overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={avatarUrl || defaultAvatar}
            alt="User Avatar"
          />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-[#c3f5ff] tracking-tight">Forge AI</h1>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#00e5ff]/10 text-[#00daf3] text-[10px] font-mono-tech font-semibold uppercase tracking-wider border border-[#00e5ff]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse"></span>
            Online
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onOpenExport && (
          <button
            onClick={onOpenExport}
            className="px-3 py-1.5 rounded-full bg-[#00e5ff]/10 text-[#00e5ff] hover:bg-[#00e5ff]/20 border border-[#00e5ff]/30 text-xs font-mono-tech font-bold flex items-center gap-1.5 transition-all active:scale-95"
            title="Exportar archivo STL / 3MF / GCODE"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span className="hidden xs:inline">Exportar STL</span>
          </button>
        )}

        <button
          onClick={onOpenSettings}
          className="w-10 h-10 flex items-center justify-center rounded-full text-[#bac9cc] hover:text-[#c3f5ff] hover:bg-[#00e5ff]/10 transition-all active:scale-95 duration-150"
          title="Configuración de Impresora"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>
  );
};
