<script lang="ts">
  import { onMount } from 'svelte';
  import Sela from '@bobbyfch/sela';
  let viewer: Sela | undefined;
  let error = '';
  onMount(() => {
    viewer = new Sela({ pdfUrl: '/story.pdf', mode: 'webtoon' });
    return () => viewer?.destroy();
  });
  function read() {
    viewer?.open().catch(e => { if (e.name !== 'AbortError') error = e.message; });
  }
</script>
<button type="button" on:click={read}>Read PDF</button>
<p role="status">{error}</p>
