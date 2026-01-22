"use server";

import type {
  SATProductServiceAttributes,
  SATPlanInfo,
} from "@/lib/types/sat";
import { searchSATSimilarity } from "@/lib/api/sat";
import { ServerApiError } from "@/lib/api/server-client";

/**
 * IA: Rankea resultados SAT existentes según el concepto del usuario
 */
async function rankSATResultsWithAI(
  userQuery: string,
  candidates: SATProductServiceAttributes[]
): Promise<{
  rankedResults: SATProductServiceAttributes[];
  explanation?: string;
  confidence: "high" | "medium" | "low";
}> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || candidates.length === 0) {
    return {
      rankedResults: candidates,
      confidence: "medium",
    };
  }

  const systemPrompt = `
Eres un asistente experto en facturación mexicana.
Tu tarea es ordenar claves de producto/servicio del SAT
según qué tan bien coinciden con el concepto del usuario.

REGLAS IMPORTANTES:
- SOLO puedes usar las claves proporcionadas
- NO inventes claves nuevas
- NO modifiques descripciones
- Devuelve máximo 5 resultados
- Explica brevemente por qué la PRIMERA opción es la más adecuada
- Si la coincidencia no es clara, indica confianza "low"

Responde SOLO en JSON válido.
`;

  const userPrompt = `
Concepto del usuario:
"${userQuery}"

Claves SAT disponibles:
${JSON.stringify(
  candidates.map((c) => ({
    id: c.id,
    descripcion: c.descripcion,
    incluir_iva_trasladado: c.incluir_iva_trasladado,
    incluir_ieps_trasladado: c.incluir_ieps_trasladado,
  })),
  null,
  2
)}

Devuelve el resultado en el siguiente formato:
{
  "rankedIds": ["id1", "id2", "id3"],
  "explanation": "explicación breve",
  "confidence": "high" | "medium" | "low"
}
`;

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.2,
          max_tokens: 400,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      }
    );

    if (!response.ok) throw new Error("OpenAI error");

    const data = await response.json();
    const parsed = JSON.parse(
      data.choices[0].message.content
    ) as {
      rankedIds: string[];
      explanation?: string;
      confidence: "high" | "medium" | "low";
    };

    const rankedMap = new Map(
      candidates.map((c) => [c.id, c])
    );

    const rankedResults = parsed.rankedIds
      .map((id) => rankedMap.get(id))
      .filter(Boolean) as SATProductServiceAttributes[];

    return {
      rankedResults:
        rankedResults.length > 0 ? rankedResults : candidates,
      explanation: parsed.explanation,
      confidence: parsed.confidence ?? "medium",
    };
  } catch (error) {
    console.error("Error ranking SAT results:", error);
    return {
      rankedResults: candidates,
      confidence: "medium",
    };
  }
}

/** Resultado exitoso de búsqueda SAT con IA */
export interface SearchSATSuccess {
  results: SATProductServiceAttributes[];
  aiExplanation?: string;
  confidence?: "high" | "medium" | "low";
  planInfo?: SATPlanInfo;
}

/** Error cuando se alcanza el límite de búsquedas IA del plan */
export interface SearchSATLimitError {
  error: "limit_reached";
  message: string;
}

export type SearchSATResult = SearchSATSuccess | SearchSATLimitError;

/**
 * Búsqueda SAT principal (HÍBRIDA + CONTROLADA).
 * Respeta límites del plan: maxResults, hasAIExplanations, 403 por límite IA.
 */
export async function searchSATWithAI(userQuery: string): Promise<SearchSATResult> {
  let quickResults;

  try {
    quickResults = await searchSATSimilarity(userQuery, 50);
  } catch (e) {
    if (e instanceof ServerApiError && e.status === 403) {
      const data = e.data as { message?: string } | undefined;
      const message =
        data?.message ??
        "La sugerencia inteligente está limitada en tu plan, actualiza para obtener resultados más precisos";
      return { error: "limit_reached", message };
    }
    throw e;
  }

  const planInfo = quickResults.planInfo;
  const maxResults = planInfo?.maxResults ?? null;
  const cap = maxResults ?? 5;

  if (!quickResults.items.length) {
    return { results: [], planInfo };
  }

  if (quickResults.items.length > 1) {
    const ranked = await rankSATResultsWithAI(userQuery, quickResults.items);
    const results = ranked.rankedResults.slice(0, cap);
    const aiExplanation =
      planInfo?.hasAIExplanations === true ? ranked.explanation : undefined;

    return {
      results,
      aiExplanation,
      confidence: ranked.confidence,
      planInfo,
    };
  }

  const single = quickResults.items[0];
  const limited = maxResults !== null ? [single].slice(0, maxResults) : [single];
  return {
    results: limited,
    confidence: "medium",
    planInfo,
  };
}


