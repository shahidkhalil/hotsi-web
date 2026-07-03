export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="f-top">
          <div>
            <div className="f-logo">HOT<span>SI</span></div>
            <p className="f-tag">More Than Fast Food.<br />It&apos;s The HOTSI Experience.</p>
            <div className="f-nl">
              <div className="nl-lbl">Get Exclusive Deals</div>
              <div className="nl-form"><input type="email" className="nl-inp" placeholder="your@email.com" /><button type="button" className="nl-btn">&#x2192;</button></div>
            </div>
          </div>
          <div>
            <div className="f-hd">Menu</div>
            <ul className="f-lnks">
              <li><a href="#">&#x2192; Burgers</a></li>
              <li><a href="#">&#x2192; Shawarma</a></li>
              <li><a href="#">&#x2192; Pizza</a></li>
              <li><a href="#">&#x2192; Fries &amp; Sides</a></li>
              <li><a href="#">&#x2192; Drinks</a></li>
              <li><a href="#">&#x2192; Desserts</a></li>
            </ul>
          </div>
          <div>
            <div className="f-hd">Company</div>
            <ul className="f-lnks">
              <li><a href="#">&#x2192; Our Story</a></li>
              <li><a href="#">&#x2192; Careers</a></li>
              <li><a href="#">&#x2192; Press</a></li>
              <li><a href="#">&#x2192; Partners</a></li>
              <li><a href="#">&#x2192; Franchise</a></li>
            </ul>
          </div>
          <div>
            <div className="f-hd">Support</div>
            <ul className="f-lnks">
              <li><a href="#">&#x2192; Track Order</a></li>
              <li><a href="#">&#x2192; FAQs</a></li>
              <li><a href="#delivery">&#x2192; Delivery</a></li>
              <li><a href="#">&#x2192; Privacy</a></li>
              <li><a href="#">&#x2192; Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="f-bot">
          <div className="f-copy">&#169; 2026 HOTSI. All rights reserved. Crafted with &#x2764;&#xFE0F;</div>
          <div className="f-soc">
            <a href="#" className="si">&#x1F4F8;</a>
            <a href="#" className="si">&#x1F426;</a>
            <a href="#" className="si">&#x25B6;&#xFE0F;</a>
            <a href="#" className="si">&#x1F4D8;</a>
            <a href="#" className="si">&#x1F4BC;</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
