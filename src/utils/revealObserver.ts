export type RevealObserverOptions = {
  selector?: string | string[];
  inViewClass?: string;
  root?: Element | Document | null;
  rootMargin?: string;
  threshold?: number | number[];
  onceAttr?: string;
  unobserveOnReveal?: 'always' | 'attr' | 'never';
  onReveal?: (el: Element, entry: IntersectionObserverEntry | undefined, reducedMotion: boolean) => void;
};

export function setupRevealObserver(options: RevealObserverOptions = {}) {
  const {
    selector = '.reveal',
    inViewClass = 'in-view',
    root = null,
    rootMargin = '0px',
    threshold = 0,
    onceAttr = 'data-once',
    unobserveOnReveal = 'attr',
    onReveal,
  } = options;

  const selectors = Array.isArray(selector) ? selector : [selector];
  const elements: Element[] = selectors.flatMap((sel) => Array.from(document.querySelectorAll(sel)));

  if (elements.length === 0) return;

  const prefersReducedMotion = typeof window !== 'undefined' && 'matchMedia' in window
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  const reveal = (el: Element, entry?: IntersectionObserverEntry) => {
    el.classList.add(inViewClass);
    if (onReveal) {
      onReveal(el, entry, prefersReducedMotion);
    }
  };

  // If user prefers reduced motion or IntersectionObserver isn't supported, reveal immediately.
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    elements.forEach((el) => reveal(el));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target as Element;
        reveal(el, entry);

        if (unobserveOnReveal === 'always') {
          obs.unobserve(el);
        } else if (unobserveOnReveal === 'attr' && el.hasAttribute(onceAttr)) {
          obs.unobserve(el);
        }
      }
    });
  }, { root, rootMargin, threshold });

  elements.forEach((el) => observer.observe(el));
}