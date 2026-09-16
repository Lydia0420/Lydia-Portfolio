// 全站通用词汇。作品的 data-zh 或 LydiaI18n.text 中的中文优先于这里。
window.LYDIA_COMMON_ZH = [
  [
    "Work",
    "作品"
  ],
  [
    "About",
    "关于"
  ],
  [
    "Contact",
    "联系"
  ],
  [
    "Role",
    "角色"
  ],
  [
    "My role",
    "我的角色"
  ],
  [
    "Tools",
    "工具"
  ],
  [
    "Tool",
    "工具"
  ],
  [
    "Context",
    "背景"
  ],
  [
    "Focus",
    "关注方向"
  ],
  [
    "Format",
    "形式"
  ],
  [
    "Year",
    "年份"
  ],
  [
    "Runtime",
    "时长"
  ],
  [
    "Overview",
    "项目概述"
  ],
  [
    "Exploration",
    "探索方向"
  ],
  [
    "Close ×",
    "关闭 ×"
  ],
  [
    "Close",
    "关闭"
  ],
  [
    "Zoom",
    "放大"
  ],
  [
    "Light",
    "浅色"
  ],
  [
    "Dark",
    "深色"
  ],
  [
    "Final",
    "最终版"
  ],
  [
    "Version 01",
    "版本 01"
  ],
  [
    "Version 02",
    "版本 02"
  ],
  [
    "Version 03",
    "版本 03"
  ],
  [
    "Wireframes",
    "线框稿"
  ],
  [
    "Final screens",
    "最终界面"
  ],
  [
    "Restart ↺",
    "重新开始 ↺"
  ],
  [
    "Expand ↗",
    "展开 ↗"
  ],
  [
    "Enlarge ↗",
    "放大 ↗"
  ],
  [
    "Back to top ↑",
    "回到顶部 ↑"
  ],
  [
    "OUTPUT",
    "产出"
  ],
  [
    "← Back",
    "← 返回"
  ],
  [
    "Back",
    "返回"
  ]
];

// 动态文案：英文、中文写在同一调用中。返回英文以保留原有作品逻辑；
// detail-language.js 只在界面上切换显示，注册的译文不会跨页面共享。
(() => {
  const rows = window.LYDIA_PAGE_ZH = window.LYDIA_PAGE_ZH || [];
  window.LydiaI18n = {
    text(en, zh) {
      if (!rows.some(row => row[0] === en && row[1] === zh)) rows.push([en, zh]);
      return en;
    },
    register(entries) { rows.push(...entries); },
    normalize(value) { return value.replace(/\s+/g, '').toLowerCase(); },
    lookup(value) {
      const normalize = this.normalize;
      const key = normalize(value);
      const local = [...rows, ...(window.LYDIA_DETAIL_ZH || [])];
      // Exact page overrides win; a page prefix still outranks a common term.
      for (let i = local.length - 1; i >= 0; i--) {
        if (!local[i][2] && normalize(local[i][0]) === key) return local[i][1];
      }
      const prefix = local.find(row => row[2] && key.startsWith(normalize(row[0])));
      if (prefix) return prefix[1];
      return window.LYDIA_COMMON_ZH.find(row => normalize(row[0]) === key)?.[1];
    }
  };
})();
