<script setup lang="ts">
import { ref, watch } from 'vue';
import { reauthOpen, finishReauth } from '../state/password';
import { api, errorMessage } from '../state/client';
import { useUpdateGuard } from '../update/safety';
import ModalDialog from './ModalDialog.vue';
import PasswordField from './PasswordField.vue';
const password = ref(''),
  busy = ref(false),
  error = ref('');
useUpdateGuard(
  () => reauthOpen.value,
  () => busy.value,
);
watch(reauthOpen, () => {
  password.value = '';
  error.value = '';
});
async function submit() {
  busy.value = true;
  try {
    await api('/auth/password/verify', 'POST', { password: password.value });
    finishReauth(true);
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <ModalDialog v-if="reauthOpen" title="确认是本人操作" @close="!busy && finishReauth(false)"
    ><form class="form-stack" @submit.prevent="submit">
      <PasswordField v-model="password" label="登录密码" autocomplete="current-password" />
      <p role="alert">{{ error }}</p>
      <button class="button primary" :disabled="busy">确认</button
      ><button type="button" class="button secondary" :disabled="busy" @click="finishReauth(false)">
        取消
      </button>
    </form></ModalDialog
  >
</template>
