const assetRoot = document.querySelector('script[data-assets]')?.dataset.assets || 'assets/';
const asset = name => `${assetRoot}${encodeURIComponent(name)}`;
const stage = document.querySelector('#identity-stage');
let themeRequest = 0;
const cardImagesReady = Promise.all([...stage.querySelectorAll('img')].map(image => image.decode().catch(() => {})));
document.querySelectorAll('[data-theme]').forEach(button => button.addEventListener('click', async () => {
  const request = ++themeRequest;
  await cardImagesReady;
  if (request !== themeRequest) return;
  const dark = button.dataset.theme === 'dark';
  stage.classList.toggle('dark', dark);
  document.querySelectorAll('[data-theme]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  const file = dark ? 'final2.jpg' : 'final1.jpg';
  const art = stage.querySelector('.final-art');
  art.dataset.zoom = file;
  art.setAttribute('aria-label', dark ? 'Enlarge the reversed UPKP logo' : 'Enlarge the standard UPKP logo');
  art.querySelector('.card-light').setAttribute('aria-hidden', String(dark));
  art.querySelector('.card-dark').setAttribute('aria-hidden', String(!dark));
  document.querySelector('#variant-label').textContent = dark ? LydiaI18n.text("02 — Reversed version", "02 — 反白版本") : LydiaI18n.text("01 — Standard version", "01 — 标准版本");
}));
const steps = [
  ['logo_draft1_01.jpg',LydiaI18n.text("FIRST DRAFT", "初稿"),LydiaI18n.text("The early sketch puts a leaf form beside the handwritten name “Up Keep,” before the identity becomes a compact wordmark.", "早期草稿将叶片与手写的 “Up Keep” 并置，随后逐步发展为紧凑的文字标志。")],
  ['logo draft2-01.png',LydiaI18n.text("SECOND DRAFT", "第二稿"),LydiaI18n.text("This direction focuses on the letterforms, pairing a blue UPKP wordmark with the full name underneath.", "这轮迭代聚焦字形，将蓝色 UPKP 缩写与下方全称结合。")],
  ['01.png',LydiaI18n.text("THIRD DRAFT / 3.1", "第三稿 / 3.1"),LydiaI18n.text("The third round brings the symbol and wordmark together, exploring their balance and arrangement.", "重点放在将图形与文字标志组合，探索两者的排列与组合。")],
  ['Letter - 1.png',LydiaI18n.text("THIRD DRAFT / 3.3", "第三稿 / 3.3"),LydiaI18n.text("The refinement stage adjusts letter spacing, working toward a clearer and more consistent final identity.", "细化阶段调整字距，让最终标识更清晰、统一。")]
];
const tabs = [...document.querySelectorAll('[data-step]')];
function setStep(index) {
  tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
  const [file, label, description] = steps[index];
  const picture = document.querySelector('#process-image');
  picture.src = asset(file); picture.alt = label + ': ' + description;
  picture.parentElement.dataset.zoom = file;
  document.querySelector('#process-tag').textContent = label;
  document.querySelector('#process-description').textContent = description;
  document.querySelector('#process-panel').setAttribute('aria-labelledby', `step-${index}`);
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => setStep(index));
  tab.addEventListener('keydown', event => {
    const next = {ArrowDown:(index+1)%4,ArrowUp:(index+3)%4,Home:0,End:3}[event.key];
    if (next === undefined) return;
    event.preventDefault(); setStep(next); tabs[next].focus();
  });
});
const options = document.querySelector('#color-options');
for (let i=1;i<=9;i++) {
  const button = document.createElement('button');
  button.setAttribute('aria-label', `Color study ${i}`);
  button.setAttribute('aria-pressed', String(i === 1));
  const image = document.createElement('img'); image.src = asset(`color${i}.png`); image.alt = ''; image.loading = 'lazy';
  button.append(image);
  button.addEventListener('click', () => {
    [...options.children].forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    const current = document.querySelector('#color-image'); current.src = image.src; current.alt = `UPKP color study ${i}`;
    current.parentElement.dataset.zoom = `color${i}.png`;
    document.querySelector('#color-number').textContent = `STUDY ${String(i).padStart(2,'0')} / 09`;
  });
  options.append(button);
}
const numbered = (count, fn) => Array.from({length:count},(_,i) => fn(i+1));
const groups = [
  [LydiaI18n.text("First draft", "初稿"),numbered(15,i=>`logo_draft1_${String(i).padStart(2,'0')}.${[8,11,13,14,15].includes(i)?'png':'jpg'}`)],
  [LydiaI18n.text("Second draft", "第二稿"),numbered(15,i=>`logo draft2-${String(i).padStart(2,'0')}.png`)],
  ['Third draft · Form',numbered(6,i=>`${String(i).padStart(2,'0')}.png`)],
  ['Third draft · Color',numbered(9,i=>`color${i}.png`)],
  ['Third draft · Refinement',numbered(8,i=>`Letter - ${i}.png`)]
];
// 下方代码会拼接这些英文标签；中文在这里一同维护。
LydiaI18n.register([
  [
    "15 STUDIES",
    "15 次研究"
  ],
  [
    "6 STUDIES",
    "6 次研究"
  ],
  [
    "9 STUDIES",
    "9 次研究"
  ],
  [
    "8 STUDIES",
    "8 次研究"
  ]
]);
for (const [index,[name, files]] of groups.entries()) {
  const details = document.createElement('details');
  const summary = document.createElement('summary');
  summary.innerHTML = `<span>${String(index+1).padStart(2,'0')}</span>${name}<span>${files.length} STUDIES</span><b aria-hidden="true">+</b>`;
  details.append(summary);
  details.addEventListener('toggle', () => {
    if (!details.open || details.querySelector('.archive-grid')) return;
    const grid = document.createElement('div'); grid.className = 'archive-grid';
    files.forEach((file,i) => {
      const button = document.createElement('button'); button.dataset.zoom = file; button.setAttribute('aria-label', `Enlarge ${name}, study ${i+1}`);
      const image = document.createElement('img'); image.src = asset(file); image.alt = `${name}, study ${i+1}`; image.loading = 'lazy';
      button.append(image); grid.append(button);
    });
    details.append(grid);
  });
  document.querySelector('#archive-groups').append(details);
}
const dialog = document.querySelector('#image-dialog');
document.addEventListener('click', event => {
  const button = event.target.closest('[data-zoom]'); if (!button) return;
  const image = document.querySelector('#dialog-image'); image.src = asset(button.dataset.zoom);
  image.alt = button.getAttribute('aria-label') || button.querySelector('img')?.alt || 'Original UPKP design';
  document.querySelector('#dialog-caption').textContent = 'Original artwork · ' + button.dataset.zoom;
  dialog.showModal();
});
document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

// One composited light layer follows the pointer; no continuous animation loop.
const card = document.querySelector('.business-card');
const pointerMotion = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
let lightFrame = 0;
let lightX = 0, lightY = 0;
function positionLight(event) {
  if (!pointerMotion.matches || event.pointerType === 'touch') return;
  const bounds = card.getBoundingClientRect();
  lightX = (event.clientX - bounds.left) * card.offsetWidth / bounds.width;
  lightY = (event.clientY - bounds.top) * card.offsetHeight / bounds.height;
  if (lightFrame) return;
  lightFrame = requestAnimationFrame(() => {
    card.style.setProperty('--light-x', `${lightX}px`);
    card.style.setProperty('--light-y', `${lightY}px`);
    lightFrame = 0;
  });
}
card.addEventListener('pointerenter', positionLight);
card.addEventListener('pointermove', positionLight);
card.addEventListener('pointerleave', () => { cancelAnimationFrame(lightFrame); lightFrame = 0; });


