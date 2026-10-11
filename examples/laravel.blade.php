<button type="button" id="open-ebook" data-pdf="{{ route('ebooks.show', ['ebook' => $ebook->id]) }}">Read PDF</button>
<script src="https://cdn.jsdelivr.net/gh/bobbyfch/sela@v1.0.0/dist/js/sela.min.js"></script>
<script>
document.querySelector('#open-ebook').addEventListener('click', function () {
  new Sela({ pdfUrl: this.dataset.pdf, title: 'E-book', trigger: this }).open();
});
</script>
