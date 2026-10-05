/* Scroll-driven type for the Home. Everything here starts from readable text:
   without JS, or with reduced motion, nothing is hidden and nothing moves. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.registerPlugin(ScrollTrigger);

  // Words light up as the sentence scrolls through the viewport.
  document.querySelectorAll<HTMLElement>('[data-words]').forEach((el) => {
    const text = el.textContent!.trim();
    el.setAttribute('aria-label', text);
    el.replaceChildren(...text.split(/\s+/).flatMap((w, i) => {
      const span = document.createElement('span');
      span.setAttribute('aria-hidden', 'true');
      span.textContent = w;
      return i ? [' ', span] : [span];
    }));
    gsap.from(el.children, {
      opacity: 0.16,
      ease: 'none',
      stagger: 0.5,
      // One-way: once the sentence is fully lit it stays lit, so it never sits dimmed (low contrast) on a revisit.
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 55%', scrub: 0.5, onLeave: (self) => self.kill(false, true) },
    });
  });

  // Section titles rise from a mask once, on first sight.
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const inner = document.createElement('span');
    inner.style.display = 'block';
    inner.append(...el.childNodes);
    el.style.overflow = 'hidden';
    el.append(inner);
    gsap.from(el.firstElementChild, {
      yPercent: 105,
      duration: 1,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
}
