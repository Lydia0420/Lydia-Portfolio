(() => {
  'use strict';
  // Shared storage key reserved for future detail/experience page integration.
  const key = 'lydia-site-language';
  const button = document.querySelector('.language-toggle');
  button.classList.add('site-language-control');
  const entries = [];
  function add(selector, zh) {
    document.querySelectorAll(selector).forEach(element => entries.push({ element, en: element.innerHTML, zh }));
  }
  add('.nav-links a:nth-child(1)', '作品');
  add('.nav-links a:nth-child(2)', '关于');
  add('.nav-links a:nth-child(3)', '联系');
  add('#scroll-cue', '向下滚动，开始探索 ↓');
  add('.intro-kicker', '影像、AI 与<em>游戏。</em>');
  add('.intro-slogan', '让想法，<br>成为可感知的<em>体验。</em>');
  add('.intro-lead', '一名设计师，也是一名创意技术探索者。');
  add('.intro-purpose', '我通过创作，探索人与作品相遇时会发生什么。');
  add('.intro-detail', '我着迷于人与技术之间那些细微、偶然的回应：屏幕如何让人想要触碰，系统如何开始讲述故事，以及由代码构建的事物，如何也能让人感受到温度。');
  const collections = [
    ['book', '平面与视觉设计', '理解之前，我们先看见。通过字体、图像、信息层级与界面，我探索视觉语言如何影响信息被阅读和记住的方式。'],
    ['game', '创意编程与游戏设计', '当代码可以被人玩起来，它就更有趣了。我创作游戏与交互系统，让规则、偶然、动作与反馈共同塑造体验。'],
    ['imac', '交互装置与新媒体', '当交互走出屏幕，会发生什么？借助传感器、程序与实时响应的媒介，我让观众不只是观看作品，也参与决定它如何运作。'],
    ['tv', '影像与三维创作', '有些想法，需要在时间中展开。通过纪录片、定格动画与三维创作，我用动态影像构建并观察身边的世界。'],
    ['art', '艺术创作与实验', '并非每个想法都需要一块屏幕。绘画、版画与材料实验，让我通过色彩、肌理、重复和手留下的痕迹，慢慢思考。']
  ];
  collections.forEach(([id, title, description], index) => {
    add(`#work-${id} .title`, title.replace('与', ' <span class="type-amp">&amp;</span> '));
    add(`#work-${id} .description`, description);
    add(`#${id}-modal .modal-label-title`, `0${index + 1} / ${title.replace('与', ' &amp; ')}`);
  });
  add('#work-art .tools', '艺术创作');
  add('.footer-meta:first-of-type', '纽约 · 杭州');
  // footer-name is also a div, so select the location explicitly.
  add('.footer-left .footer-meta:nth-child(2)', '纽约 · 杭州');
  add('.footer-links a:first-child', '电子邮件');
  add('.modal-label-meta', '精选作品 · 2024–2026');
  add('.chapter-kicker', '第一章');
  add('.chapter-title', '视觉语言的探索');
  add('.zine-cover-kicker', '精选项目');
  add('.zine-cover-copy h3', '第一口之前，故事已经开始。');
  add('.zine-cover-copy p', '从社交媒体、排队、手艺与共同记忆出发，探索一次餐厅体验如何成为令人期待的文化事件。');
  add('.zine-cover-copy span', '查看项目 →');
  add('.game-ui-title', '选择你的世界');
  add('.game-ui-subtitle', '选择一个场景，开始探索');
  add('.controls span:first-child', '◯ 进入');
  add('.controls span:last-child', '× 返回');
  add('.tv-ui-title', '影像档案');
  add('.tv-ui-subtitle', '频道 04 · AV 输入');
  add('.tv-ui-track', '轨道 01—04');
  // Translate leaf text nodes only: preserve existing links, handlers and artwork names.
  const labels = {
    'Menu Design · Adobe InDesign': '菜单设计 · Adobe InDesign',
    'Logo Design · InDesign': '标志设计 · InDesign',
    'Menu Design · Figma': '菜单设计 · Figma',
    'Editorial Zine · Adobe InDesign': '编辑出版设计 · Adobe InDesign',
    'GAME 01': '游戏 01', 'GAME 02': '游戏 02', 'GAME 03': '游戏 03',
    'INTERACTIVE': '交互实验', 'File': '文件', 'Edit': '编辑', 'View': '显示',
    'Go': '前往', 'Window': '窗口', 'PROCESS': '创作过程', 'IMAGES': '图像',
    'SKETCHES': '草稿', 'VIDEO': '影像', '01_PROJECT': '01_项目', '02_PROJECT': '02_项目',
    'PROJECT NAME': '项目名称', 'Sep 10 Thu': '9月10日 周四', '10:42 PM': '下午 10:42',
    'STOP MOTION': '定格动画', 'Handmade | 2024': '手工制作 | 2024',
    '3D MODEL': '三维模型', 'VIDEO PIECE': '影像作品', '▶ PLAY': '▶ 播放'
  };
  const textEntries = [];
  document.querySelectorAll('.book-overlay').forEach(modal => {
    const walker = document.createTreeWalker(modal, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const zh = labels[node.textContent.trim()];
      if (zh) textEntries.push({ node, en: node.textContent, zh });
    }
  });
  const attributes = [...document.querySelectorAll('[aria-label], img[alt]')].map(element => {
    const attribute = element.hasAttribute('aria-label') ? 'aria-label' : 'alt';
    const en = element.getAttribute(attribute);
    const translations = { 'View Snowy': '查看 Snowy', 'View Candy Box': '查看 Candy Box', 'Menu & Logo': '菜单与标志设计', 'p5js Game': 'p5.js 游戏', 'TD Work': '新媒体作品', 'movie': '影像作品', 'Painting from the gallery': '画廊中的绘画作品', 'Process Folder': '创作过程文件夹', 'Archive Folder': '图像文件夹', 'Sketches Folder': '草稿文件夹', 'Project 01': '项目 01', 'Project 02': '项目 02', 'What Are We Really Waiting For? editorial zine cover': 'What Are We Really Waiting For? 出版物封面' };
    return { element, attribute, en, zh: translations[en] || en };
  });
  let language = 'en';
  try { if (localStorage.getItem(key) === 'zh-CN') language = 'zh-CN'; } catch (_) {}
  function apply(next, remember = false) {
    const chinese = next === 'zh-CN';
    const anchors = [...document.querySelectorAll('#about-section, .collection-item, .site-footer')];
    const anchor = anchors.find(element => element.getBoundingClientRect().bottom > 80);
    const top = anchor?.getBoundingClientRect().top;
    const position = window.scrollY;
    document.documentElement.lang = next;
    entries.forEach(({ element, en, zh }) => { element.innerHTML = chinese ? zh : en; });
    textEntries.forEach(({ node, en, zh }) => { node.textContent = chinese ? zh : en; });
    attributes.forEach(({ element, attribute, en, zh }) => element.setAttribute(attribute, chinese ? zh : en));
    button.textContent = chinese ? 'EN' : '中文';
    button.lang = chinese ? 'en' : 'zh-CN';
    button.setAttribute('aria-label', chinese ? 'Switch to English' : '切换为中文');
    document.querySelectorAll('.modern-close-btn').forEach(element => {
      element.setAttribute('role', 'button'); element.tabIndex = 0;
      element.setAttribute('aria-label', chinese ? '关闭作品列表' : 'Close project collection');
    });
    const loading = document.getElementById('loading');
    loading.textContent = `${chinese ? '正在加载' : 'Loading'}: ${loading.dataset.progress || 0}%`;
    language = next;
    if (remember) {
      try { localStorage.setItem(key, next); } catch (_) {}
      window.ScrollTrigger?.refresh();
      if (anchor && position > 0) window.scrollBy(0, anchor.getBoundingClientRect().top - top);
    }
  }
  button.addEventListener('click', () => apply(language === 'en' ? 'zh-CN' : 'en', true));
  document.querySelectorAll('.modern-close-btn').forEach(element => element.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); element.click(); }
  }));
  apply(language);
  function syncSavedLanguage() {
    try {
      const saved = localStorage.getItem(key);
      if (['en', 'zh-CN'].includes(saved) && saved !== language) apply(saved);
    } catch (_) {}
  }
  window.addEventListener('pageshow', syncSavedLanguage);
  window.addEventListener('storage', event => { if (event.key === key) syncSavedLanguage(); });
})();
