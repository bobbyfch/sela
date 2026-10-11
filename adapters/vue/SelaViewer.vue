<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import Sela, { type SelaOptions } from '../../dist/js/sela.esm.js';

const props = defineProps<{ modelValue: boolean; options: SelaOptions }>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; ready: [pages: number]; error: [error: Error] }>();
let viewer: Sela | undefined;
let generation = 0;
const opening = ref(false);
const mounted = ref(false);
onMounted(() => { mounted.value = true; });
watch(() => [mounted.value, props.modelValue, props.options] as const, async ([isMounted, visible, options]) => {
  const token = ++generation;
  viewer?.destroy(); viewer = undefined; opening.value = false;
  if (!isMounted || !visible) return;
  const instance = new Sela({
    ...options,
    onClose: () => { if (token === generation) emit('update:modelValue', false); },
    onReady: detail => { options.onReady?.(detail); emit('ready', detail.pages); }
  });
  viewer = instance; opening.value = true;
  try { await instance.open(); }
  catch (error) { if (token === generation && (error as Error).name !== 'AbortError') emit('error', error as Error); }
  finally { if (token === generation) opening.value = false; }
}, { immediate: true });
onBeforeUnmount(() => { ++generation; viewer?.destroy(); });
</script>

<template><slot :opening="opening" /></template>
