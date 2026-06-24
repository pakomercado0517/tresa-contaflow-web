interface TaxEstimateDisclaimerProps {
  disclaimer: string;
}

export function TaxEstimateDisclaimer({ disclaimer }: TaxEstimateDisclaimerProps) {
  return (
    <p className="text-muted-foreground border-border border-t pt-4 text-xs leading-relaxed">
      {disclaimer}
    </p>
  );
}
