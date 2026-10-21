/** Extract readable text from a format engine without mounting reader tools UI. */
export async function pageText(book: any, page: number): Promise<string> {
  if (book?.getText) return String(await book.getText(page) || '').slice(0, 1_000_000);
  if (!book?.pdf?.getPage) return '';
  const pdfPage = await book.pdf.getPage(page);
  if (!pdfPage?.getTextContent) return '';
  const content = await pdfPage.getTextContent();
  return content.items.map((item: any) => (item.str || '') + (item.hasEOL ? '\n' : ' ')).join('').slice(0, 1_000_000);
}
