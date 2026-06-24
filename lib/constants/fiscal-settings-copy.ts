const HELP_GENERIC = [
  'Los pagos provisionales acumulados de ISR no se actualizan automáticamente al consultar la estimación fiscal; captúralos aquí según tus declaraciones.',
  'Los saldos a favor de ISR e IVA configurados se consideran en el cálculo orientativo del mes.',
];

const HELP_601 = [
  'Régimen 601: el coeficiente de utilidad aplica de marzo a diciembre; en enero y febrero puedes usar el coeficiente del ejercicio anterior.',
];

const HELP_626 = [
  'Régimen 626 (RESICO): revisa límites anuales y provisionales; la estimación usa ingresos cobrados (PF) o acumulados (PM) según corresponda.',
];

export function getFiscalSettingsHelpBlocks(regimenesFiscales: string[]): string[] {
  const blocks: string[] = [...HELP_GENERIC];
  const regimenSet = new Set(regimenesFiscales);

  if (regimenSet.has('601')) {
    blocks.push(...HELP_601);
  }
  if (regimenSet.has('626')) {
    blocks.push(...HELP_626);
  }

  return blocks;
}
