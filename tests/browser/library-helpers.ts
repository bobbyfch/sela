import type { Page } from '@playwright/test';

export async function readStoredBooks(page: Page) {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('sela-private-library', 3);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const records = await new Promise<{ books: Array<Record<string, any>>; files: Array<{ id: string; bytes?: ArrayBuffer; blob?: Blob }> }>((resolve, reject) => {
      const transaction = db.transaction(['books', 'files'], 'readonly');
      const books = transaction.objectStore('books').getAll();
      const files = transaction.objectStore('files').getAll();
      transaction.oncomplete = () => resolve({ books: books.result, files: files.result });
      transaction.onerror = transaction.onabort = () => reject(transaction.error);
    });
    db.close();
    return Promise.all(records.books.map(async book => {
      const file = records.files.find(item => item.id === book.id);
      const source = file?.bytes || await file?.blob?.arrayBuffer() || new ArrayBuffer(0);
      const bytes = Array.from(new Uint8Array(source));
      return { name: book.name, format: book.format, text: new TextDecoder().decode(source), bytes, pinned: !!book.pinned, favorite: !!book.favorite };
    }));
  });
}
