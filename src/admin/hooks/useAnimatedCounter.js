import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export function useAnimatedCounter(value, duration = 0.9) {
  const [display, setDisplay] = useState(0);
  const tweenRef = useRef(null);
  const obj = useRef({ val: 0 });

  useEffect(() => {
    tweenRef.current?.kill();
    tweenRef.current = gsap.to(obj.current, {
      val: value,
      duration,
      ease: 'power3.out',
      onUpdate: () => setDisplay(Math.round(obj.current.val)),
    });
    return () => tweenRef.current?.kill();
  }, [value, duration]);

  return display;
}
