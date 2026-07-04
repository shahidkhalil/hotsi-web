import { STORY_IMAGES } from '../utils/visualAssets';

export default function Story() {
  return (
    <section id="story" className="section-divider-top">
      <div className="wrap">
        <div className="story-in">
          <div className="s-vis fu">
            <div className="s-main">
              <img src={STORY_IMAGES.dish} alt="HOTSI signature dish" className="s-photo" loading="lazy" />
            </div>
            <div className="s-acc">
              <img src={STORY_IMAGES.kitchen} alt="HOTSI kitchen" className="s-photo" loading="lazy" />
            </div>
            <div className="s-badge">
              <div className="s-num">8+</div>
              <div className="s-txt"><strong>Years</strong>of crafting premium fast food</div>
            </div>
          </div>
          <div className="s-text fu d2">
            <div className="sl">About Us</div>
            <h2 className="st">Our Story<br /><span style={{ color: 'var(--primary)' }}>Is Your Story</span></h2>
            <p className="sd">HOTSI was born from a simple belief &#x2014; fast food should never mean cheap food. Founded in 2016, we set out to redefine what quick-service dining could feel like.</p>
            <p className="sd" style={{ marginTop: '16px' }}>From a single kitchen with five menu items, we&apos;ve grown to a beloved brand serving thousands daily &#x2014; while keeping the same obsession over every ingredient, every bite.</p>
            <div className="sq">
              <p>&quot;We believe every person deserves food that makes them feel something. That&apos;s not just our mission &#x2014; it&apos;s our standard.&quot;</p>
              <cite>&#x2014; Founder, HOTSI</cite>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
