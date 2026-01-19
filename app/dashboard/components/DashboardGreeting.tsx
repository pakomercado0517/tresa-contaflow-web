interface DashboardGreetingProps {
  userName?: string;
  companyName?: string;
}

export function DashboardGreeting({
  userName = "Juan",
  companyName,
}: DashboardGreetingProps) {
  // Determinar el texto a mostrar según si hay un perfil específico o "Todas las empresas"
  const getFinancialStatusText = () => {
    if (!companyName) {
      return "Aquí está tu estado financiero hoy.";
    }

    if (companyName === "Todas las empresas") {
      return `Aquí está el estado financiero de ${companyName} hoy.`;
    }

    return `Aquí está el estado financiero de ${companyName} hoy.`;
  };

  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-semibold">Hola, {userName}</h2>
      <p className="text-muted-foreground">{getFinancialStatusText()}</p>
    </div>
  );
}

