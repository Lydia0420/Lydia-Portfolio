// Read the sky before tree, petals and status overlays are painted.
// Leave all artwork drawing and interaction code unchanged.
const paintSakuraBackground = window.drawBackground;
let previousSkyColor = '';
window.drawBackground = function (...args) {
  paintSakuraBackground.apply(this, args);
  if (window.parent === window) return;
  const [r, g, b] = drawingContext.getImageData(0, 0, 1, 1).data;
  const skyColor = `rgb(${r}, ${g}, ${b})`;
  if (skyColor === previousSkyColor) return;
  previousSkyColor = skyColor;
  const nav = window.parent.document.querySelector('nav');
  if (!nav) return;
  nav.style.backgroundColor = skyColor;
  const link = nav.querySelector('a');
  link.style.color = (r * .2126 + g * .7152 + b * .0722) > 140
    ? '#493e46' : '#f8f2f4';
};
