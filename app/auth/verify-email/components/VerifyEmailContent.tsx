"use client";

import { VerifyEmailForm } from "./VerifyEmailForm";

interface VerifyEmailContentProps {
  email?: string;
  verificationError?: string | null;
}

export function VerifyEmailContent({
  email,
  verificationError = null,
}: VerifyEmailContentProps) {
  if (verificationError) {
    return (
      <div className="w-full max-w-md p-8 bg-card border-border shadow-lg rounded-lg">
        <div className="flex flex-col items-center gap-6">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-destructive">
              Error de verificación
            </h1>
            <p className="text-sm text-muted-foreground">{verificationError}</p>
          </div>
          <VerifyEmailForm email={email} />
        </div>
      </div>
    );
  }

  return <VerifyEmailForm email={email} />;
}
