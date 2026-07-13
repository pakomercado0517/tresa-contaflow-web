import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StepCardProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function StepCard({ number, icon, title, description }: StepCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg">
          {number}
        </div>
      </div>
      <CardContent className="pt-16 pb-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-muted/50">
            {icon}
          </div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
