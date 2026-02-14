
import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidViewerProps {
  chart: string;
  onSvgGenerated?: (svgData: string) => void;
}

const MermaidViewer: React.FC<MermaidViewerProps> = ({ chart, onSvgGenerated }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose',
      fontFamily: 'sans-serif',
      flowchart: {
        // CRÍTICO: htmlLabels debe ser false para permitir la descarga como imagen.
        // Los labels HTML (foreignObject) son considerados un riesgo de seguridad por los navegadores
        // al intentar dibujarlos en un canvas, lo que causa el error "Tainted Canvas".
        htmlLabels: false, 
        curve: 'basis',
        useMaxWidth: true
      }
    });
  }, []);

  useEffect(() => {
    const renderChart = async () => {
      if (!containerRef.current || !chart) return;
      
      setIsRendering(true);
      try {
        const id = `mermaid-chart-${Math.random().toString(36).substr(2, 9)}`;
        
        containerRef.current.innerHTML = '';
        
        const { svg } = await mermaid.render(id, chart);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          if (onSvgGenerated) {
            onSvgGenerated(svg);
          }
        }
      } catch (error) {
        console.error("Mermaid render error:", error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-xl border border-red-100 w-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p class="text-red-600 font-bold">Error de Sintaxis en el Mapa</p>
              <p class="text-slate-500 text-sm mt-2">La IA generó un código que Mermaid no pudo procesar. Intenta simplificar el texto o presiona "Generar Mapa" nuevamente.</p>
              <div class="mt-4 p-2 bg-white border border-red-200 rounded text-[10px] text-red-400 font-mono overflow-auto max-w-full">
                ${error instanceof Error ? error.message : 'Unknown parsing error'}
              </div>
            </div>
          `;
        }
      } finally {
        setIsRendering(false);
      }
    };

    renderChart();
  }, [chart, onSvgGenerated]);

  return (
    <div className="w-full overflow-auto bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px] flex justify-center items-start relative">
      {isRendering && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      <div 
        ref={containerRef} 
        id="mermaid-container" 
        className="w-full flex justify-center"
      ></div>
    </div>
  );
};

export default MermaidViewer;