// "use server";

// /**
//  * Server Action para búsqueda con IA del catálogo SAT
//  * Interpreta el concepto del usuario y genera términos de búsqueda optimizados
//  */

// import type {
//   AISearchRequest,
//   AISearchResponse,
//   SATProductServiceAttributes,
// } from "@/lib/types/sat";
// import { searchSATSimilarity } from "@/lib/api/sat";

// /**
//  * Interpreta una consulta del usuario usando IA y genera términos de búsqueda optimizados
//  */
// export async function interpretSATQueryWithAI(
//   userQuery: string,
//   preliminaryResults?: SATProductServiceAttributes[]
// ): Promise<AISearchResponse> {
//   // Verificar que existe la API key
//   const apiKey = process.env.OPENAI_API_KEY;
//   if (!apiKey) {
//     // Fallback: usar búsqueda por similitud sin IA
//     const similarityResults = await searchSATSimilarity(userQuery, 20);
//     return {
//       searchTerms: [userQuery],
//       explanation:
//         "Búsqueda realizada usando similitud semántica. La integración con IA no está configurada.",
//       confidence: "medium",
//     };
//   }

//   // Construir el contexto basado SOLO en la información del catálogo SAT
//   const systemPrompt = `Eres un asistente especializado en interpretar conceptos de facturación mexicana y encontrar las claves de producto/servicio del SAT (Sistema de Administración Tributaria) más adecuadas.

// INFORMACIÓN DEL CATÁLOGO SAT:
// - El catálogo contiene productos y servicios con las siguientes propiedades:
//   * id: Clave numérica del SAT (ej: "80141600")
//   * descripcion: Descripción oficial del producto/servicio
//   * incluir_iva_trasladado: "Sí" | "No" | "Opcional"
//   * incluir_ieps_trasladado: "Sí" | "No" | "Opcional"
//   * palabras_similares: Palabras relacionadas para búsquedas
//   * Solo se muestran productos vigentes (sin fecha_fin_vigencia o fecha futura)

// ENDPOINTS DISPONIBLES:
// - /api/sat/search: Búsqueda básica (busca en descripcion, palabras_similares, id)
// - /api/sat/similarity: Búsqueda semántica con pg_trgm (máximo 50 resultados)
// - /api/sat/suggestions: Autocompletado (máximo 20 resultados)

// TUS RESPONSABILIDADES:
// 1. Interpretar el concepto del usuario en términos que coincidan con el catálogo SAT
// 2. Generar términos de búsqueda optimizados (palabras clave relevantes, máximo 5 términos)
// 3. Sugerir filtros de IVA/IEPS si el contexto lo indica
// 4. Proporcionar una explicación breve de tu interpretación (máximo 100 palabras)

// IMPORTANTE:
// - SOLO usa información del catálogo SAT proporcionado
// - NO inventes claves o descripciones que no existan
// - Si no estás seguro, indica "low" confidence
// - Los términos deben ser en español y relevantes para el catálogo mexicano
// - Responde SOLO en formato JSON válido`;

//   const userPrompt = `El usuario quiere facturar el siguiente concepto:

// "${userQuery}"

// ${
//   preliminaryResults && preliminaryResults.length > 0
//     ? `
// Resultados preliminares encontrados (${preliminaryResults.length}):
// ${preliminaryResults
//   .slice(0, 5)
//   .map(
//     (item, idx) =>
//       `${idx + 1}. Clave: ${item.id} - ${item.descripcion} (IVA: ${item.incluir_iva_trasladado}, IEPS: ${item.incluir_ieps_trasladado})`
//   )
//   .join("\n")}
// `
//     : ""
// }

// Analiza el concepto y proporciona:
// 1. Términos de búsqueda optimizados (array de strings, máximo 5 términos)
// 2. Explicación breve de por qué estos términos (máximo 100 palabras)
// 3. Filtros sugeridos de IVA/IEPS si aplica
// 4. Nivel de confianza (high/medium/low)

