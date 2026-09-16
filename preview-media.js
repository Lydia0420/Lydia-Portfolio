/* 仅用于无视频的线上测试站。接入视频后，可移除此文件及各页引用。 */
(() => {
    const english = 'Preview site · Videos will be added later.';
    const chinese = '测试站 · 视频稍后接入，当前可浏览页面与其他交互。';
    const message = () => document.documentElement.lang.startsWith('zh') ? chinese : english;
    const note = document.createElement('div');
    note.setAttribute('role', 'note');
    note.textContent = message();
    note.style.cssText = 'position:fixed;bottom:10px;left:50%;transform:translateX(-50%);z-index:99999;max-width:90vw;padding:7px 12px;border-radius:6px;background:rgba(255,255,255,.94);color:#444;box-shadow:0 2px 10px #0001;font:11px/1.4 Arial,sans-serif;text-align:center;pointer-events:none';
    document.body.append(note);
    new MutationObserver(() => { note.textContent = message(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    document.querySelectorAll('video').forEach(video => {
        const caption = document.createElement('p');
        caption.textContent = message();
        caption.style.cssText = 'font:12px/1.5 Arial,sans-serif;opacity:.7;text-align:center';
        video.after(caption);
    });
    document.addEventListener('click', event => {
        const link = event.target.closest('a[href]');
        if (link && /\.(mp4|mov|m4v|webm)(?:[?#]|$)/i.test(link.getAttribute('href'))) {
            event.preventDefault();
            window.alert(message());
        }
    }, true);
})();
