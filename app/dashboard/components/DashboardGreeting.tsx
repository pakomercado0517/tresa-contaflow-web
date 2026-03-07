interface DashboardGreetingProps {
  userName?: string;
  companyName?: string;
}

export function DashboardGreeting({ userName = 'Juan', companyName }: DashboardGreetingProps) {
  // Determinar el texto a mostrar según si hay un perfil específico o "Todas las empresas"
  const getFinancialStatusText = () => {
    if (!companyName) {
      return 'Aquí está tu estado financiero hoy.';
    }

    if (companyName === 'Todas las empresas') {
      return `Aquí está el estado financiero de ${companyName} hoy.`;
    }

    return `Aquí está el estado financiero de ${companyName} hoy.`;
  };

  return (
    <div className="min-w-0 space-y-1.5 pt-6 md:pt-px lg:pt-2">
      <h2 className="text-xl leading-tight font-semibold sm:text-2xl">Hola, {userName}</h2>
      <p className="text-muted-foreground text-sm leading-relaxed text-pretty sm:text-base">
        {getFinancialStatusText()}
      </p>
    </div>
  );
}
