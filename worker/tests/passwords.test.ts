import { describe, it, expect } from 'vitest';
import { encodePassword, verifyPassword } from '../src/passwords';
describe('密码凭据编码', () => {
  it('独立随机盐、正确验证且不修剪用户密码', async () => {
    const a = await encodePassword(' pass word '),
      b = await encodePassword(' pass word ');
    expect(a).not.toBe(b);
    expect(await verifyPassword(' pass word ', a)).toBe(true);
    expect(await verifyPassword('pass word', a)).toBe(false);
    expect(a).not.toContain('pass word');
  });
  it('缺失、参数篡改和格式多余字段均拒绝', async () => {
    const valid = await encodePassword('test-password');
    expect(await verifyPassword('test-password')).toBe(false);
    expect(await verifyPassword('test-password', valid.replace(':16384:', ':1:'))).toBe(false);
    expect(await verifyPassword('test-password', valid + ':extra')).toBe(false);
  });
});
