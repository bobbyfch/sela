<?php /* Example only: adapt endpoint and escaping to your application. */ ?>
<button type="button" id="open-ebook" data-pdf="<?= html_escape(site_url('media/ebook/42')) ?>">Baca e-book</button>
<script src="https://cdn.jsdelivr.net/gh/bobbyfch/sela@v1.0.0/dist/js/sela.min.js"></script>
<script>
document.querySelector('#open-ebook').addEventListener('click', function () {
  new Sela({ pdfUrl: this.dataset.pdf, title: 'E-book', trigger: this }).open();
});
</script>