// Responde SOLO en formato JSON válido:
// {
//   "searchTerms": ["término1", "término2", ...],
//   "explanation": "explicación breve",
//   "suggestedFilters": {
//     "incluir_iva_trasladado": "Sí" | "No" | "Opcional" | null,
//     "incluir_ieps_trasladado": "Sí" | "No" | "Opcional" | null
//   },
//   "confidence": "high" | "medium" | "low"
// }`;

//   try {
//     // Petición a OpenAI
//     const response = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${apiKey}`,
//       },
//       body: JSON.stringify({
//         model: "gpt-4o-mini", // Modelo económico y rápido
//         messages: [
//           { role: "system", content: systemPrompt },
//           { role: "user", content: userPrompt },
//         ],
//         temperature: 0.3, // Bajo para respuestas más determinísticas
//         max_tokens: 500,
//         response_format: { type: "json_object" }, // Forzar JSON
//       }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(
//         `OpenAI API error: ${errorData.error?.message || response.statusText}`
//       );
//     }

//     const data = await response.json();
//     const aiResponse = JSON.parse(
//       data.choices[0]?.message?.content || "{}"
//     ) as AISearchResponse;

//     // Validar respuesta
//     if (!aiResponse.searchTerms || !Array.isArray(aiResponse.searchTerms)) {
//       throw new Error("Respuesta de IA inválida: searchTerms faltante");
//     }

//     return aiResponse;
//   } catch (error) {
//     // Fallback: usar búsqueda por similitud
//     console.error("Error en interpretación con IA:", error);
//     const similarityResults = await searchSATSimilarity(userQuery, 20);

//     return {
//       searchTerms: [userQuery],
//       explanation:
//         "Búsqueda realizada usando similitud semántica. La interpretación con IA no pudo completarse.",
//       confidence: "medium",
//     };
//   }
// }

// /**
//  * Búsqueda híbrida: primero similitud, luego IA si es necesario
//  */
// export async function searchSATWithAI(
//   userQuery: string
// ): Promise<{
//   results: SATProductServiceAttributes[];
//   aiExplanation?: string;
//   confidence?: "high" | "medium" | "low";
// }> {
//   // 1. Búsqueda rápida inicial (sin IA)
//   const quickResults = await searchSATSimilarity(userQuery, 20);

//   // 2. Si hay resultados suficientes, retornar
//   if (quickResults.total >= 3 && quickResults.items.length > 0) {
//     return {
//       results: quickResults.items,
//     };
//   }

//   // 3. Si no hay resultados suficientes, usar IA
//   const aiInterpretation = await interpretSATQueryWithAI(
//     userQuery,
//     quickResults.items
//   );

//   // 4. Búsquedas optimizadas con los términos de la IA
//   const searchPromises = aiInterpretation.searchTerms.map((term) =>
//     searchSATSimilarity(term, 10)
//   );

//   const allResults = await Promise.all(searchPromises);

//   // 5. Combinar y deduplicar resultados
//   const seenIds = new Set<string>();
//   const combinedResults: SATProductServiceAttributes[] = [];

//   for (const resultSet of allResults) {
//     for (const item of resultSet.items) {
//       if (!seenIds.has(item.id)) {
//         seenIds.add(item.id);
//         combinedResults.push(item);
//       }
//     }
//   }

//   // 6. Aplicar filtros sugeridos por IA si existen
//   let filteredResults = combinedResults;
//   if (aiInterpretation.suggestedFilters) {
//     const filters = aiInterpretation.suggestedFilters;
//     if (filters.incluir_iva_trasladado) {
//       filteredResults = filteredResults.filter(
//         (item) => item.incluir_iva_trasladado === filters.incluir_iva_trasladado
//       );
//     }
//     if (filters.incluir_ieps_trasladado) {
//       filteredResults = filteredResults.filter(
//         (item) =>
//           item.incluir_ieps_trasladado === filters.incluir_ieps_trasladado
//       );
//     }
//   }

//   return {
//     results: filteredResults.slice(0, 20), // Top 20
//     aiExplanation: aiInterpretation.explanation,
//     confidence: aiInterpretation.confidence,
//   };
// }
