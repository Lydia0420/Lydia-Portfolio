(() => {
  const signature = document.querySelector('.intro-signature');
  if (!signature || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  let delay = 120;
  signature.querySelectorAll('path').forEach(path => {
    const duration = Math.max(110, Math.min(430, path.getTotalLength() * 3.2));
    path.setAttribute('pathLength', '1');
    path.style.setProperty('--duration', `${duration}ms`);
    path.style.setProperty('--delay', `${delay}ms`);
    delay += duration * .88;
  });
  signature.classList.add('is-ready');
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    signature.classList.add('is-writing');
    observer.disconnect();
  }, { threshold: .8 });
  observer.observe(signature);
})();
