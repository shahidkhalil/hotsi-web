import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { getCategoryBg } from '../utils/visualAssets';

export default function Categories() {
  const { activeCatCard, setActiveCatCard, scrollToMenu } = useApp();
  const { visibleCatCards } = useSiteSettings();

  const cards = visibleCatCards;

  useEffect(() => {
    if (cards.length > 0 && !cards.some((c) => c.id === activeCatCard)) {
      setActiveCatCard(cards[0].id);
    }
  }, [cards, activeCatCard, setActiveCatCard]);

  if (cards.length === 0) return null;

  return (
    <section id="categories" className="section-divider-top">
      <div className="wrap">
        <div className="cat-head fu">
          <div className="sl">Explore</div>
          <h2 className="st">What Are You Craving?</h2>
        </div>
        <div className="cat-grid fu d1">
          {cards.map((c) => (
            <div
              key={c.id}
              className={`cat-card${activeCatCard === c.id ? ' active' : ''}`}
              onClick={() => { setActiveCatCard(c.id); scrollToMenu(c.id); }}
            >
              <div
                className="cat-card-bg"
                style={{ backgroundImage: `url(${getCategoryBg(c.id)})` }}
                aria-hidden
              />
              <span className="ce">{c.emoji}</span>
              <span className="cn">{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
