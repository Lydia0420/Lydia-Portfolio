const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../loading-gate.js'), 'utf8');

// Minimal DOM boundary for the real gate; frames intentionally never finish loading.
function start(hash, type = 'navigate') {
  const classes = new Set();
  const handlers = {};
  const status = { style: {}, textContent: '' };
  const retry = { hidden: true };
  let jumps = 0;
  const document = {
    documentElement: { classList: { add: c => classes.add(c), remove: c => classes.delete(c) } },
    readyState: 'complete',
    addEventListener: (name, fn) => { handlers[name] = fn; },
    removeEventListener: name => { delete handlers[name]; },
    getElementById: id => id === 'loading' ? status : retry
  };
  const window = { location: { hash }, performance: { getEntriesByType: () => [{ type }] },
    history: {}, scrollY: 1000, scrollTo: () => { jumps++; },
    addEventListener() {}, removeEventListener() {} };
  vm.runInNewContext(source, { window, document, location: window.location });
  return { classes, handlers, status, retry, window, jumps: () => jumps };
}

for (const hash of ['#work-section', '#book-modal', '#game-modal', '#imac-modal', '#tv-modal']) {
  test(`${hash}: returning visitors can interact before frames finish`, () => {
    const page = start(hash, 'reload');
    assert.equal(page.classes.has('intro-loading'), false);
    let blocked = false;
    page.handlers.wheel?.({ type: 'wheel', preventDefault: () => { blocked = true; } });
    assert.equal(blocked, false);
    page.window.introGate.unlock();
    assert.equal(page.jumps(), 0);
    page.window.introGate.fail();
    assert.equal(page.retry.hidden, true);
  });
}
for (const hash of ['', '#invalid-modal']) {
  test(`${hash || 'first visit'}: ordinary entry still waits for animation`, () => {
    const page = start(hash);
    assert.equal(page.classes.has('intro-loading'), true);
    page.window.introGate.fail();
    assert.equal(page.retry.hidden, false);
    page.window.introGate.unlock();
    assert.equal(page.classes.has('intro-loading'), false);
  });
}

test('Work navigation can bypass an in-progress first-visit gate', () => {
  const page = start('', 'reload');
  const before = page.jumps();
  page.window.introGate.showWork();
  assert.equal(page.classes.has('intro-loading'), false);
  assert.equal(page.classes.has('intro-return'), true);
  page.window.introGate.unlock();
  assert.equal(page.jumps(), before);
  page.window.introGate.fail();
  assert.equal(page.retry.hidden, true);
});
