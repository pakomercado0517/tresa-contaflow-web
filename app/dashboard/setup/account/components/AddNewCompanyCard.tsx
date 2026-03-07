"use client";

import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AddNewCompanyCard() {
  return (
    <Link href="/dashboard/setup/profiles/new">
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Agregar Nueva Empresa
            <Plus className="h-4 w-4 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Gestiona otro RFC desde esta cuenta
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

