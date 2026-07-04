import { useSiteSettings } from '../context/SiteSettingsContext';
import { MAPS_URL } from '../utils/visualAssets';
import { DEFAULT_SETTINGS } from '../utils/siteSettings';

export default function Delivery() {
  const { settings } = useSiteSettings();
  const phone = settings.phone || DEFAULT_SETTINGS.phone;
  const address = settings.address || DEFAULT_SETTINGS.address;
  const hours = settings.hours || DEFAULT_SETTINGS.hours;

  return (
    <section id="delivery" className="section-divider-top">
      <div className="wrap">
        <div className="del-in">
          <div className="del-text fu">
            <div className="sl" style={{ color: 'rgba(255,200,87,.9)' }}>Fast &amp; Fresh</div>
            <h2 className="st">Delivered To<br /><span style={{ color: 'var(--primary)' }}>Your Door</span></h2>
            <p className="sd">Wherever you are in the city, HOTSI reaches you in under 30 minutes. Hot, fresh, and exactly as you ordered.</p>
            <div className="del-apps">
              <a href="#menu-section" className="da"><span>&#x1F6F5;</span><span>Order Direct</span></a>
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="da"><span>&#x1F4DE;</span><span>{phone}</span></a>
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="da"><span>&#x1F697;</span><span>Get Directions</span></a>
            </div>
          </div>
          <div className="del-map fu d2">
            <div className="del-map-card">
              <div className="del-map-pin">&#x1F4CD;</div>
              <h3 className="del-map-title">Visit HOTSI</h3>
              <p className="del-map-address">{address}</p>
              <p className="del-map-hours">{hours}</p>
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="del-map-btn">
                Open in Maps &#x2197;
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
