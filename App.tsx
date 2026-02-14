
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateConceptMap } from './services/geminiService';
import KrokiRenderer from './components/KrokiRenderer';
import Sidebar from './components/Sidebar';
import { HistoryItem, GenerationStatus, MapDepth, MapType } from './types';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [depth, setDepth] = useState<MapDepth>('detallado');
  const [mapType, setMapType] = useState<MapType>('jerarquico');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<{ data: string; mimeType: string } | undefined>();
  
  const [diagramCode, setDiagramCode] = useState<string>('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mapmind_kroki_v2');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setImagePreview(reader.result as string);
      setImageBase64({ data: base64String, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!input.trim() && !imageBase64) return;

    setError(null);
    setStatus('analyzing');
    
    try {
      const result = await generateConceptMap(input, depth, mapType, imageBase64);
      setDiagramCode(result.diagramCode);
      setQuestions(result.questions || []);
      setStatus('success');

      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        input: input.trim() || "Análisis Arquitectónico",
        diagramCode: result.diagramCode,
        questions: result.questions,
        timestamp: Date.now()
      };
      
      const updatedHistory = [newItem, ...history].slice(0, 20);
      setHistory(updatedHistory);
      localStorage.setItem('mapmind_kroki_v2', JSON.stringify(updatedHistory));
    } catch (err) {
      console.error(err);
      setError("Error en la arquitectura del diagrama. Intenta de nuevo.");
      setStatus('error');
    }
  };

  const handleSelectHistory = useCallback((item: HistoryItem) => {
    setInput(item.input);
    setDiagramCode(item.diagramCode);
    setQuestions(item.questions || []);
    setImagePreview(null);
    setImageBase64(undefined);
    setStatus('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const clearInputs = () => {
    setInput('');
    setImagePreview(null);
    setImageBase64(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const mapTypeInfo: Record<MapType, { label: string; icon: React.ReactNode }> = {
    jerarquico: { 
      label: 'Jerárquico', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="m17 17-5 5-5-5"/><path d="m17 7-5-5-5 5"/></svg> 
    },
    flujo: { 
      label: 'De Flujo', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18"/><path d="m15 18 6-6-6-6"/></svg> 
    },
    radial: { 
      label: 'Radial', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 3v6"/><path d="M12 15v6"/><path d="M21 12h-6"/><path d="M9 12H3"/></svg> 
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#fcfdfe]">
      <Sidebar 
        history={history} 
        onSelectHistory={handleSelectHistory} 
        onClearHistory={() => { setHistory([]); localStorage.removeItem('mapmind_kroki_v2'); }} 
      />

      <main className="flex-1 p-4 lg:p-12 max-w-7xl mx-auto w-full">
        <header className="mb-12 text-center lg:text-left">
          <div className="flex items-center gap-4 mb-4 justify-center lg:justify-start">
            <div className="bg-slate-900 p-4 rounded-[1.5rem] shadow-2xl shadow-slate-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="m17 17-5 5-5-5"/><path d="m17 7-5-5-5 5"/></svg>
            </div>
            <div>
              <h1 className="text-5xl font-[900] text-slate-900 tracking-tighter leading-none">MapMind <span className="text-orange-600">Architect</span></h1>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Professional Information Design</p>
            </div>
          </div>
          <p className="text-slate-500 max-w-2xl text-xl font-medium leading-relaxed">
            Generación perfecta de mapas conceptuales mediante Mermaid & Kroki.io.
          </p>
        </header>

        <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm mb-12">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <label htmlFor="input" className="text-xs font-black text-slate-500 uppercase tracking-widest">Información de Origen:</label>
              <button onClick={clearInputs} className="text-xs font-bold text-slate-400 hover:text-orange-600 transition-colors">Resetear Todo</button>
            </div>
            <textarea
              id="input"
              className="w-full h-44 p-6 border border-slate-100 rounded-3xl bg-slate-50 focus:bg-white focus:ring-[12px] focus:ring-orange-50/50 focus:border-orange-500 outline-none transition-all resize-none text-slate-800 placeholder-slate-300 text-lg font-medium shadow-inner"
              placeholder="Introduce un tema o describe la estructura de información..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
            <div>
              <label className="block text-xs font-black text-slate-500 mb-4 uppercase tracking-widest">Esquema Arquitectónico:</label>
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(mapTypeInfo) as MapType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setMapType(type)}
                    className={`flex flex-col items-center justify-center gap-3 px-2 py-6 text-xs font-black rounded-[1.5rem] border-2 transition-all group ${
                      mapType === type 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xl shadow-slate-200 scale-[1.03]' 
                        : 'bg-white text-slate-500 border-slate-100 hover:border-orange-200 hover:bg-orange-50/30'
                    }`}
                  >
                    <span className={mapType === type ? 'text-orange-500' : 'text-slate-300 group-hover:text-orange-400'}>
                      {mapTypeInfo[type].icon}
                    </span>
                    {mapTypeInfo[type].label.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 mb-4 uppercase tracking-widest">Nivel de Precisión:</label>
                <div className="flex bg-slate-100 p-2 rounded-2xl">
                  <button 
                    onClick={() => setDepth('resumido')}
                    className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${depth === 'resumido' ? 'bg-white text-orange-600 shadow-lg' : 'text-slate-500'}`}
                  >
                    RESUMIDO
                  </button>
                  <button 
                    onClick={() => setDepth('detallado')}
                    className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${depth === 'detallado' ? 'bg-white text-orange-600 shadow-lg' : 'text-slate-500'}`}
                  >
                    DETALLADO
                  </button>
                </div>
              </div>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-4 p-5 border-2 border-dashed rounded-[1.5rem] cursor-pointer transition-all ${
                  imagePreview ? 'border-orange-400 bg-orange-50' : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                <div className={`p-3 rounded-xl ${imagePreview ? 'bg-orange-200 text-orange-800' : 'bg-slate-100 text-slate-400'}`}>
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-black uppercase tracking-tight ${imagePreview ? 'text-orange-700' : 'text-slate-600'}`}>
                    {imagePreview ? 'Captura Lista' : 'Escanear Documento (OCR)'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Multimodal Flash Processing</p>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={(!input.trim() && !imageBase64) || status === 'analyzing'}
            className="w-full py-6 rounded-[2rem] font-black text-white text-lg tracking-widest transition-all flex items-center justify-center gap-4 bg-slate-900 hover:bg-orange-600 shadow-2xl shadow-slate-200 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none"
          >
            {status === 'analyzing' ? (
              <><svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>ARQUITECTANDO DIAGRAMA...</>
            ) : (
              <><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>DESPLEGAR MAPA PERFECTO</>
            )}
          </button>
        </section>

        {status === 'success' && diagramCode && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <KrokiRenderer code={diagramCode} />

            {questions.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-[3s]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  </div>
                  <h3 className="text-3xl font-[900] text-slate-900 mb-10 tracking-tight flex items-center gap-4">
                    <div className="bg-orange-100 p-3 rounded-2xl text-orange-600 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                    Taller de Autoevaluación
                  </h3>
                  <div className="grid gap-6">
                    {questions.map((q, idx) => (
                      <div key={idx} className="flex gap-8 items-center bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 hover:border-orange-200 hover:bg-white transition-all shadow-sm hover:shadow-xl group">
                        <span className="text-4xl font-black text-slate-100 group-hover:text-orange-500 transition-colors">0{idx + 1}</span>
                        <p className="text-slate-800 text-lg font-semibold leading-snug">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-slate-900 p-12 rounded-[4rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-transparent pointer-events-none"></div>
                  <div className="relative z-10">
                    <h4 className="text-xl font-black mb-6 uppercase tracking-widest text-orange-500">Diseñador AI</h4>
                    <p className="text-slate-300 text-sm leading-relaxed font-medium">
                      Diagrama renderizado mediante infraestructura vectorial de Kroki.io. Topología optimizada para reducir carga cognitiva.
                    </p>
                  </div>
                  <div className="pt-8 border-t border-white/10 relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Infrastructure Active</p>
                    <p className="text-xs font-bold mt-1">Mermaid 11.x Support</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-8 p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-red-600 animate-in fade-in zoom-in">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
             <p className="font-bold">{error}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
