'use client';

import { useReducer } from 'react';
import {
  Share2,
  Copy,
  Check,
  Mail,
  Clock,
  AlertTriangle,
  ExternalLink,
  Info,
  CalendarDays,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { generatePublicReport } from '@/lib/api/public-reports';
import { formatDateLong } from '@/lib/utils/format';
import { ApiError } from '@/lib/api/client';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';
import {
  initialShareReportUiState,
  shareReportUiReducer,
} from './share-report-ui-reducer';
import { PRODUCT_FEATURES } from '@/lib/constants/product-features';
const MONTHS_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

interface ShareReportButtonProps {
  /** ID del perfil/cliente seleccionado. Si es undefined, el botón se deshabilita. */
  profileId?: string;
  /** Nombre del cliente para mostrarlo en el modal */
  clientName?: string;
  mes: number;
  año: number;
}

export function ShareReportButton({ profileId, clientName, mes, año }: ShareReportButtonProps) {
  const [ui, dispatch] = useReducer(shareReportUiReducer, initialShareReportUiState);
  const {
    isOpen,
    expiresInDays,
    sendToEmail,
    isLoading,
    error,
    result,
    hasCopied,
    isUpgradeModalOpen,
  } = ui;

  const { subscription } = useSubscription();

  const currentPlan = subscription?.plan ?? 'FREE';

  const isDisabled = !profileId;
  const monthLabel = `${MONTHS_ES[(mes - 1) % 12]} ${año}`;

  const handleOpen = (open: boolean) => {
    dispatch({ type: 'dialog_open_change', open });
  };

  // URL final con mes/año como query string — es la que se comparte con el cliente
  const shareUrl = result
    ? (() => {
        const qs = new URLSearchParams({ mes: String(mes), año: String(año) });
        return `${result.url}?${qs.toString()}`;
      })()
    : '';

  const handleGenerate = async () => {
    if (!profileId) return;
    dispatch({ type: 'generate_start' });

    try {
      const response = await generatePublicReport({
        profile_id: profileId,
        expires_in_days: expiresInDays,
        ...(sendToEmail.trim() && { send_to_email: sendToEmail.trim() }),
      });
      dispatch({ type: 'generate_success', result: response });
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        const data = err.data as { error?: string; message?: string } | undefined;
        const serverMsg = data?.message ?? '';
        const isLimitError = serverMsg.toLowerCase().includes('límite');
        if (isLimitError) {
          dispatch({
            type: 'generate_limit_error',
            message:
              serverMsg ||
              'Has alcanzado el límite de reportes activos. Revoca uno existente para crear uno nuevo.',
          });
        } else {
          dispatch({ type: 'generate_open_upgrade' });
        }
      } else {
        dispatch({ type: 'generate_generic_error' });
      }
    } finally {
      dispatch({ type: 'generate_end' });
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    dispatch({ type: 'set_has_copied', value: true });
    setTimeout(() => dispatch({ type: 'set_has_copied', value: false }), 2000);
  };

  const trigger = (
    <Button
      variant="outline"
      className="border-primary/50 text-primary hover:bg-primary/10"
      disabled={isDisabled}
      onClick={() => !isDisabled && handleOpen(true)}
    >
      <Share2 className="mr-2 h-4 w-4" />
      Compartir
    </Button>
  );

  return (
    <>
      {/* Botón con tooltip cuando no hay cliente seleccionado */}
      {isDisabled ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>{trigger}</span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Selecciona un cliente para compartir su reporte</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        trigger
      )}

      {/* Modal */}
      <Dialog open={isOpen} onOpenChange={handleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="text-primary h-5 w-5" />
              Compartir reporte con el cliente
            </DialogTitle>
            <DialogDescription>
              Genera un link de acceso para que{' '}
              <span className="text-foreground font-medium">{clientName ?? 'el cliente'}</span>{' '}
              {PRODUCT_FEATURES.taxEstimate
                ? 'pueda ver sus cifras del periodo y una estimación fiscal informativa (ISR y IVA orientativos), sin necesidad de crear una cuenta. No sustituye declaraciones ante el SAT.'
                : 'pueda ver sus cifras del periodo, sin necesidad de crear una cuenta.'}
            </DialogDescription>
          </DialogHeader>

          {/* Estado: sin resultado aún */}
          {!result && (
            <div className="space-y-5">
              {/* Aviso del periodo */}
              <div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                <div>
                  <p className="text-foreground text-sm font-medium">
                    Periodo a compartir:{' '}
                    <Badge variant="secondary" className="ml-1 capitalize">
                      {monthLabel}
                    </Badge>
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    El reporte mostrará las cifras del periodo seleccionado en el dashboard. El link
                    público usa el mismo mes y año en la URL
                    {PRODUCT_FEATURES.taxEstimate
                      ? ' e incluye la estimación fiscal por régimen cuando esté disponible.'
                      : '.'}
                  </p>
                </div>
              </div>

              {/* Días de validez */}
              <div className="space-y-2">
                <Label htmlFor="expires-days" className="flex items-center gap-2">
                  <Clock className="text-muted-foreground h-3.5 w-3.5" />
                  ¿Cuántos días debe estar disponible el link?
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="expires-days"
                    type="number"
                    min={1}
                    max={365}
                    value={expiresInDays}
                    onChange={(e) =>
                      dispatch({
                        type: 'set_expires_in_days',
                        days: Math.max(1, Math.min(365, Number(e.target.value))),
                      })
                    }
                    className="w-28"
                  />
                  <span className="text-muted-foreground text-sm">días</span>
                </div>
                <p className="text-muted-foreground text-xs">
                  Después de ese tiempo, el link dejará de funcionar automáticamente.
                </p>
              </div>

              {/* Email opcional */}
              <div className="space-y-2">
                <Label htmlFor="share-email" className="flex items-center gap-2">
                  <Mail className="text-muted-foreground h-3.5 w-3.5" />
                  Enviar el link por correo{' '}
                  <span className="text-muted-foreground text-xs font-normal">(opcional)</span>
                </Label>
                <Input
                  id="share-email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={sendToEmail}
                  onChange={(e) => dispatch({ type: 'set_send_to_email', value: e.target.value })}
                />
                <p className="text-muted-foreground flex items-start gap-1.5 text-xs">
                  <Info className="mt-0.5 h-3 w-3 shrink-0" />
                  Si lo dejas en blanco, solo obtendrás el link para enviarlo tú mismo.
                </p>
              </div>

              {/* Error */}
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button className="w-full" onClick={handleGenerate} disabled={isLoading}>
                {isLoading ? 'Generando link...' : 'Generar link de acceso'}
              </Button>
            </div>
          )}

          {/* Estado: link generado */}
          {result && (
            <div className="space-y-4">
              {/* Aviso si el email falló */}
              {result.message && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              )}

              {/* Confirmación visual */}
              <div className="border-primary/20 bg-primary/5 flex items-start gap-3 rounded-lg border p-3">
                <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="text-foreground text-sm font-medium">¡Link generado!</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    Válido hasta el{' '}
                    <span className="text-foreground font-medium">
                      {formatDateLong(result.expires_at)}
                    </span>
                  </p>
                </div>
              </div>

              {/* URL + botones */}
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">Link para compartir</Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={shareUrl}
                    className="font-mono text-xs"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    title="Copiar link"
                  >
                    {hasCopied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    asChild
                    title="Abrir en nueva pestaña"
                  >
                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Abrir reporte en nueva pestaña"
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden />
                    </a>
                  </Button>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => dispatch({ type: 'reset_result' })}
              >
                Generar otro link
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => dispatch({ type: 'close_upgrade_modal' })}
        currentPlan={currentPlan}
        feature="Los reportes públicos no están disponibles en tu plan actual. Actualiza a Básico o superior para compartir reportes con tus clientes."
        recommendedPlan="BASIC"
      />
    </>
  );
}
