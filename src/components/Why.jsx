const ITEMS = [
  { emoji: '🌱', title: 'Fresh Ingredients', desc: 'Every ingredient sourced daily from premium local farms and international suppliers. Zero compromise.', delay: '' },
  { emoji: '⚡', title: 'Fast Delivery', desc: 'Average 25-minute delivery. Real-time GPS tracking. Hot food at your door, guaranteed.', delay: 'd1' },
  { emoji: '💎', title: 'Premium Quality', desc: 'Michelin-trained culinary standards applied to every item on our menu. No exceptions.', delay: 'd2' },
  { emoji: '👨‍🍳', title: 'Expert Chefs', desc: '50+ combined years of professional culinary experience brought to your plate.', delay: 'd3' },
];

export default function Why() {
  return (
    <section id="why">
      <div className="why-tl" />
      <div className="wrap">
        <div className="why-hdr fu">
          <div className="sl" style={{ justifyContent: 'center' }}>Why Us</div>
          <h2 className="st">Why Choose HOTSI?</h2>
          <p className="sd">We don&apos;t just make food. We craft experiences that keep you coming back.</p>
        </div>
        <div className="why-grid">
          {ITEMS.map((item) => (
            <div key={item.title} className={`wc fu ${item.delay}`}>
              <span className="wi">{item.emoji}</span>
              <div className="wt">{item.title}</div>
              <p className="wd">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
