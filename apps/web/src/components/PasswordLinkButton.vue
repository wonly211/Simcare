<script setup lang="ts">
import { ref } from 'vue';
import type { Member } from '@simcare/shared';
import { state } from '../sync';
import { api, errorMessage } from '../state/client';
import { useUpdateGuard } from '../update/safety';
import ModalDialog from './ModalDialog.vue';
const props = defineProps<{ member: Member }>();
const open = ref(false),
  busy = ref(false),
  link = ref(''),
  message = ref('');
useUpdateGuard(
  () => open.value,
  () => busy.value,
);
async function generate() {
  busy.value = true;
  message.value = '';
  try {
    const result = await api<{ token: string }>('/auth/password-links', 'POST', {
      userId: props.member.id,
    });
    const url = new URL(location.origin);
    url.hash = new URLSearchParams({ 'set-password': result.token }).toString();
    link.value = url.href;
  } catch (e) {
    message.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
async function copy() {
  try {
    await navigator.clipboard.writeText(link.value);
    message.value = '已复制，请单独发送给这位家人';
  } catch {
    message.value = '请选中链接复制';
  }
}
function close() {
  if (!busy.value) {
    open.value = false;
    link.value = '';
    message.value = '';
  }
}
</script>
<template>
  <button
    v-if="
      member.active &&
      !member.systemRole &&
      member.id !== state.session?.user.id &&
      (state.session?.user.systemRole === 'system_admin' ||
        (state.session?.user.householdRole === 'admin' && member.householdRole === 'member'))
    "
    class="text-button"
    :disabled="!state.online"
    @click="open = true"
  >
    帮助设置密码</button
  ><ModalDialog v-if="open" :title="'帮助' + member.nickname + '设置密码'" @close="close"
    ><p>链接仅供这位家人使用，30 分钟有效，只能使用一次。生成新链接将使之前的链接失效。</p>
    <p>家人成功设置密码后，原设备会退出登录，健康记录保留。</p>
    <p role="status">{{ message }}</p>
    <template v-if="link"
      ><label>密码设置链接<input :value="link" readonly /></label
      ><button class="button primary" @click="copy">复制链接</button></template
    ><button v-else class="button primary" :disabled="busy" @click="generate">生成设置链接</button
    ><button class="button secondary" :disabled="busy" @click="close">关闭</button></ModalDialog
  >
</template>
