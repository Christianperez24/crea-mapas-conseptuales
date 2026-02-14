
import React, { useMemo, useState } from 'react';

interface KrokiRendererProps {
  code: string;
  onUrlGenerated?: (url: string) => void;
}

declare const pako: any;

const KrokiRenderer: React.FC<KrokiRendererProps> = ({ code, onUrlGenerated }) => {
  const [copied, setCopied] = useState(false);

  const krokiUrl = useMemo(() => {
    if (!code) return null;
    try {
      const data = new TextEncoder().encode(code);
      const compressed = pako.deflate(data, { level: 9 });
      
      let binary = '';
      const bytes = new Uint8Array(compressed);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
      
      const url = `https://kroki.io/mermaid/svg/${base64}`;
      if (onUrlGenerated) onUrlGenerated(url);
      return url;
    } catch (err) {
      console.error("Kroki encoding error:", err);
      return null;
    }
  }, [code, onUrlGenerated]);

  const jpegUrl = useMemo(() => krokiUrl?.replace('/svg/', '/jpeg/'), [krokiUrl]);
  const pngUrl = useMemo(() => krokiUrl?.replace('/svg/', '/png/'), [krokiUrl]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!krokiUrl) return null;

  return (
    <div className="space-y-8">
      <div className="w-full bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col items-center gap-8">
        <div className="w-full flex justify-between items-center px-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Previsualización Arquitectónica</h3>
          <div className="flex gap-2">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold">MERMAID</span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold">SVG</span>
          </div>
        </div>

        <div className="w-full overflow-auto max-h-[70vh] flex justify-center py-4 bg-slate-50 rounded-3xl border border-slate-100/50">
          <img 
            src={krokiUrl} 
            alt="Diagrama Conceptual" 
            className="max-w-full h-auto transition-transform hover:scale-[1.01]"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-3 border-t border-slate-100 pt-8 w-full">
          <a 
            href={krokiUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
            KROKI (FULL)
          </a>

          <a 
            href={jpegUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-3 bg-orange-600 text-white rounded-2xl text-[11px] font-black hover:bg-orange-700 transition-all flex items-center gap-2 shadow-lg shadow-orange-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            DESCARGAR JPG
          </a>

          <a 
            href={pngUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-[11px] font-black hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            DESCARGAR PNG
          </a>
          
          <button 
            onClick={copyToClipboard}
            className={`px-6 py-3 rounded-2xl text-[11px] font-black transition-all flex items-center gap-2 border-2 ${copied ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-slate-100 text-slate-600 hover:border-orange-200'}`}
          >
            {copied ? (
              <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>COPIADO</>
            ) : (
              <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>CÓDIGO FUENTE</>
            )}
          </button>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-100 p-8 rounded-[2rem] flex items-start gap-6">
        <div className="bg-orange-600 p-3 rounded-2xl text-white shadow-lg shadow-orange-200 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </div>
        <div>
          <h4 className="font-black text-orange-900 text-sm uppercase tracking-wider mb-2">Instrucciones de Exportación Profesional</h4>
          <p className="text-orange-800 text-sm leading-relaxed">
            Utiliza los botones de descarga directa para obtener tu mapa en <b>JPG</b> o <b>PNG</b>. Si necesitas formatos adicionales como <b>PDF</b>, haz clic en el botón 'KROKI (FULL)' para acceder a la interfaz avanzada de Kroki.io.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bloque de Código Mermaid</span>
          <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">UTF-8 Encoded</span>
        </div>
        <pre className="text-slate-300 font-mono text-xs overflow-auto max-h-48 p-4 bg-slate-950/50 rounded-xl border border-white/5">
          {code}
        </pre>
      </div>
    </div>
  );
};

export default KrokiRenderer;
