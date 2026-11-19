import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { parse } from 'yaml';
import { topicSchema, questionSetSchema, pathSchema } from '../src/lib/schema';
const topicDir = 'src/content/topics';
const topicIds = new Set<string>();
const orders = new Set<number>();
const errors: string[] = [];
let questionCount = 0,
  longestCorrect = 0,
  mcCount = 0;
for (const file of readdirSync(topicDir).filter((f) => f.endsWith('.md'))) {
  try {
    const text = readFileSync(`${topicDir}/${file}`, 'utf8');
    const match = text.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) throw Error('缺少 front matter');
    const data = topicSchema.parse(parse(match[1]));
    const id = file.slice(0, -3);
    if (!/^[a-z][a-z0-9-]+$/.test(id)) throw Error('无效 ID');
    topicIds.add(id);
    if (orders.has(data.order)) throw Error('排序号重复');
    orders.add(data.order);
    if (match[2].trim().length < 600) throw Error('正文不足 600 字符');
    if (!match[2].includes('## 一分钟回答')) throw Error('缺少一分钟回答');
    for (const path of [
      `examples/${data.example}`,
      `examples/${data.example.replace('.py', '.out')}`,
    ])
      if (!existsSync(path)) throw Error(`示例缺失：${path}`);
  } catch (e) {
    errors.push(`${file}: ${e}`);
  }
}
const questionIds = new Set<string>();
const covered = new Set<string>();
for (const file of readdirSync('src/content/questions').filter((f) => f.endsWith('.yaml'))) {
  try {
    const set = questionSetSchema.parse(
      parse(readFileSync(`src/content/questions/${file}`, 'utf8')),
    );
    if (!topicIds.has(set.topicId)) throw Error('知识点引用不存在');
    if (file !== `${set.topicId}.yaml`) throw Error('文件名与知识点 ID 不一致');
    covered.add(set.topicId);
    const types = new Set(set.questions.map((q) => q.type));
    if (types.size !== 4) throw Error('样板应覆盖四类练习');
    for (const q of set.questions) {
      if (q.topicId !== set.topicId || questionIds.has(q.id)) throw Error('题目引用错误或 ID 重复');
      questionIds.add(q.id);
      questionCount++;
      if (q.type === 'mcq') {
        mcCount++;
        const ids = q.choices.map((c) => c.id);
        if (!ids.includes(q.correct) || new Set(ids).size !== ids.length)
          throw Error('选项或答案无效');
        const correct = q.choices.find((c) => c.id === q.correct)!;
        if (q.choices.every((c) => c.id === q.correct || c.text.length < correct.text.length))
          longestCorrect++;
      }
    }
  } catch (e) {
    errors.push(`${file}: ${e}`);
  }
}
for (const id of topicIds) if (!covered.has(id)) errors.push(`${id}: 缺少练习`);
for (const file of readdirSync('src/content/paths').filter((f) => f.endsWith('.yaml'))) {
  try {
    const path = pathSchema.parse(parse(readFileSync(`src/content/paths/${file}`, 'utf8')));
    if (new Set(path.topics).size !== path.topics.length) throw Error('路线引用重复');
    for (const id of path.topics) if (!topicIds.has(id)) throw Error(`无效引用 ${id}`);
  } catch (e) {
    errors.push(`${file}: ${e}`);
  }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(
  `内容校验通过：${topicIds.size} 个知识点，${questionCount} 道练习。单选题唯一最长正确选项 ${longestCorrect}/${mcCount}（编辑参考，不作为判定规则）。`,
);
