'use strict';
// Flat gold / navy icons used instead of emoji (emoji look different on every device and clash with the HUD art).
// Each is an inline SVG sized 1em, so it scales with the text around it.
const IC = (() => {
  const G = '#ffd23a', N = '#0e1634', svg = b => '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + b + '</svg>';
  return {
    castle: svg(`<path d="M3 21V9h3V6h2v3h2V4h4v5h2V6h2v3h3v12h-7v-5a2 2 0 00-4 0v5z" fill="${G}"/><rect x="11" y="6" width="2" height="2" fill="${N}"/>`),
    snd: svg(`<path d="M3 9h4l5-4v14l-5-4H3z" fill="${G}"/><path d="M15 8.5a5 5 0 010 7M17.5 6a8.5 8.5 0 010 12" fill="none" stroke="${G}" stroke-width="2.2" stroke-linecap="round"/>`),
    sndOff: svg(`<path d="M3 9h4l5-4v14l-5-4H3z" fill="${G}"/><path d="M15.5 9l5 6M20.5 9l-5 6" stroke="${G}" stroke-width="2.4" stroke-linecap="round"/>`),
    clock: svg(`<circle cx="12" cy="13" r="9" fill="${G}"/><circle cx="12" cy="13" r="6.6" fill="${N}"/><path d="M12 9v4.5l3 2" fill="none" stroke="${G}" stroke-width="2.2" stroke-linecap="round"/><rect x="10" y="1.5" width="4" height="2.6" rx="1" fill="${G}"/>`),
    plane: svg(`<path d="M21.5 11.2c.8 0 .8 1.6 0 1.6H15l-4.6 8H8l2.3-8H5.4L3.3 15.4H1.5l1.2-3.4-1.2-3.4h1.8l2.1 2.6h4.9L8 3.2h2.4l4.6 8z" fill="${G}"/>`),
    wrench: svg(`<path d="M20.5 6.2l-3.3 3.3-2.7-.7-.7-2.7 3.3-3.3a5.5 5.5 0 00-7 7L3 16.9a2.2 2.2 0 003.1 3.1l7.1-7.1a5.5 5.5 0 007.3-6.7z" fill="${G}"/><circle cx="4.6" cy="18.4" r="1" fill="${N}"/>`),
    bricks: svg(`<rect x="2" y="4" width="20" height="16" rx="1.5" fill="${G}"/><path d="M2 9.3h20M2 14.7h20M8 4v5.3M16 4v5.3M12 9.3v5.4M5 14.7V20M19 14.7V20" stroke="${N}" stroke-width="1.6"/>`),
    spikes: svg(`<path d="M2 20l3-12 3 12 3-14 3 14 3-12 3 12 2-8v8z" fill="${G}"/><rect x="1.5" y="19" width="21" height="2.5" rx="1" fill="${G}"/>`),
    mine: svg(`<circle cx="12" cy="14" r="7" fill="${G}"/><rect x="10.5" y="3" width="3" height="5" rx="1" fill="${G}"/><circle cx="12" cy="14" r="2.6" fill="${N}"/>`),
    bag: svg(`<path d="M9 3h6l-1.6 3.5h-2.8z" fill="${G}"/><path d="M8.5 7.5h7c3 2.4 5 5.6 5 8.5 0 3.3-2.5 5-8.5 5s-8.5-1.7-8.5-5c0-2.9 2-6.1 5-8.5z" fill="${G}"/><path d="M12 10.5v8M14.2 12.3c-.6-.8-3.8-1-3.8.6s3.8 1 3.8 2.6-3.2 1.5-3.9.6" fill="none" stroke="${N}" stroke-width="1.5" stroke-linecap="round"/>`),
    boom: svg(`<path d="M12 1.5l2.4 5.4 5.6-2.2-2.2 5.6 5.4 2.4-5.4 2.4 2.2 5.6-5.6-2.2L12 22.5l-2.4-5.4-5.6 2.2 2.2-5.6L.8 12.3l5.4-2.4L4 4.7l5.6 2.2z" fill="${G}"/><circle cx="12" cy="12.3" r="3.6" fill="${N}"/>`),
    bolt: svg(`<path d="M14 1.5L4.5 13.5h6l-1.5 9 9.5-12h-6z" fill="${G}"/>`),
    coins: svg(`<ellipse cx="12" cy="17.5" rx="8" ry="3.5" fill="${G}"/><ellipse cx="12" cy="13" rx="8" ry="3.5" fill="${G}" stroke="${N}" stroke-width="1.2"/><ellipse cx="12" cy="8.5" rx="8" ry="3.5" fill="${G}" stroke="${N}" stroke-width="1.2"/>`),
    waves: svg(`<path d="M2 9c2.5-2.5 4.5-2.5 7 0s4.5 2.5 7 0 4.5-2.5 6 0M2 15.5c2.5-2.5 4.5-2.5 7 0s4.5 2.5 7 0 4.5-2.5 6 0" fill="none" stroke="${G}" stroke-width="2.4" stroke-linecap="round"/>`),
    lock: svg(`<path d="M7 10.5V8a5 5 0 0110 0v2.5" fill="none" stroke="${G}" stroke-width="2.4"/><rect x="4" y="10" width="16" height="12" rx="2" fill="${G}"/><rect x="11" y="13.5" width="2" height="5" rx="1" fill="${N}"/>`),
    swap: svg(`<path d="M4 8h13M13 4l4 4-4 4M20 16H7M11 12l-4 4 4 4" fill="none" stroke="${G}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`),
    trophy: svg(`<path d="M6 3h12v5.5c0 3.6-2.6 6.3-6 6.3S6 12.1 6 8.5z" fill="${G}"/><path d="M6 5H2.8v1.8C2.8 9.3 4.6 11 6.8 11M18 5h3.2v1.8c0 2.5-1.8 4.2-4 4.2" fill="none" stroke="${G}" stroke-width="1.8"/><rect x="10.8" y="14.5" width="2.4" height="3.5" fill="${G}"/><rect x="7" y="18" width="10" height="3" rx="1" fill="${G}"/>`),
    target: svg(`<circle cx="12" cy="12" r="9.5" fill="${G}"/><circle cx="12" cy="12" r="6.5" fill="${N}"/><circle cx="12" cy="12" r="3.6" fill="${G}"/>`),
    skip: svg(`<path d="M3 5l8 7-8 7zM11 5l8 7-8 7z" fill="#fff"/><rect x="19" y="5" width="2.4" height="14" fill="#fff"/>`),
    // tutorial pointer: a chunky arrow cursor with a dark outline so it reads on any background
    pointer: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 2l14 11.5-6.2.6 3.6 7.2-3 1.5-3.6-7.3L5 20z" fill="#ffd23a" stroke="#0e1634" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  };
})();
// static HTML placeholders: <span data-ic="castle"></span>
document.querySelectorAll('[data-ic]').forEach(e => { e.innerHTML = IC[e.dataset.ic] || '' });
