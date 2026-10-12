<script setup lang="ts">
import {onMounted,onBeforeUnmount,shallowRef} from 'vue';
import type {Sela} from '@bobbyfch/sela';
const props=defineProps<{url: string;assetBase?:string}>();
const viewer=shallowRef<Sela>();
let mounted=false;
onMounted(async()=>{
  mounted=true;
  const {default: Sela}=await import('@bobbyfch/sela');
  if(mounted)viewer.value=new Sela({url:props.url,assetBase:props.assetBase});
});
onBeforeUnmount(()=>{mounted=false;viewer.value?.destroy();});
async function open(){try{await viewer.value?.open();}catch(error){if((error as Error).name!=='AbortError')console.error('Reader could not open');}}
</script>
<template><button type="button" :disabled="!viewer" @click="open">Read document</button></template>
