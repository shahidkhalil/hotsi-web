import { IconGoogle } from './SocialIcons';

const REVIEWS = [
  { av: '😍', name: 'Sarah M.', date: '2 days ago', text: '"The HOTSI Classic Burger is unlike anything I\'ve had. The smash patty is perfectly crispy and the sauce is addictive. I order twice a week now!"' },
  { av: '🙌', name: 'Omar K.', date: '1 week ago', text: '"Best shawarma in town, no competition. The garlic toum is 10/10. Delivery was exactly 22 minutes. HOTSI never disappoints!"' },
  { av: '🔥', name: 'Jessica L.', date: '3 days ago', text: '"Ordered the truffle fries and the lava cake. Both absolutely incredible. Premium food at surprisingly fair prices. 10/10!"' },
  { av: '👏', name: 'Ahmed R.', date: '5 days ago', text: '"The wood-fired pizza is next level. You can taste the quality of each ingredient. HOTSI is setting the standard for fast food."' },
  { av: '⭐', name: 'Priya S.', date: '1 week ago', text: '"Ordered for a family gathering. The shawarma pack was a massive hit. Everyone was asking where the food was from!"' },
  { av: '😋', name: 'Carlos M.', date: '4 days ago', text: '"HOTSI is the best thing that happened to fast food. Premium quality, fast delivery, smooth experience. My family is obsessed."' },
];

export default function Reviews() {
  return (
    <section id="reviews" className="section-divider-top">
      <div className="wrap">
        <div className="rev-hdr fu">
          <div className="sl" style={{ justifyContent: 'center' }}>Testimonials</div>
          <h2 className="st">What People Say</h2>
          <div className="rev-avg">
            <div className="ra-num">4.9</div>
            <div>
              <div className="ra-stars">&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;</div>
              <div className="ra-count">Based on 2,847 reviews</div>
            </div>
          </div>
        </div>
        <div className="swiper reviewsSwiper fu d1">
          <div className="swiper-wrapper">
            {REVIEWS.map((r) => (
              <div className="swiper-slide" key={r.name}>
                <div className="rc">
                  <div className="r-hdr">
                    <div className="r-av">{r.av}</div>
                    <div>
                      <div className="r-name">{r.name}</div>
                      <div className="r-date">{r.date}</div>
                    </div>
                    <div className="r-stars">&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;</div>
                    <div className="r-google" title="Google Review">
                      <IconGoogle />
                      <span>Google</span>
                    </div>
                  </div>
                  <p className="r-text">{r.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="swiper-pagination" />
        </div>
      </div>
    </section>
  );
}
