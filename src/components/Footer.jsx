import { useApp } from '../context/AppContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { DEFAULT_SETTINGS } from '../utils/siteSettings';
import { IconFacebook, IconInstagram, IconTikTok } from './SocialIcons';

const FOOTER_MENU = [
  { label: 'Burgers', cat: 'burgers' },
  { label: 'Shawarma', cat: 'shawarma' },
  { label: 'Pizza', cat: 'pizza' },
  { label: 'Fries & Sides', cat: 'fries' },
  { label: 'Sandwiches', cat: 'sandwiches' },
  { label: 'Deals', cat: 'deals' },
];

export default function Footer() {
  const { scrollToMenu } = useApp();
  const { settings, isCategoryVisible } = useSiteSettings();

  const phone = settings.phone || DEFAULT_SETTINGS.phone;
  const whatsapp = (settings.whatsapp || DEFAULT_SETTINGS.whatsapp).replace(/\D/g, '');
  const address = settings.address || DEFAULT_SETTINGS.address;
  const hours = settings.hours || DEFAULT_SETTINGS.hours;
  const waHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Hi HOTSI!')}`;

  const visibleMenu = FOOTER_MENU.filter((item) => isCategoryVisible(item.cat));

  const goToCategory = (e, catId) => {
    e.preventDefault();
    scrollToMenu(catId);
  };

  return (
    <footer>
      <div className="wrap">
        <div className="f-top">
          <div>
            <div className="f-logo">HOT<span>SI</span></div>
            <p className="f-tag">More Than Fast Food.<br />It&apos;s The HOTSI Experience.</p>
            <div className="f-contact">
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="f-contact-row">
                <span className="f-contact-ico">&#x1F4DE;</span>
                <span>{phone}</span>
              </a>
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="f-contact-row f-contact-wa">
                <span className="f-contact-ico">&#x1F4AC;</span>
                <span>WhatsApp Us</span>
              </a>
              <p className="f-contact-row f-contact-text">
                <span className="f-contact-ico">&#x1F4CD;</span>
                <span>{address}</span>
              </p>
              <p className="f-contact-row f-contact-text">
                <span className="f-contact-ico">&#x1F552;</span>
                <span>{hours}</span>
              </p>
            </div>
            <div className="f-nl">
              <div className="nl-lbl">Get Exclusive Deals</div>
              <div className="nl-form"><input type="email" className="nl-inp" placeholder="your@email.com" /><button type="button" className="nl-btn">&#x2192;</button></div>
            </div>
          </div>
          <div>
            <div className="f-hd">Menu</div>
            <ul className="f-lnks">
              {visibleMenu.map((item) => (
                <li key={item.cat}>
                  <a href="#menu-section" onClick={(e) => goToCategory(e, item.cat)}>
                    &#x2192; {item.label}
                  </a>
                </li>
              ))}
              <li><a href="#menu-section">&#x2192; Full Menu</a></li>
            </ul>
          </div>
          <div>
            <div className="f-hd">Company</div>
            <ul className="f-lnks">
              <li><a href="#story">&#x2192; Our Story</a></li>
              <li><a href="#gallery">&#x2192; Gallery</a></li>
              <li><a href="#reviews">&#x2192; Reviews</a></li>
              <li><a href="#why">&#x2192; Why HOTSI</a></li>
            </ul>
          </div>
          <div>
            <div className="f-hd">Support</div>
            <ul className="f-lnks">
              <li><a href="#menu-section">&#x2192; Order Now</a></li>
              <li><a href="#delivery">&#x2192; Delivery</a></li>
              <li><a href={waHref} target="_blank" rel="noopener noreferrer">&#x2192; Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="f-bot">
          <div className="f-copy">&#169; 2026 HOTSI. All rights reserved. Crafted with &#x2764;&#xFE0F;</div>
          <div className="f-soc">
            <a href="#" className="si" aria-label="Instagram"><IconInstagram /></a>
            <a href="#" className="si" aria-label="Facebook"><IconFacebook /></a>
            <a href="#" className="si" aria-label="TikTok"><IconTikTok /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
