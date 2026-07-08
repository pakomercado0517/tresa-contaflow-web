'use client';

import { useEffect, useRef, useState } from 'react';
import { loginWithGoogleAction } from '../actions';
import {
  getGoogleOAuthClientId,
  loadGoogleIdentityScript,
} from '@/lib/google/google-identity-client';

const MISSING_CLIENT_ID_ERROR =
  'Falta NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID (ID de cliente OAuth web de Google/Firebase).';

export function GoogleLoginButton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const clientId = getGoogleOAuthClientId();
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const error = clientId ? runtimeError : MISSING_CLIENT_ID_ERROR;

  useEffect(() => {
    if (!clientId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        await loadGoogleIdentityScript();
        if (cancelled || !containerRef.current || !window.google?.accounts?.id) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (!response.credential) {
              setRuntimeError('No se recibió credencial de Google');
              return;
            }

            setIsPending(true);
            setRuntimeError(null);
            void loginWithGoogleAction(response.credential).then((result) => {
              if (result.error) {
                setRuntimeError(result.error);
              }
              setIsPending(false);
            });
          },
        });

        const width = containerRef.current.offsetWidth || 400;
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          width,
          locale: 'es',
        });
      } catch (err) {
        if (!cancelled) {
          setRuntimeError(
            err instanceof Error ? err.message : 'Error al cargar inicio de sesión con Google'
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  return (
    <div className="w-full space-y-2">
      <div
        ref={containerRef}
        className="flex w-full justify-center opacity-100 [&>div]:!w-full"
        aria-busy={isPending}
      />
      {isPending && (
        <p className="text-muted-foreground text-center text-sm">Conectando con Google...</p>
      )}
      {error && <p className="text-destructive text-center text-sm">{error}</p>}
    </div>
  );
}
