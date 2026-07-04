import { useState, useEffect } from 'react';
import { GALLERY_ITEMS, getGalleryPhoto } from '../utils/visualAssets';

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightbox]);

  return (
    <section id="gallery" className="section-divider-top">
      <div className="wrap">
        <div className="gal-hdr fu">
          <div className="sl">Visual Feast</div>
          <h2 className="st">The HOTSI Gallery</h2>
        </div>
        <div className="masonry fu d1">
          {GALLERY_ITEMS.map((item) => (
            <div
              className={`mi gal-${item.aspect}`}
              key={item.label}
              onClick={() => setLightbox(item)}
              onKeyDown={(e) => e.key === 'Enter' && setLightbox(item)}
              role="button"
              tabIndex={0}
            >
              <div className="gp">
                <img
                  src={getGalleryPhoto(item)}
                  alt={item.label}
                  className="gal-photo"
                  loading="lazy"
                />
              </div>
              <div className="go"><span>{item.label}</span></div>
            </div>
          ))}
        </div>
      </div>

      {lightbox && (
        <div
          className="gal-lightbox open"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.label}
        >
          <button type="button" className="gal-lightbox-close" onClick={() => setLightbox(null)} aria-label="Close">
            &#x2715;
          </button>
          <img src={getGalleryPhoto(lightbox)} alt={lightbox.label} className="gal-lightbox-img" onClick={(e) => e.stopPropagation()} />
          <p className="gal-lightbox-caption">{lightbox.label}</p>
        </div>
      )}
    </section>
  );
}
