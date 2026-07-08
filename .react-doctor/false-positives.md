# Falsos positivos verificados (React Doctor)

## `react-doctor/server-auth-actions`

Acciones en `app/auth/**` que **establecen** credenciales (login, registro, verificación, reset, forgot password). No puede existir sesión previa; el backend valida credenciales y rate limits.

- `app/auth/forgot-password/actions.ts`
- `app/auth/login/actions.ts` (`loginAction`, `loginWithGoogleAction`)
- `app/auth/register/actions.ts`
- `app/auth/reset-password/actions.ts`
- `app/auth/verify-email/actions.ts` (`verifyEmailAction`, `resendVerificationEmailAction`)

## `react-doctor/prefer-dynamic-import`

Componentes que **solo** se cargan con `next/dynamic(..., { ssr: false })` desde el padre. El chunk de Recharts ya se difiere hasta montar el gráfico; el import en el hijo es necesario para ese chunk.

- `app/components/DashboardPreviewAreaChart.tsx` (desde `DashboardPreview.tsx`)
- `app/components/HeroSectionMiniChart.tsx` (desde `HeroSection.tsx`)
- `app/dashboard/components/FlowTrendChartPlot.tsx` (desde `FlowTrendChart.tsx`)
- `app/dashboard/components/TaxEstimateHistoryLineChart.tsx` (desde `TaxEstimateHistorySection.tsx`)
- `app/public/[token]/components/PublicFlowBarChartPlot.tsx` (desde `PublicFlowBarChart.tsx`)

## `react-doctor/async-await-in-loop`

Subida de XML en cola: cada archivo actualiza estado (`uploading` → `success`/`error`) y llama al API **en serie** para no saturar el backend ni mezclar toasts/redirects de complementos.

- `app/dashboard/expenses/upload/components/use-upload-expenses-flow.ts`
- `app/dashboard/invoices/upload/components/use-upload-invoices-flow.ts`

## `react-doctor/require-pnpm-hardening`

`minimumReleaseAge: 7d` en este repo rompió `pnpm install` (paquetes recientes bloqueados). Se mantiene `trustPolicy: no-downgrade` en `pnpm-workspace.yaml` como mitigación acordada.
