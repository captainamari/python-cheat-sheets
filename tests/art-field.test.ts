import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fieldDefaults, generateField } from '../src/lib/art-field';

test('生成图形：同种子复现、不同种子产生变化，且不修改默认配置', () => {
  const before = structuredClone(fieldDefaults);
  const a = generateField();
  assert.deepEqual(a, generateField());
  assert.notDeepEqual(a, generateField({ ...fieldDefaults, seed: 42 }));
  assert.deepEqual(fieldDefaults, before);
});

test('参数上限仍保持所有线条在画布内，并限制绘制工作量', () => {
  for (const seed of [1, 42, 31415, 999999]) {
    const strands = generateField({
      ...fieldDefaults,
      seed,
      strands: 10000,
      amplitude: 100,
      twist: 3,
    });
    assert.equal(strands.length, 100);
    for (const strand of strands) {
      assert.equal(strand.points.length, 181);
      for (const [x, y] of strand.points) {
        assert.ok(Number.isFinite(x) && x >= 0 && x <= 600, `x=${x}`);
        assert.ok(Number.isFinite(y) && y >= 0 && y <= 540, `y=${y}`);
      }
    }
  }
});
