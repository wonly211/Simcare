<script setup lang="ts">
import { ref } from 'vue';
defineProps<{ label: string; autocomplete?: string }>();
const value = defineModel<string>({ required: true });
const visible = ref(false);
</script>
<template>
  <div class="form-stack">
    <label
      >{{ label
      }}<input
        v-model="value"
        :type="visible ? 'text' : 'password'"
        :autocomplete="autocomplete ?? 'new-password'"
        minlength="8"
        maxlength="64"
        required
        autocapitalize="none"
        :spellcheck="false" /></label
    ><button type="button" class="text-button" :aria-pressed="visible" @click="visible = !visible">
      {{ visible ? '隐藏密码' : '显示密码' }}
    </button>
  </div>
</template>
