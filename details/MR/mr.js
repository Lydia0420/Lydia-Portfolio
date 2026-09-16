(() => {
  const key = 'lydia-site-language';
  const toggle = document.getElementById('lang');
  const invitation = document.getElementById('invitation');
  const filmDialog = document.getElementById('film-dialog');
  const film = document.getElementById('film');
  const imageDialog = document.getElementById('image-dialog');
  let language = 'en', chapter = 0, currentImage = null, pendingTime = 0;
  const chapters = [
    {image:'arrival',time:0,en:['THE THRESHOLD','An invitation to slow down.','The everyday street is the starting point. A rose introduces a story that unfolds through the hotel.'],zh:['入口','一份放慢脚步的邀请。','故事从日常街道开始。一朵玫瑰，将观众带入逐渐展开的饭店记忆。']},
    {image:'listen',time:20,en:['THE FIRST SOUND','An object becomes a voice.','The gramophone brings listening into the space. Music and narration give the objects a place within Yao Lee’s story.'],zh:['聆听','物件，开始发声。','留声机将聆听带入空间。音乐与叙述，让物件成为姚莉故事中的一部分。']},
    {image:'discover',time:38,en:['TRACES OF THE CITY','History comes into view.','Images and printed fragments appear alongside the architecture, connecting a personal story with the surrounding city.'],zh:['发现','历史，进入视野。','图像与纸面碎片在建筑间出现，将一个人的故事连接到她所处的城市。']},
    {image:'ballroom',time:60,en:['THE BALLROOM','The room becomes a stage.','Curtains, performance imagery and period-inspired objects create a richer encounter in the main hall.'],zh:['舞厅','房间，成为舞台。','帷幕、表演影像与具有时代气息的物件，让大厅中的体验逐渐丰盈。']},
    {image:'return',time:98,en:['THE LAST FRAGMENT','A song to carry with you.','The musical score and rose bring the journey back to its central motif: a voice that can outlast a moment.'],zh:['回响','带着一首歌离开。','琴谱与玫瑰，将旅程带回最初的主题：让声音穿过时间，在离开之后依然留存。']}
  ];
  const tr = (en, zh) => language === 'zh-CN' ? zh : en;
  function renderChapter() {
    const item = chapters[chapter], text = language === 'zh-CN' ? item.zh : item.en;
    document.getElementById('chapter-kicker').textContent = text[0];
    document.getElementById('chapter-title').textContent = text[1];
    document.getElementById('chapter-description').textContent = text[2];
    const image = document.getElementById('chapter-image');
    image.src = 'assets/' + item.image + '.webp'; image.alt = text[1];
    document.getElementById('scene-number').textContent = `0${chapter + 1} / 05`;
    document.querySelectorAll('[data-chapter]').forEach(b => { b.setAttribute('aria-pressed', String(Number(b.dataset.chapter) === chapter)); b.setAttribute('aria-label',tr('Moment ', '片段 ') + b.textContent); });
  }
  function setLanguage(next) {
    language = next === 'zh-CN' ? 'zh-CN' : 'en'; document.documentElement.lang = language;
    document.querySelectorAll('[data-en][data-zh]').forEach(el => { el.innerHTML = tr(el.dataset.en, el.dataset.zh); });
    document.querySelectorAll('[data-alt-en]').forEach(el => { el.alt = tr(el.dataset.altEn, el.dataset.altZh); });
    document.querySelectorAll('[data-label-en]').forEach(el => { el.setAttribute('aria-label', tr(el.dataset.labelEn, el.dataset.labelZh)); });
    toggle.textContent = tr('中文','EN'); toggle.setAttribute('aria-label', tr('切换为中文','Switch to English'));
    invitation.setAttribute('aria-label', tr('Turn the invitation over','翻转邀请函'));
    filmDialog.setAttribute('aria-label', tr('Project trailer','项目预告片'));
    imageDialog.setAttribute('aria-label', tr('Project image','项目图片'));
    film.setAttribute('aria-label', tr('The Rose of Time project trailer','《时间的玫瑰》项目预告片'));
    document.querySelectorAll('[data-image]').forEach(b => b.setAttribute('aria-label',tr('Enlarge: ','放大：') + tr(b.dataset.captionEn,b.dataset.captionZh)));
    if (currentImage) updateImageCaption();
    renderChapter();
  }
  function savedLanguage() { try { return localStorage.getItem(key) || 'en'; } catch { return 'en'; } }
  toggle.addEventListener('click', () => { setLanguage(language === 'en' ? 'zh-CN' : 'en'); try { localStorage.setItem(key, language); } catch {} });
  window.addEventListener('storage', e => { if(e.key === key) setLanguage(e.newValue); });
  window.addEventListener('pageshow', () => setLanguage(savedLanguage()));
  document.querySelectorAll('[data-chapter]').forEach(b => b.addEventListener('click', () => { chapter = Number(b.dataset.chapter); renderChapter(); }));
  invitation.addEventListener('click', () => invitation.setAttribute('aria-pressed', String(invitation.getAttribute('aria-pressed') !== 'true')));
  function playFromTime() { film.currentTime = pendingTime; film.play().catch(() => {}); }
  function showFilm(time) {
    pendingTime = time; document.getElementById('film-error').hidden = true;
    filmDialog.showModal();
    if (!film.getAttribute('src')) { film.src = 'assets/trailer.mp4'; film.load(); }
    else if (film.readyState >= 1) playFromTime();
    else film.load();
  }
  film.addEventListener('loadedmetadata', () => { if(filmDialog.open) playFromTime(); });
  film.addEventListener('error', () => { document.getElementById('film-error').hidden = false; });
  filmDialog.addEventListener('close', () => film.pause());
  document.querySelectorAll('[data-watch]').forEach(b => b.addEventListener('click', () => showFilm(Number(b.dataset.watch))));
  document.getElementById('watch-chapter').addEventListener('click', () => showFilm(0));
  function updateImageCaption() { const caption = tr(currentImage.dataset.captionEn,currentImage.dataset.captionZh); document.getElementById('image-caption').textContent = caption; document.getElementById('large-image').alt = caption; }
  document.querySelectorAll('[data-image]').forEach(b => b.addEventListener('click', () => { currentImage=b;document.getElementById('large-image').src=b.dataset.image;updateImageCaption();imageDialog.showModal(); }));
  document.querySelectorAll('.dialog-close').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
  [filmDialog,imageDialog].forEach(d=>d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}));
  setLanguage(savedLanguage());
})();
