import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CAT_CARDS } from '../data/menuData';

export default function Categories() {
  const { activeCatCard, setActiveCatCard, scrollToMenu } = useApp();

  return (
    <section id="categories">
      <div className="wrap">
        <div className="cat-head fu">
          <div className="sl">Explore</div>
          <h2 className="st">What Are You Craving?</h2>
        </div>
        <div className="cat-grid fu d1">
          {CAT_CARDS.map((c) => (
            <div
              key={c.id}
              className={`cat-card${activeCatCard === c.id ? ' active' : ''}`}
              onClick={() => { setActiveCatCard(c.id); scrollToMenu(c.id); }}
            >
              <span className="ce">{c.emoji}</span>
              <span className="cn">{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
