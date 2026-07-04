import { useEffect, useState } from 'react';

function getDocTop(el) {
  return el.getBoundingClientRect().top + window.scrollY;
}

/**
 * Highlights the nav link whose section is currently in view.
 * Uses getBoundingClientRect (offsetTop is unreliable in nested layouts).
 */
export function useScrollSpy(sectionIds, offset = 96) {
  const [activeId, setActiveId] = useState(sectionIds[0] || null);

  useEffect(() => {
    if (!sectionIds.length) return undefined;

    const onScroll = () => {
      const y = window.scrollY + offset;
      let current = sectionIds[0];
      let bestTop = -Infinity;

      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const top = getDocTop(el);
        if (top <= y && top > bestTop) {
          bestTop = top;
          current = id;
        }
      });

      setActiveId(current);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [sectionIds, offset]);

  return activeId;
}
