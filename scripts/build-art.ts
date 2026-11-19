import { readFile, writeFile, mkdir } from 'node:fs/promises';
import ts from 'typescript';
import { fieldDefaults } from '../src/lib/art-field';

// Start with the upstream template; retain its fixed layout, styles and seed controls.
const template = await readFile('scripts/art/viewer.template.html', 'utf8');
const source = await readFile('src/lib/art-field.ts', 'utf8');
const algorithm = ts
  .transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  })
  .outputText.replace(/^export /gm, '');
const parameters = [
  { key: 'strands', label: '线束数量 / Strands', min: 24, max: 100, step: 1 },
  { key: 'amplitude', label: '起伏幅度 / Amplitude', min: 10, max: 65, step: 1 },
  { key: 'twist', label: '扭转程度 / Twist', min: 0.4, max: 2, step: 0.05 },
] as const;
const controls = `<div class="control-section"><h3>Parameters</h3>${parameters
  .map(
    (p) => `
  <div class="control-group"><label for="${p.key}">${p.label}</label>
  <div class="slider-container"><input type="range" id="${p.key}" min="${p.min}" max="${p.max}" step="${p.step}" value="${fieldDefaults[p.key]}" oninput="updateParam('${p.key}', this.value)">
  <span class="value-display" id="${p.key}-value">${fieldDefaults[p.key]}</span></div></div>`,
  )
  .join('')}</div>`;
// Preserve seed navigation from the provided template, with our own parameter reset.
const seedFunctions = template.slice(
  template.indexOf('        function updateSeedDisplay()'),
  template.indexOf('        function resetParameters()'),
);
const script = `
${algorithm}
let params = structuredClone(fieldDefaults);
let artCanvas;
let pendingFrame;
function setup() {
  pixelDensity(1);
  artCanvas = createCanvas(1200, 1080);
  artCanvas.parent('canvas-container');
  artCanvas.elt.setAttribute('role', 'img');
  artCanvas.elt.setAttribute('aria-label', '迭代成形：由种子和参数生成的环形曲线');
  noLoop();
  syncControls();
  initializeSystem();
  document.querySelector('.loading').style.display = 'none';
}
function initializeSystem() {
  if (!artCanvas) return;
  randomSeed(params.seed);
  noiseSeed(params.seed);
  background('#faf9f5');
  push();
  scale(2);
  noFill();
  for (const strand of generateField(params)) {
    const ink = color(strand.color);
    ink.setAlpha(strand.opacity * 255);
    stroke(ink);
    strokeWeight(strand.weight);
    beginShape();
    for (const [x, y] of strand.points) vertex(x, y);
    endShape(CLOSE);
  }
  pop();
  artCanvas.elt.dataset.seed = String(params.seed);
}
function draw() {}
function scheduleRender() {
  cancelAnimationFrame(pendingFrame);
  pendingFrame = requestAnimationFrame(initializeSystem);
}
function updateParam(name, value) {
  const input = document.getElementById(name);
  params[name] = Math.min(Number(input.max), Math.max(Number(input.min), Number(value)));
  document.getElementById(name + '-value').textContent = params[name];
  scheduleRender();
}
function updateColor(id, value) {
  params.colorPalette[Number(id.slice(-1)) - 1] = value;
  document.getElementById(id + '-value').textContent = value;
  scheduleRender();
}
${seedFunctions}
function syncControls() {
  for (const name of ['strands', 'amplitude', 'twist']) {
    document.getElementById(name).value = params[name];
    document.getElementById(name + '-value').textContent = params[name];
  }
  params.colorPalette.forEach((value, i) => {
    document.getElementById('color' + (i + 1)).value = value;
    document.getElementById('color' + (i + 1) + '-value').textContent = value;
  });
  updateSeedDisplay();
}
function resetParameters() {
  params = structuredClone(fieldDefaults);
  syncControls();
  initializeSystem();
}
function downloadArt() {
  if (artCanvas) saveCanvas(artCanvas, 'iterative-form-' + params.seed, 'png');
}
window.addEventListener('load', function() {
  syncControls();
  if (typeof window.p5 === 'undefined') {
    document.querySelector('.loading').textContent = '画布资源未能加载。请联网后重试，或返回知识库继续学习。';
    document.querySelectorAll('button, input').forEach(el => el.disabled = true);
  }
});
`;
let html = template
  .replace('<html lang="en">', '<html lang="zh-CN">')
  .replace('<title>Generative Art Viewer</title>', '<title>迭代成形 · Python Cheat Sheets</title>')
  .replace('TITLE - EDIT', 'Iterative Form')
  .replace(
    'SUBHEADER - EDIT',
    '迭代成形 · 每一次重复，都带来一点理解。<br><a href="../">返回知识库</a> · <a href="LICENSE-anthropic.txt">模板许可</a>',
  )
  .replace(
    '<!-- Parameters Section (CUSTOMIZE THIS FOR YOUR ART) -->' +
      template
        .split('<!-- Parameters Section (CUSTOMIZE THIS FOR YOUR ART) -->')[1]
        .split('<!-- Colors Section')[0],
    controls + '\n            ',
  )
  .replace('id="seed-input"', 'id="seed-input" aria-label="图形种子" min="1" max="4294967295"')
  .replace('value="12345"', 'value="31415"')
  .replace(
    '<div class="seed-controls">',
    '<button class="button regen-button" style="margin-bottom:8px" onclick="updateSeed()">Go</button><div class="seed-controls">',
  )
  .replace(
    '<button class="button" onclick="resetParameters()">Reset</button>',
    '<button class="button" onclick="initializeSystem()">Regenerate</button>\n<button class="button" onclick="resetParameters()">Reset</button>\n</div><div class="button-row" style="margin-top:8px"><button class="button tertiary" onclick="downloadArt()">Download PNG</button>',
  )
  .replace(/<script>\s*\/\/ ═[\s\S]*?<\/script>/, `<script>${script}</script>`);
for (let i = 1; i <= 3; i++) {
  html = html.replace(`id="color${i}"`, `id="color${i}" aria-label="线束颜色 ${i}"`);
}
html = html.replace(
  '<!DOCTYPE html>',
  `<!DOCTYPE html>\n<!-- Adapted from Anthropic algorithmic-art viewer.html, Apache-2.0.\nCopyright 2026 Anthropic, PBC. Modifications: original Iterative Form algorithm, controls, export and accessibility.\nFull license: LICENSE-anthropic.txt. Generated by scripts/build-art.ts; edit the source, not this file. -->`,
);
await mkdir('public/art', { recursive: true });
await writeFile('public/art/iterative-form.html', html);
console.log('Generated self-contained Iterative Form viewer from the Anthropic template.');
