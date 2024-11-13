<script setup lang="ts">

import useApi from '@/composables/useApi';
import { ref } from 'vue';
  const info = ref();
  try {
  info.value = await useApi().fetchInfo()
}
catch(e) {
  console.error(e )
}
  console.info(info.value)
  const a = "a"
</script>

<template>
  <div>{{ info }}</div>
</template>
