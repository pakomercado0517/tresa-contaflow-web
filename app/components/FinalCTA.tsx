'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { registerUser } from '@/lib/api/auth';
import type { RegisterRequest } from '@/lib/types/auth';

interface PasswordStrength {
  text: string;
  color: string;
}

function getPasswordStrength(value: string): PasswordStrength {
  if (value.length === 0) return { text: '', color: '' };
  if (value.length < 8) return { text: 'Débil', color: 'text-red-500' };
  if (value.length < 12) return { text: 'Media', color: 'text-yellow-500' };
  return { text: 'Fuerte', color: 'text-green-500' };
}

export function FinalCTA() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setErrors((prev) => ({ ...prev, email: 'El correo es requerido' }));
      return false;
    }
    if (!emailRegex.test(value)) {
      setErrors((prev) => ({ ...prev, email: 'Formato de correo inválido' }));
      return false;
    }
    setErrors((prev) => ({ ...prev, email: undefined }));
    return true;
  };

  const validatePassword = (value: string): boolean => {
    if (!value) {
      setErrors((prev) => ({ ...prev, password: 'La contraseña es requerida' }));
      return false;
    }
    if (value.length < 8) {
      setErrors((prev) => ({ ...prev, password: 'Mínimo 8 caracteres' }));
      return false;
    }
    setErrors((prev) => ({ ...prev, password: undefined }));
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) return;

    setIsLoading(true);

    try {
      const registerData: RegisterRequest = {
        email: email.trim(),
        password,
      };

      await registerUser(registerData);

      toast.success('¡Registro exitoso!', {
        description: 'Revisa tu correo para verificar tu cuenta.',
      });

      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al registrar. Intenta nuevamente.';
      toast.error('Error al registrar', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 md:py-24 lg:px-8">
      <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex-1 space-y-6">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Controla tus CFDI sin Excel ni caos
          </h2>
          <p className="text-muted-foreground max-w-xl text-lg">
            Convierte tus XML CFDI en información clara para revisar ingresos, egresos y utilidades.
            Administra múltiples RFCs y genera reportes en PDF o Excel desde un solo panel.
            Empieza gratis y evalúa si encaja con tu operación.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-primary h-5 w-5" />
              <span className="text-foreground">Centraliza tus CFDI en minutos</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-primary h-5 w-5" />
              <span className="text-foreground">Sin compromisos ni cargos ocultos</span>
            </div>
          </div>
        </div>

        <Card className="bg-card border-border flex-1 p-8">
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <h3 className="mb-2 text-2xl font-semibold">Crea tu cuenta gratis</h3>
              <p className="text-muted-foreground text-sm">
                Solo necesitas email y contraseña para empezar
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="nombre@empresa.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) validateEmail(e.target.value);
                  }}
                  onBlur={(e) => validateEmail(e.target.value)}
                  disabled={isLoading}
                  className={`bg-background ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Contraseña segura (mín. 8 caracteres)"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) validatePassword(e.target.value);
                    }}
                    onBlur={(e) => validatePassword(e.target.value)}
                    disabled={isLoading}
                    className={`bg-background pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password.length > 0 && !errors.password && (
                  <p className={`text-xs ${passwordStrength.color}`}>
                    Contraseña {passwordStrength.text}
                  </p>
                )}
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>

              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 w-full"
                size="lg"
                disabled={isLoading || !email || !password}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  'Crear cuenta gratis'
                )}
              </Button>
            </div>
            <p className="text-muted-foreground text-center text-xs">
              Al registrarte aceptas nuestros Términos y Condiciones.
            </p>
          </form>
        </Card>
      </div>
    </section>
  );
}
