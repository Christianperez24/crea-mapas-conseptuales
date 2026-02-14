
export interface ConceptMapResponse {
  diagramCode: string;
  explanation?: string;
  questions: string[];
}

export type MapDepth = 'resumido' | 'detallado';
export type MapType = 'jerarquico' | 'flujo' | 'radial';

export type GenerationStatus = 'idle' | 'analyzing' | 'rendering' | 'success' | 'error';

export interface HistoryItem {
  id: string;
  input: string;
  diagramCode: string;
  questions?: string[];
  timestamp: number;
}
