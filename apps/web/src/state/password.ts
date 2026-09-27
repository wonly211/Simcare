import { ref } from 'vue';
export const resetToken = ref(
  typeof location === 'undefined'
    ? ''
    : (new URLSearchParams(location.hash.slice(1)).get('set-password') ?? ''),
);
if (resetToken.value) history.replaceState(history.state, '', location.pathname + location.search);
export const reauthOpen = ref(false);
let pending: Promise<void> | undefined,
  complete: (() => void) | undefined,
  cancel: ((error: Error) => void) | undefined;
export function requestReauth() {
  if (!pending) {
    reauthOpen.value = true;
    pending = new Promise<void>((resolve, reject) => {
      complete = resolve;
      cancel = reject;
    }).finally(() => {
      pending = undefined;
      reauthOpen.value = false;
    });
  }
  return pending;
}
export function finishReauth(ok: boolean) {
  if (ok) complete?.();
  else cancel?.(new Error('已取消身份确认'));
}
