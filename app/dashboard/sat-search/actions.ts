'use server';

import type { SATProductServiceAttributes, SATPlanInfo } from '@/lib/types/sat';
import { searchSATSimilarity } from '@/lib/api/sat';
import { ServerApiError } from '@/lib/api/server-client';
import { requireAuth } from '@/lib/auth/require-auth';

/**
 * IA: Rankea resultados SAT existentes según el concepto del usuario
 */
async function rankSATResultsWithAI(
  userQuery: string,
  candidates: SATProductServiceAttributes[]
): Promise<{
  rankedResults: SATProductServiceAttributes[];
  explanation?: string;
  confidence: 'high' | 'medium' | 'low';
}> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || candidates.length === 0) {
    return {
      rankedResults: candidates,
      confidence: 'medium',
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
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 400,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) throw new Error('OpenAI error');

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content) as {
      rankedIds: string[];
      explanation?: string;
      confidence: 'high' | 'medium' | 'low';
    };

    const rankedMap = new Map(candidates.map((c) => [c.id, c]));

    const rankedResults = parsed.rankedIds.flatMap((id) => {
      const match = rankedMap.get(id);
      return match ? [match] : [];
    });

    return {
      rankedResults: rankedResults.length > 0 ? rankedResults : candidates,
      explanation: parsed.explanation,
      confidence: parsed.confidence ?? 'medium',
    };
  } catch (error) {
    console.error('Error ranking SAT results:', error);
    return {
      rankedResults: candidates,
      confidence: 'medium',
    };
  }
}

/** Resultado exitoso de búsqueda SAT con IA */
export interface SearchSATSuccess {
  results: SATProductServiceAttributes[];
  aiExplanation?: string;
  confidence?: 'high' | 'medium' | 'low';
  planInfo?: SATPlanInfo;
}

/** Error cuando se alcanza el límite de búsquedas IA del plan */
export interface SearchSATLimitError {
  error: 'limit_reached';
  message: string;
}

export type SearchSATResult = SearchSATSuccess | SearchSATLimitError;

/**
 * Búsqueda SAT principal (HÍBRIDA + CONTROLADA).
 * Respeta límites del plan: maxResults, hasAIExplanations, 403 por límite IA.
 */
export async function searchSATWithAI(userQuery: string): Promise<SearchSATResult> {
  await requireAuth();

  let quickResults;

  try {
    quickResults = await searchSATSimilarity(userQuery, 50);
  } catch (e) {
    if (e instanceof ServerApiError && e.status === 403) {
      const data = e.data as { message?: string } | undefined;
      const message =
        data?.message ??
        'La sugerencia inteligente está limitada en tu plan, actualiza para obtener resultados más precisos';
      return { error: 'limit_reached', message };
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
    const aiExplanation = planInfo?.hasAIExplanations === true ? ranked.explanation : undefined;

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
    confidence: 'medium',
    planInfo,
  };
}
