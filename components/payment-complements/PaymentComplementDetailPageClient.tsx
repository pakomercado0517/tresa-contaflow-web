'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/client';
import { getProfilesClient } from '@/lib/api/profiles.client';
import { getPaymentComplementByIdClient } from '@/lib/api/payment-complements.client';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { ComplementRole } from '@/lib/types/payment-complements';
import { PaymentComplementDetailContent } from './PaymentComplementDetailContent';
import { ProfileRequiredDialog } from './ProfileRequiredDialog';

interface PaymentComplementDetailPageClientProps {
  complementId: string;
  role: ComplementRole;
  listBasePath: '/dashboard/invoices' | '/dashboard/expenses';
  detailRouteBase: '/dashboard/invoices/complementos' | '/dashboard/expenses/complementos';
}

function toNumber(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildListHref(
  listBasePath: string,
  profileId: string | null,
  mes: number,
  año: number
): string {
  const params = new URLSearchParams();
  if (profileId) params.set('profileId', profileId);
  params.set('mes', String(mes));
  params.set('año', String(año));
  return `${listBasePath}?${params.toString()}`;
}

export function PaymentComplementDetailPageClient({
  complementId,
  role,
  listBasePath,
  detailRouteBase,
}: PaymentComplementDetailPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlProfileId = searchParams.get('profileId') ?? undefined;
  const mes = toNumber(searchParams.get('mes'), new Date().getMonth() + 1);
  const año = toNumber(searchParams.get('año'), new Date().getFullYear());

  const [resolvedProfileId, setResolvedProfileId] = useState<string | undefined>(urlProfileId);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  useEffect(() => {
    setResolvedProfileId(urlProfileId);
  }, [urlProfileId]);

  const profilesQuery = useQuery({
    queryKey: ['profiles'],
    queryFn: () => getProfilesClient(),
    staleTime: 60_000,
  });

  const detailQuery = useQuery({
    queryKey: ['payment-complement', complementId, resolvedProfileId ?? null],
    queryFn: () => getPaymentComplementByIdClient(complementId, resolvedProfileId),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 400) return false;
      return failureCount < 2;
    },
  });

  const profileRequiredError = useMemo(() => {
    if (!(detailQuery.error instanceof ApiError)) return false;
    if (detailQuery.error.status !== 400) return false;
    const message = detailQuery.error.message.toLowerCase();
    return message.includes('profile_id');
  }, [detailQuery.error]);

  useEffect(() => {
    if (profileRequiredError && profilesQuery.data) {
      setProfileDialogOpen(true);
    }
  }, [profileRequiredError, profilesQuery.data]);

  const listHref = buildListHref(listBasePath, urlProfileId ?? resolvedProfileId ?? null, mes, año);

  if (detailQuery.isLoading && !detailQuery.data) {
    return (
      <div className="flex min-h-50 items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (detailQuery.error instanceof ApiError && detailQuery.error.status === 404) {
    return (
      <div className="p-6">
        <ErrorState
          title="Complemento no encontrado"
          message="El complemento no existe o no tienes acceso. Vuelve al listado e intenta de nuevo."
          onRetry={() => router.push(listHref)}
          retryLabel="Volver al listado"
        />
      </div>
    );
  }

  if (detailQuery.error && !profileRequiredError) {
    return (
      <div className="p-6">
        <ErrorState
          title="Error al cargar el complemento"
          message={detailQuery.error.message}
          onRetry={() => router.push(listHref)}
          retryLabel="Volver al listado"
        />
      </div>
    );
  }

  const detail = detailQuery.data?.data;
  const profiles = profilesQuery.data?.data ?? [];

  return (
    <>
      {detail && (
        <PaymentComplementDetailContent
          detail={detail}
          role={role}
          profileId={resolvedProfileId}
          mes={mes}
          año={año}
          listBasePath={listBasePath}
          listHref={listHref}
        />
      )}

      <ProfileRequiredDialog
        open={profileDialogOpen}
        profiles={profiles}
        onOpenChange={setProfileDialogOpen}
        onConfirm={(profileId) => {
          setResolvedProfileId(profileId);
          setProfileDialogOpen(false);
          const params = new URLSearchParams(searchParams.toString());
          params.set('profileId', profileId);
          router.replace(`${detailRouteBase}/${complementId}?${params.toString()}`);
        }}
      />
    </>
  );
}
