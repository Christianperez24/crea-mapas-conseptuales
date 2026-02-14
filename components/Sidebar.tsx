
import React from 'react';
import { HistoryItem } from '../types';

interface SidebarProps {
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ history, onSelectHistory, onClearHistory }) => {
  return (
    <div className="w-full lg:w-96 h-full border-r border-slate-100 flex flex-col bg-white">
      <div className="p-10 border-b border-slate-50 flex items-center justify-between">
        <h2 className="font-black text-slate-900 text-xl tracking-tight uppercase">Bóveda</h2>
        {history.length > 0 && (
          <button 
            onClick={onClearHistory}
            className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors"
          >
            Vaciar
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-20 opacity-20 grayscale">
             <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4"><path d="M12 2v20"/><path d="m17 17-5 5-5-5"/><path d="m17 7-5-5-5 5"/></svg>
            <p className="text-sm font-bold tracking-widest uppercase">Sin Registros</p>
          </div>
        ) : (
          history.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectHistory(item)}
              className="w-full text-left p-6 rounded-[1.5rem] hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group relative overflow-hidden shadow-sm"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                 <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>
              <p className="text-xs font-black text-orange-600 mb-2 uppercase tracking-widest">MAPA MERMAID</p>
              <p className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight">
                {item.input}
              </p>
              <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-tighter">
                {new Date(item.timestamp).toLocaleTimeString()} · {new Date(item.timestamp).toLocaleDateString()}
              </p>
            </button>
          ))
        )}
      </div>
      <div className="p-8 border-t border-slate-50">
        <div className="bg-slate-900 p-6 rounded-[1.5rem] text-white">
          <p className="text-[10px] text-orange-500 font-black mb-2 uppercase tracking-[0.2em]">Tecnología:</p>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Soporte <b>Mermaid Perfect</b>. Exportación vía <b>Kroki Engine</b> para máxima compatibilidad.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
