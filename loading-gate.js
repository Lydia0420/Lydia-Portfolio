/* Lock only the initial loading phase; the site's modal scroll handling is unchanged. */
(function () {
    const root = document.documentElement;
    root.classList.add('intro-loading');
    let locked = true;
    const isReload = window.performance.getEntriesByType('navigation')[0]?.type === 'reload';
    const resetPosition = () => {
        if (isReload) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };
    const holdStart = () => { if (locked && window.scrollY !== 0) resetPosition(); };
    if (isReload) {
        window.history.scrollRestoration = 'manual';
        resetPosition();
        document.addEventListener('DOMContentLoaded', resetPosition, { once: true });
        window.addEventListener('pageshow', resetPosition, { once: true });
        window.addEventListener('scroll', holdStart);
    }
    const cancel = event => {
        if (!locked || event.ctrlKey || event.metaKey) return;
        if (event.type === 'touchmove' && event.touches.length > 1) return;
        if (event.type === 'keydown' && !['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)) return;
        if (event.target.closest && event.target.closest('#loading-retry, input, textarea, select')) return;
        event.preventDefault();
    };
    ['wheel', 'touchmove', 'keydown'].forEach(type => document.addEventListener(type, cancel, { passive: false }));
    const preventJump = event => {
        if (locked && event.target.closest('a[onclick], a[href^="#"]')) {
            event.preventDefault(); event.stopImmediatePropagation();
        }
    };
    document.addEventListener('click', preventJump, true);
    window.introGate = {
        unlock() {
            resetPosition();
            locked = false;
            window.removeEventListener('scroll', holdStart);
            root.classList.remove('intro-loading');
            ['wheel', 'touchmove', 'keydown'].forEach(type => document.removeEventListener(type, cancel));
            document.removeEventListener('click', preventJump, true);
        },
        fail(retry) {
            const show = () => {
                const status = document.getElementById('loading');
                const button = document.getElementById('loading-retry');
                status.style.display = '';
                status.textContent = root.lang === 'zh-CN' ? '部分资源未加载，请重试。' : 'Some assets could not load. Please retry.';
                button.hidden = false;
                button.textContent = root.lang === 'zh-CN' ? '重新加载' : 'Retry loading';
                button.onclick = retry || (() => location.reload());
            };
            if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show, { once: true });
            else show();
        }
    };
})();
