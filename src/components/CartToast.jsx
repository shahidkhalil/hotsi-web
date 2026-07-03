import { useEffect } from 'react';
import gsap from 'gsap';

export default function CartToast({ toast, onDone }) {
  useEffect(() => {
    if (!toast) return undefined;
    const el = document.getElementById('cart-toast');
    if (el) {
      gsap.fromTo(el, { opacity: 0, y: 24, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.6)' });
    }
    const t = setTimeout(() => {
      if (el) gsap.to(el, { opacity: 0, y: -12, duration: 0.3, onComplete: onDone });
      else onDone();
    }, 2600);
    return () => clearTimeout(t);
  }, [toast, onDone]);

  if (!toast) return null;

  return (
    <div id="cart-toast" className="cart-toast">
      <span className="cart-toast-icon">{toast.emoji || '🛒'}</span>
      <div className="cart-toast-body">
        <strong>Added to cart!</strong>
        <span>{toast.name}</span>
      </div>
      <span className="cart-toast-check">✓</span>
    </div>
  );
}
