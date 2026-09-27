<script setup lang="ts">
import { ref } from 'vue';
import { state, acceptSession } from '../sync';
import type { Session } from '@simcare/shared';
import { api, errorMessage } from '../state/client';
import { useUpdateGuard } from '../update/safety';
import PasswordField from './PasswordField.vue';
const editing = ref(false),
  password = ref(''),
  confirmation = ref(''),
  current = ref(''),
  busy = ref(false),
  message = ref('');
useUpdateGuard(
  () => !!password.value || !!confirmation.value || !!current.value,
  () => busy.value,
);
function cancel() {
  password.value = '';
  confirmation.value = '';
  current.value = '';
  editing.value = false;
  message.value = '';
}
async function save() {
  busy.value = true;
  message.value = '';
  try {
    if (password.value !== confirmation.value) throw new Error('两次输入的密码不一致');
    const session = await api<Session>(
      state.session?.passwordSetupRequired ? '/auth/password/setup' : '/auth/password/change',
      'POST',
      {
        password: password.value,
        ...(state.session?.passwordSetupRequired ? {} : { currentPassword: current.value }),
      },
    );
    await acceptSession(session);
    cancel();
    message.value = '密码已保存，其他设备需要使用新密码登录';
  } catch (e) {
    message.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <section class="settings-section">
    <h2>登录密码</h2>
    <p v-if="state.session?.passwordSetupRequired">请为账户设置密码，以后换设备可直接登录。</p>
    <p role="status">{{ message }}</p>
    <button
      v-if="!editing"
      class="button secondary"
      :disabled="!state.online"
      @click="editing = true"
    >
      {{ state.session?.passwordSetupRequired ? '设置登录密码' : '修改登录密码' }}
    </button>
    <form v-else class="form-stack" @submit.prevent="save">
      <PasswordField
        v-if="!state.session?.passwordSetupRequired"
        v-model="current"
        label="当前密码"
        autocomplete="current-password"
      /><PasswordField v-model="password" label="新密码（8～64 个字符）" /><PasswordField
        v-model="confirmation"
        label="再次输入新密码"
      />
      <p>保存后其他设备将退出登录，健康记录会保留。</p>
      <button class="button primary" :disabled="busy || !state.online">保存密码</button
      ><button type="button" class="button secondary" :disabled="busy" @click="cancel">取消</button>
    </form>
  </section>
</template>
