import { useState } from 'react';
import { useSiteSettings } from '../context/SiteSettingsContext';

const INGREDIENTS = [
  { emoji: '🧀', name: 'Buffalo Mozzarella', desc: 'Imported from Naples' },
  { emoji: '🍅', name: 'San Marzano Tomatoes', desc: 'DOP Certified' },
  { emoji: '🌿', name: 'Fresh Basil', desc: 'Garden grown' },
  { emoji: '🫒', name: 'Extra Virgin Olive Oil', desc: 'First cold press' },
];

export default function Pizza() {
  const { isCategoryVisible } = useSiteSettings();
  const [activeIng, setActiveIng] = useState(0);

  if (!isCategoryVisible('pizza')) return null;

  const spinPiz = (d) => {
    d.style.animationDuration = '1.5s';
    setTimeout(() => { d.style.animationDuration = '30s'; }, 1500);
  };

  return (
    <section id="pizza">
      <div className="pz-glow" />
      <div className="wrap">
        <div className="pz-in">
          <div className="pz-text fu">
            <div className="sl">Signature</div>
            <h2 className="st">The Pizza<br /><span style={{ color: 'var(--primary)' }}>Experience</span></h2>
            <p className="sd">Every pizza crafted with imported ingredients, wood-fired at 480&#176;C for that perfect leopard char.</p>
            <div className="pz-ings">
              {INGREDIENTS.map((ing, i) => (
                <div
                  key={ing.name}
                  className={`ing${activeIng === i ? ' active' : ''}`}
                  onClick={() => setActiveIng(i)}
                >
                  <div className="id" />
                  <span className="in">{ing.emoji} {ing.name}</span>
                  <span className="idc">{ing.desc}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pz-vis fu d2">
            <div className="pz-ring pz-ring-1" />
            <div className="pz-ring pz-ring-2" />
            <div className="pz-ring pz-ring-3" />
            <div className="pz-disc" onClick={(e) => spinPiz(e.currentTarget)} />
          </div>
        </div>
      </div>
    </section>
  );
}
