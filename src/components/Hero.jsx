import { useEffect } from 'react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { clearHeroInlineStyles } from '../utils/animations';
import { HERO_FOOD_IMAGE } from '../utils/visualAssets';

const STATS = [
  { num: '50K+', label: 'Happy Customers' },
  { num: '4.9★', label: 'Average Rating' },
  { num: '25 Min', label: 'Avg Delivery' },
];

const HERO_STRIP = [
  { id: 'burgers', label: '🍔 Burgers' },
  { id: 'shawarma', label: '🌯 Shawarma' },
  { id: 'fries', label: '🍟 Fries' },
  { id: 'pizza', label: '🍕 Pizza' },
  { id: 'sandwiches', label: '🥪 Sandwiches' },
];

export default function Hero() {
  const { isCategoryVisible } = useSiteSettings();
  const stripItems = HERO_STRIP.filter((item) => isCategoryVisible(item.id));

  useEffect(() => {
    clearHeroInlineStyles();
    const t = setTimeout(clearHeroInlineStyles, 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section id="hero">
      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />
      <div className="hero-blob hero-blob-3" />
      <canvas id="hero-particles" />
      <div className="hero-inner">
        <div className="hero-copy">
          <div className="hero-label">
            <span className="hero-label-pulse" aria-hidden />
            <span className="hero-label-text">Now Open in Your City</span>
          </div>

          <h1 className="hero-title">
            <div className="line"><span>MORE THAN</span></div>
            <div className="line">
              <span className="hero-title-accent">FAST FOOD.</span>
            </div>
          </h1>

          <p className="hero-tagline">
            Flame-grilled perfection — bold flavours, fresh ingredients, delivered hot.
          </p>

          {stripItems.length > 0 && (
            <div className="hero-menu-strip">
              {stripItems.map((item, i) => (
                <span key={item.id} style={{ display: 'contents' }}>
                  {i > 0 && <span className="hero-strip-dot">·</span>}
                  <span>{item.label}</span>
                </span>
              ))}
            </div>
          )}

          <div className="hero-btns">
            <a href="#menu-section" className="hero-btn-main rp">
              <span className="hero-btn-icon">🛒</span>
              Order Now
              <span className="hero-btn-arrow">→</span>
            </a>
            <a href="#categories" className="hero-btn-secondary">
              View Menu
              <span className="hero-btn-arrow">→</span>
            </a>
          </div>

          <div className="hero-stats">
            {STATS.map((stat) => (
              <div key={stat.label} className="hero-stat-card">
                <div className="hero-stat-num">{stat.num}</div>
                <div className="hero-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <canvas id="hero-canvas" />
          <div className="steam"><div className="sp" /><div className="sp" /><div className="sp" /></div>
          <div className="hero-float fries">&#x1F35F;</div>
          <div className="hero-float drink">&#x1F964;</div>
        </div>

        <div className="hero-mobile-food">
          <img src={HERO_FOOD_IMAGE} alt="HOTSI premium platter" loading="eager" />
        </div>
      </div>
      <div className="scroll-ind"><div className="scroll-line" /><span>Scroll</span></div>
    </section>
  );
}
