'use client';

import { useState } from 'react';
import { AlertCircle, Lock, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { freezeExcessProfiles } from '@/lib/api/profiles.client';
import type { Profile } from '@/lib/types/profiles';

interface ProfileFreezeModalProps {
  isOpen: boolean;
  profiles: Profile[];
  planLimit: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProfileFreezeModal({
  isOpen,
  profiles,
  planLimit,
  onClose,
  onSuccess,
}: ProfileFreezeModalProps) {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeProfiles = profiles.filter((p) => !p.frozen);
  const excessCount = activeProfiles.length - planLimit;

  const handleFreeze = async () => {
    if (!selectedProfileId) return;

    setIsLoading(true);
    setError(null);

    try {
      await freezeExcessProfiles(selectedProfileId);
      onSuccess();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al congelar perfiles';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-orange-500" />
            Ajustar Perfiles
          </DialogTitle>
          <DialogDescription>
            Tu plan permite {planLimit} perfil{planLimit !== 1 ? 'es' : ''}, pero tienes{' '}
            {activeProfiles.length}. Por favor selecciona cuál mantener activo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Alert */}
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700">
              Se congelarán {excessCount} perfil{excessCount !== 1 ? 'es' : ''}. Podrás acceder a
              ellos si cambias de plan.
            </AlertDescription>
          </Alert>

          {/* Error */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {/* Profile Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Selecciona el perfil a mantener:</label>
            <div className="space-y-2">
              {activeProfiles.map((profile) => (
                <div
                  key={profile.id}
                  onClick={() => setSelectedProfileId(profile.id)}
                  className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                    selectedProfileId === profile.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{profile.nombre}</p>
                      <p className="text-sm text-gray-500">{profile.rfc}</p>
                    </div>
                    {selectedProfileId === profile.id && (
                      <div className="h-5 w-5 rounded-full border-2 border-blue-500 bg-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Frozen Preview */}
          {selectedProfileId && (
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="mb-2 text-sm font-medium text-gray-700">Se congelarán:</p>
              <div className="space-y-1">
                {activeProfiles
                  .filter((p) => p.id !== selectedProfileId)
                  .map((profile) => (
                    <div key={profile.id} className="flex items-center gap-2 text-sm text-gray-600">
                      <Lock className="h-4 w-4 text-orange-500" />
                      <span>{profile.nombre}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        Congelado
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleFreeze}
            disabled={!selectedProfileId || isLoading}
            className="flex-1"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Congelando...' : 'Mantener Perfil'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
