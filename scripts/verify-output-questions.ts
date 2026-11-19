import { readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { parse } from 'yaml';
import { questionSetSchema } from '../src/lib/schema';
import { normalizeOutput } from '../src/lib/practice';
let checked = 0;
for (const f of readdirSync('src/content/questions').filter((f) => f.endsWith('.yaml'))) {
  const set = questionSetSchema.parse(parse(readFileSync(`src/content/questions/${f}`, 'utf8')));
  for (const q of set.questions) {
    if (q.type !== 'output') continue;
    const result = spawnSync(process.env.PYTHON ?? 'python3', ['-I', '-c', q.code], {
      encoding: 'utf8',
      timeout: 5000,
    });
    if (result.status !== 0 || normalizeOutput(result.stdout) !== normalizeOutput(q.answer))
      throw Error(`${q.id}\n${result.stderr}\n实际：${result.stdout}\n预期：${q.answer}`);
    checked++;
  }
}
console.log(`${checked} 道输出题已通过实际执行验证。`);
