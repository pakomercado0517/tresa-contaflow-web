interface DashboardGreetingProps {
  userName?: string;
  companyName?: string;
}

export function DashboardGreeting({
  userName = "Juan",
  companyName = "Tech Solutions S.A. de C.V.",
}: DashboardGreetingProps) {
  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-semibold">Hola, {userName}</h2>
      <p className="text-muted-foreground">
        Aquí está el estado financiero de {companyName} hoy.
      </p>
    </div>
  );
}

