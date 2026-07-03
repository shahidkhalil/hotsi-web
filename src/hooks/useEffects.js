import { useEffect } from 'react';

export function useCustomCursor() {
  useEffect(() => {
    const cur = document.getElementById('cursor');
    const glow = document.getElementById('cursor-glow');
    if (!cur || !glow) return;

    let mx = 0;
    let my = 0;
    let gx = 0;
    let gy = 0;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      cur.style.left = `${mx - 6}px`;
      cur.style.top = `${my - 6}px`;
    };

    document.addEventListener('mousemove', onMove);

    let rafId;
    const tg = () => {
      gx += (mx - gx - 20) * 0.1;
      gy += (my - gy - 20) * 0.1;
      glow.style.left = `${gx}px`;
      glow.style.top = `${gy}px`;
      rafId = requestAnimationFrame(tg);
    };
    rafId = requestAnimationFrame(tg);

    const hoverEls = document.querySelectorAll('a,button,.fc,.cat-card,.dc,.wc,.mi');
    const onEnter = () => {
      cur.style.transform = 'scale(2)';
      glow.style.width = '60px';
      glow.style.height = '60px';
      glow.style.borderColor = 'rgba(255,107,53,.6)';
    };
    const onLeave = () => {
      cur.style.transform = 'scale(1)';
      glow.style.width = '40px';
      glow.style.height = '40px';
      glow.style.borderColor = 'rgba(255,107,53,.4)';
    };

    hoverEls.forEach((el) => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
      hoverEls.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
    };
  }, []);
}

export function useNavScroll() {
  useEffect(() => {
    const onScroll = () => document.getElementById('nav')?.classList.toggle('scrolled', scrollY > 80);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}

export function useEscapeKey(handler) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handler(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [handler]);
}
