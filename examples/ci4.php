<?php /* Self-hosted CDN-style integration. No frontend build on the PHP host. */ ?>
<button type="button" id="open-ebook" data-pdf="<?= esc(site_url('media/ebook/42'), 'attr') ?>">Baca e-book</button>
<script src="<?= esc(base_url('sela/dist/js/sela.min.js'), 'attr') ?>"></script>
<script>
document.querySelector('#open-ebook').addEventListener('click', function () {
  new Sela({ url: this.dataset.pdf, trigger: this, assetBase: '<?= esc(base_url('sela/dist/'), 'js') ?>' }).open();
});
</script>
