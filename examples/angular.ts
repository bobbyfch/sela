import { Component, OnDestroy } from '@angular/core';
import Sela from '@bobbyfch/sela';

@Component({
  selector: 'app-pdf-reader', standalone: true,
  template: '<button type="button" (click)="read()">Read PDF</button><p role="status">{{ error }}</p>'
})
export class PdfReaderComponent implements OnDestroy {
  private viewer?: Sela;
  error = '';
  read() {
    this.viewer ||= new Sela({ pdfUrl: '/story.pdf', mode: 'single' });
    this.viewer.open().catch(e => { if (e.name !== 'AbortError') this.error = e.message; });
  }
  ngOnDestroy() { this.viewer?.destroy(); }
}
