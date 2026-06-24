'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SATSearchBar } from '@/app/dashboard/sat-search/components/SATSearchBar';
import { SATSuggestions } from '@/app/dashboard/sat-search/components/SATSuggestions';
import { SATSearchResults } from '@/app/dashboard/sat-search/components/SATSearchResults';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';
import { searchSATWithAI, type SearchSATSuccess } from '../actions';
import { getSATStatsClient } from '@/lib/api/sat.client';
import { useSubscription } from '@/lib/hooks/useSubscription';
import type { SATProductServiceAttributes, SATPlanInfo } from '@/lib/types/sat';
import type { Plan } from '@/lib/types/subscription';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertSourceBadge } from '@/components/common/AlertSourceBadge';

const RESULTS_PER_PAGE = 5;

const SUGGESTIONS = [
  'Venta de calzado deportivo',
  'Servicios de limpieza de oficinas',
  'Diseño gráfico publicitario',
];

const LIMIT_REACHED_MESSAGE =
  'La sugerencia inteligente está limitada en tu plan, actualiza para obtener resultados más precisos';

export function SATSearchContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SATProductServiceAttributes[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | undefined>();
  const [confidence, setConfidence] = useState<'high' | 'medium' | 'low' | undefined>();
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [planInfo, setPlanInfo] = useState<SATPlanInfo | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeModalMessage, setUpgradeModalMessage] = useState(LIMIT_REACHED_MESSAGE);

  const { subscription } = useSubscription();
  const currentPlan: Plan = subscription?.plan ?? 'FREE';

  useEffect(() => {
    getSATStatsClient()
      .then((r) => {
        setPlanInfo(r.planInfo);
        if (r.planInfo?.aiSearchesRemaining === 0) setLimitReached(true);
      })
      .catch(() => {});
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      setAiExplanation(undefined);
      setConfidence(undefined);
      setCurrentPage(1);
      return;
    }

    if (planInfo?.aiSearchesRemaining === 0 || limitReached) {
      setUpgradeModalMessage(LIMIT_REACHED_MESSAGE);
      setShowUpgradeModal(true);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setSearchQuery(query);
    setCurrentPage(1);

    try {
      const data = await searchSATWithAI(query);

      if ('error' in data && data.error === 'limit_reached') {
        setLimitReached(true);
        setUpgradeModalMessage(data.message);
        setShowUpgradeModal(true);
        if (planInfo && planInfo.aiSearchesRemaining !== null) {
          setPlanInfo({ ...planInfo, aiSearchesRemaining: 0 });
        }
        return;
      }

      const success = data as SearchSATSuccess;
      setResults(success.results);
      setAiExplanation(success.aiExplanation);
      setConfidence(success.confidence);
      if (success.planInfo) setPlanInfo(success.planInfo);
    } catch (error) {
      console.error('Error en búsqueda con IA:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  const resultsPerPage = Math.min(RESULTS_PER_PAGE, planInfo?.maxResults ?? RESULTS_PER_PAGE);
  const totalPages = Math.ceil(results.length / resultsPerPage) || 1;
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const paginatedResults = results.slice(startIndex, endIndex);

  const hasAIExplanations = planInfo?.hasAIExplanations ?? true;

  return (
    <div className="from-background to-muted/20 flex min-h-screen flex-col bg-gradient-to-b">
      <div className="container mx-auto flex flex-1 flex-col gap-8 px-4 py-8 md:px-6 lg:px-8">
        {/* Header */}
        <div data-tour="sat-search-hero" className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Encuentra tu Clave SAT con <span className="text-primary">IA</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg md:text-xl">
            Describe tu actividad comercial con palabras naturales y nuestro motor de inteligencia
            artificial encontrará el código exacto para tu facturación.
          </p>
        </div>

        {/* Barra de búsqueda */}
        <SATSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          isSearching={isSearching}
          disabledByLimit={planInfo?.aiSearchesRemaining === 0 || limitReached}
          aiSearchesRemaining={planInfo?.aiSearchesRemaining}
          aiSearchesLimit={planInfo?.aiSearchesLimit}
        />

        <div
          data-tour="sat-search-plan-limit"
          className="border-primary/20 bg-primary/5 text-muted-foreground rounded-2xl border p-4 text-sm shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="text-xs">
              Plan {currentPlan}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {planInfo?.aiSearchesLimit === null
                ? 'IA ilimitada'
                : `${planInfo?.aiSearchesLimit} sugerencias IA/mes`}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            {planInfo
              ? planInfo.aiSearchesRemaining === null
                ? 'Búsquedas inteligentes ilimitadas este mes.'
                : `${planInfo.aiSearchesRemaining} de ${
                    planInfo.aiSearchesLimit ?? '?'
                  } búsquedas IA restantes.`
              : 'Cargando límites de tu plan...'}
          </p>
        </div>

        {/* Aviso cuando se acabaron las búsquedas con IA */}
        {(planInfo?.aiSearchesRemaining === 0 || limitReached) && (
          <Alert className="border-amber-500/50 bg-amber-500/10">
            <Sparkles className="size-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="flex flex-wrap items-center gap-2">
              <span>Límite de sugerencia inteligente alcanzado</span>
              <AlertSourceBadge source="satSearch" />
            </AlertTitle>
            <AlertDescription className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{LIMIT_REACHED_MESSAGE}</span>
              <Button
                size="sm"
                className="w-fit shrink-0 gap-2"
                onClick={() => {
                  setUpgradeModalMessage(LIMIT_REACHED_MESSAGE);
                  setShowUpgradeModal(true);
                }}
              >
                <Sparkles className="size-4" />
                Mejorar plan
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Sugerencias */}
        {!hasSearched && (
          <SATSuggestions suggestions={SUGGESTIONS} onSuggestionClick={handleSuggestionClick} />
        )}

        {/* Explicación de IA (solo si el plan lo permite) */}
        {hasSearched && hasAIExplanations && aiExplanation && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex flex-1 flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">IA (GPT-4o-mini)</Badge>
                    <Badge
                      variant={
                        confidence === 'high'
                          ? 'default'
                          : confidence === 'medium'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      Confianza: {confidence?.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    <strong>Análisis de IA:</strong> {aiExplanation}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentPlan={currentPlan}
          feature={upgradeModalMessage}
          recommendedPlan="BASIC"
        />

        {/* Resultados */}
        {hasSearched && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">Resultados</span>
                {results.length > 0 && (
                  <span className="text-muted-foreground text-sm">
                    Página {currentPage} de {totalPages} • {results.length} resultados
                  </span>
                )}
              </div>
            </div>

            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner message="Buscando en el catálogo SAT..." />
              </div>
            ) : results.length > 0 ? (
              <>
                <SATSearchResults results={paginatedResults} />

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="gap-2"
                    >
                      <ChevronLeft className="size-4" />
                      Anterior
                    </Button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="h-10 w-10"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="gap-2"
                    >
                      Siguiente
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-card rounded-lg border p-8 text-center">
                <p className="text-muted-foreground">
                  No se encontraron resultados para tu búsqueda. Intenta con otros términos.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
