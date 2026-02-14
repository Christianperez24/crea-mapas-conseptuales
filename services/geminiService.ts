
import { GoogleGenAI, Type } from "@google/genai";
import { ConceptMapResponse, MapDepth, MapType } from "../types";

export const generateConceptMap = async (
  input: string, 
  depth: MapDepth = 'detallado', 
  mapType: MapType = 'jerarquico',
  imageData?: { data: string; mimeType: string }
): Promise<ConceptMapResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `Actúa como un experto en arquitectura de información y diseño visual. Tu objetivo es generar mapas conceptuales perfectos compatibles con Mermaid y Kroki.io.

### REGLAS DE SINTAXIS MERMAID (CRÍTICO):
1. ESTRUCTURA LIMPIA: La primera línea debe ser únicamente 'graph TD' (para jerárquico o radial) o 'graph LR' (para flujo), sin texto adicional en esa línea.
2. PROHIBIDO: No uses puntos y coma (;) para separar nodos o líneas.
3. SALTOS DE LÍNEA: Es OBLIGATORIO incluir un salto de línea real (\\n) después de cada conexión o definición de estilo. Cada instrucción debe ir en su propia línea física.
4. ETIQUETAS SEGURAS: Escribe SIEMPRE los nombres de los nodos entre comillas dobles ["Texto"] para evitar errores con caracteres especiales, tildes o símbolos. Ejemplo: A["Nodo Principal"] --> B["Subconcepto"].
5. CONEXIONES: Cada conexión debe ir en una línea nueva. Ejemplo:
   graph TD
   A["Raíz"] --> B["Hijo 1"]
   B["Hijo 1"] --> C["Nieto"]

### REGLAS DE DISEÑO:
- Los conceptos deben ser breves (máximo 5 palabras).
- Usa etiquetas de enlace claras (verbos cortos sobre las flechas).
- Diferencia niveles con colores usando classDef al final del código (cada uno en su propia línea). Ejemplo:
  classDef raiz fill:#f96,stroke:#333,stroke-width:4px
  classDef nivel1 fill:#69f,stroke:#333,stroke-width:2px
  classDef nivel2 fill:#9f6,stroke:#333,stroke-width:1px

### AUTOEVALUACIÓN:
- Incluye 3 preguntas de autoevaluación basadas estrictamente en la lógica del mapa generado.`;

  try {
    const parts: any[] = [{ 
      text: `Diseña un mapa conceptual de tipo '${mapType}' con profundidad '${depth}' sobre el siguiente contenido: ${input}. 
      RECUERDA: Sin puntos y coma, con saltos de línea reales entre cada nodo, y etiquetas entre comillas dobles. 
      Devuelve un JSON con 'diagramCode' (Mermaid string con saltos de línea \\n) y 'questions'.` 
    }];
    
    if (imageData) {
      parts.push({
        inlineData: {
          data: imageData.data,
          mimeType: imageData.mimeType
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagramCode: {
              type: Type.STRING,
              description: "Código Mermaid formateado con saltos de línea reales (\\n), sin puntos y coma, y etiquetas en comillas.",
            },
            questions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 preguntas de autoevaluación pedagógica.",
            },
            explanation: { type: Type.STRING }
          },
          required: ["diagramCode", "questions"]
        }
      },
    });

    const jsonStr = response.text?.trim() || '{}';
    return JSON.parse(jsonStr) as ConceptMapResponse;
  } catch (error) {
    console.error("Error generating concept map:", error);
    throw error;
  }
};
