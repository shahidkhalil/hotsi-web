const ITEMS = [
  { emoji: '🍔', label: 'Classic Burger' },
  { emoji: '🍕', label: 'Wood Fired Pizza' },
  { emoji: '🌯', label: 'Garlic Shawarma' },
  { emoji: '🍟', label: 'Truffle Fries' },
  { emoji: '🥤', label: 'Signature Drinks' },
  { emoji: '🍰', label: 'Lava Cake' },
  { emoji: '🥪', label: 'Club Supreme' },
  { emoji: '🥡', label: "Chef's Special" },
  { emoji: '🍦', label: 'Sweet Endings' },
  { emoji: '🥗', label: 'Fresh Salads' },
  { emoji: '🍽️', label: 'HOTSI Bowl' },
  { emoji: '🍗', label: 'Crispy Chicken' },
];

export default function Gallery() {
  return (
    <section id="gallery">
      <div className="wrap">
        <div className="gal-hdr fu">
          <div className="sl">Visual Feast</div>
          <h2 className="st">The HOTSI Gallery</h2>
        </div>
        <div className="masonry fu d1">
          {ITEMS.map((item) => (
            <div className="mi" key={item.label}>
              <div className="gp"><span>{item.emoji}</span></div>
              <div className="go"><span>{item.label}</span></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
