export function validateQueuedInvoiceXmlFile(
  file: File
): { valid: boolean; error?: string; type?: string } {
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.split('.').pop();

  if (fileExtension !== 'xml') {
    return {
      valid: false,
      error: 'Formato inválido. Solo se permiten archivos .xml',
    };
  }

  return { valid: true, type: 'XML' };
}
