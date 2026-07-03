export default function Delivery() {
  return (
    <section id="delivery">
      <div className="wrap">
        <div className="del-in">
          <div className="del-text fu">
            <div className="sl" style={{ color: 'rgba(255,200,87,.9)' }}>Fast &amp; Fresh</div>
            <h2 className="st">Delivered To<br /><span style={{ color: 'var(--primary)' }}>Your Door</span></h2>
            <p className="sd">Wherever you are in the city, HOTSI reaches you in under 30 minutes. Hot, fresh, and exactly as you ordered.</p>
            <div className="del-apps">
              <a href="#" className="da"><span>&#x1F6F5;</span><span>Order Direct</span></a>
              <a href="#" className="da"><span>&#x1F4F1;</span><span>HOTSI App</span></a>
              <a href="#" className="da"><span>&#x1F697;</span><span>Uber Eats</span></a>
            </div>
          </div>
          <div className="del-map fu d2">
            <span>&#x1F4CD;</span>
            <p>Plot 505, Karim Block, Allama Iqbal Town, Lahore &#x2014; Open Daily, Closes 4 AM</p>
          </div>
        </div>
      </div>
    </section>
  );
}
