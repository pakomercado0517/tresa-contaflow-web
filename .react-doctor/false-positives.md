# Falsos positivos verificados (React Doctor)

## `react-doctor/server-auth-actions`

Acciones en `app/auth/**` que **establecen** credenciales (login, registro, verificación, reset, forgot password). No puede existir sesión previa; el backend valida credenciales y rate limits.

- `app/auth/forgot-password/actions.ts`
- `app/auth/login/actions.ts` (`loginAction`, `loginWithGoogleAction`)
- `app/auth/register/actions.ts`
- `app/auth/reset-password/actions.ts`
- `app/auth/verify-email/actions.ts` (`verifyEmailAction`, `resendVerificationEmailAction`)
