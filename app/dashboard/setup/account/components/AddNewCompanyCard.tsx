"use client";

import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function AddNewCompanyCard() {
  return (
    <Link href="/dashboard/setup/profiles/new">
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center relative">
              <Building2 className="h-6 w-6 text-primary" />
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                <Plus className="h-3 w-3 text-primary-foreground" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Agregar Nueva Empresa</h3>
              <p className="text-sm text-muted-foreground">
                Gestiona otro RFC desde esta cuenta
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

