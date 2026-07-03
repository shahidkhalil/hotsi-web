export default function Hero() {
  return (
    <section id="hero">
      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />
      <div className="hero-blob hero-blob-3" />
      <canvas id="hero-particles" />
      <div className="hero-inner">
        <div>
          <div className="hero-label">Now Open in Your City</div>
          <h1 className="hero-title">
            <div className="line"><span>MORE</span></div>
            <div className="line"><span>THAN</span></div>
            <div className="line"><span className="accent">FAST FOOD.</span></div>
          </h1>
          <p className="hero-sub">
            <strong>Premium Burgers,</strong> Authentic Shawarma,<br />
            <strong>Loaded Fries,</strong> Wood Fired Pizza,<br />
            <strong>Fresh Sandwiches.</strong>
          </p>
          <div className="hero-btns">
            <a href="#bestsellers" className="hero-btn-main rp">&#x1F6D2; Order Now</a>
            <a href="#bestsellers" className="hero-btn-secondary">View Menu &#x2192;</a>
          </div>
          <div className="hero-stats">
            <div><div className="hero-stat-num">50K+</div><div className="hero-stat-label">Happy Customers</div></div>
            <div><div className="hero-stat-num">4.9&#9733;</div><div className="hero-stat-label">Average Rating</div></div>
            <div><div className="hero-stat-num">25 Min</div><div className="hero-stat-label">Avg Delivery</div></div>
          </div>
        </div>
        <div className="hero-visual">
          <canvas id="hero-canvas" />
          <div className="steam"><div className="sp" /><div className="sp" /><div className="sp" /></div>
          <div className="hero-float fries">&#x1F35F;</div>
          <div className="hero-float drink">&#x1F964;</div>
        </div>
      </div>
      <div className="scroll-ind"><div className="scroll-line" /><span>Scroll</span></div>
    </section>
  );
}
