"use client";

import { useState } from "react";
import { Settings, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PreferencesCard() {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    satAlerts: true,
    weeklyReport: false,
    language: "es-MX",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Preferencias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email Notifications */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications" className="text-base">
              Notificaciones Email
            </Label>
            <p className="text-sm text-muted-foreground">
              Recibir facturas y avisos
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={preferences.emailNotifications}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, emailNotifications: checked })
            }
          />
        </div>

        {/* SAT Alerts */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sat-alerts" className="text-base">
              Alertas SAT
            </Label>
            <p className="text-sm text-muted-foreground">
              Cambios en estatus CFDI
            </p>
          </div>
          <Switch
            id="sat-alerts"
            checked={preferences.satAlerts}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, satAlerts: checked })
            }
          />
        </div>

        {/* Weekly Report */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="weekly-report" className="text-base">
              Reporte Semanal
            </Label>
            <p className="text-sm text-muted-foreground">
              Resumen de actividad
            </p>
          </div>
          <Switch
            id="weekly-report"
            checked={preferences.weeklyReport}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, weeklyReport: checked })
            }
          />
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label htmlFor="language" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Idioma
          </Label>
          <Select
            value={preferences.language}
            onValueChange={(value) =>
              setPreferences({ ...preferences, language: value })
            }
          >
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es-MX">Español (México)</SelectItem>
              <SelectItem value="es-ES">Español (España)</SelectItem>
              <SelectItem value="en-US">English (US)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

