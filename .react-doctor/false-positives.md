# Falsos positivos verificados (React Doctor)

Supresiones acotadas en `doctor.config.json` (`ignore.overrides` / `rules`). Este archivo documenta el porqué.

## `react-doctor/no-event-handler`

`use-manual-expense-dialog-form.ts`: al abrir el diálogo controlado desde el padre (`isOpen`), se reinicia el formulario en render al detectar transición `isOpen` / `profileId` con estado previo (`useState`), patrón recomendado en React para reset por props — no con `useEffect` ni mutando refs en render.

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

## `react-doctor/artifact-baas-authority-surface`

Falso positivo verificado (receta canónica: config BaaS pública + boundary en servidor).

- Dispara en `.next/static/chunks/*.js` porque el SDK `firebase/auth` minificado contiene `tenantId` / `providerId` junto a `apiKey` / `authDomain` / `firebase`.
- En Contafy, Firebase en el cliente es **solo** login Google (`lib/firebase/config.ts` + `GoogleLoginButton` → ID token → `loginWithGoogleAction` → backend). No hay Firestore/Realtime ni queries de colecciones desde el browser.
- Supabase es server-only (`lib/supabase/server-client.ts` + service role); uploads de logos vía Server Action; bucket `user-logos` sin INSERT para anon (`supabase/storage-user-logos.sql`).
- No hay override por archivo de source: la regla escanea artifacts generados. Se desactiva en `doctor.config.json` (`rules`). Re-evaluar si se añade acceso cliente a Firestore/Supabase.

## Firebase Auth (login Google) — no deprecar por limpieza

Archivos de contrato con el API (`verifyFirebaseIdToken` en backend). **No** eliminar `firebase`, **no** migrar a Google Identity Services ni quitar `lib/firebase/config.ts` salvo ticket explícito de migración backend.

- `lib/firebase/config.ts`
- `app/auth/login/components/GoogleLoginButton.tsx` (`signInWithPopup` → `getIdToken()` → `loginWithGoogleAction`)

Logos y storage de usuario: **Supabase**, no Firebase Storage en el frontend.
