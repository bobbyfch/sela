const reflowableFormats = new Set(['epub', 'txt', 'md', 'html', 'fb2', 'docx', 'odt']);

export function isReflowableBookFormat(format: unknown): boolean {
  return typeof format === 'string' && reflowableFormats.has(format.toLowerCase());
}
