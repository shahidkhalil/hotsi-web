import { useSiteSettings } from '../context/SiteSettingsContext';
import { DEALS_IMAGES } from '../utils/visualAssets';

const DEALS = [
  { badge: 'Best Value', emoji: '🍔', name: 'Double Smash Combo', desc: '2x Classic Burgers + Loaded Fries + 2 Drinks', old: 'PKR 9,800', price: 'PKR 6,900', cd: 'cd1', delay: '', image: DEALS_IMAGES[0] },
  { badge: 'Fan Fav', emoji: '🌯', name: 'Shawarma Family Pack', desc: '4x Shawarma Wraps + Hummus + Soft Drinks', old: 'PKR 14,500', price: 'PKR 10,900', cd: 'cd2', delay: 'd1', image: DEALS_IMAGES[1] },
  { badge: 'New Deal', emoji: '🍕', name: 'Pizza Night Bundle', desc: '2x Large Pizzas + Garlic Knots + 4 Drinks', old: 'PKR 17,200', price: 'PKR 13,700', cd: 'cd3', delay: 'd2', image: DEALS_IMAGES[2] },
];

export default function Deals() {
  const { isCategoryVisible } = useSiteSettings();
  if (!isCategoryVisible('deals')) return null;

  return (
    <section id="deals" className="section-divider-top">
      <div className="wrap">
        <div className="deals-hdr fu">
          <div className="sl">Limited Time</div>
          <h2 className="st">Today&apos;s Special Deals</h2>
          <p className="sd">Order before time runs out and save big on our premium combos.</p>
        </div>
        <div className="deals-grid">
          {DEALS.map((d) => (
            <div key={d.name} className={`dc fu ${d.delay}`}>
              <div className="drb">{d.badge}</div>
              <div className="di">
                <img
                  className="di-photo"
                  src={`https://loremflickr.com/680/400/${encodeURIComponent(d.image.kw)}?lock=${d.image.seed}`}
                  alt={d.name}
                  loading="lazy"
                />
                <div className="ddb">30<span>% OFF</span></div>
              </div>
              <div className="db">
                <div className="dn">{d.name}</div>
                <div className="dd">{d.desc}</div>
                <div className="df">
                  <div className="dpr">
                    <span className="dpo">{d.old}</span>
                    <span className="dpn">{d.price}</span>
                  </div>
                  <div className="cd" id={d.cd} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
