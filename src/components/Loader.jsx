import { useState, useEffect } from 'react';
import { boot } from '../utils/animations';
import { LOADER_FOOD_IMAGE } from '../utils/visualAssets';

export default function Loader({ onBoot }) {
  const [visible, setVisible] = useState(true);
  const [logoOpacity, setLogoOpacity] = useState(0);
  const [foodOpacity, setFoodOpacity] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  const [style, setStyle] = useState({});

  useEffect(() => {
    const t1 = setTimeout(() => {
      setLogoOpacity(1);
      setFoodOpacity(1);
    }, 150);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 18 + 4;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setBarWidth(100);
        setTimeout(() => {
          setStyle({ transition: 'opacity .6s ease,transform .6s ease', opacity: 0, transform: 'translateY(-20px)' });
          setTimeout(() => {
            setVisible(false);
            boot();
            onBoot();
          }, 600);
        }, 280);
      } else {
        setBarWidth(p);
      }
    }, 55);
    return () => { clearTimeout(t1); clearInterval(interval); };
  }, [onBoot]);

  if (!visible) return null;

  return (
    <div id="loader" style={style}>
      <div className="loader-food-wrap" style={{ opacity: foodOpacity }}>
        <img src={LOADER_FOOD_IMAGE} alt="" className="loader-food-img" />
      </div>
      <div id="loader-logo" style={{ opacity: logoOpacity }}>HOT<span>SI</span></div>
      <div id="loader-bar-wrap"><div id="loader-bar" style={{ width: `${barWidth}%` }} /></div>
      <div id="loader-text">Loading The Experience</div>
    </div>
  );
}
