import { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { loadSpinReward, saveSpinReward, SPIN_PRIZES } from '../utils/spinReward';

const ALL_FOODS = [
  { id: 'pizza', emoji: '🍕', name: 'Pizza' },
  { id: 'burgers', emoji: '🍔', name: 'Burger' },
  { id: 'shawarma', emoji: '🌯', name: 'Shawarma' },
  { id: 'fries', emoji: '🍟', name: 'Fries' },
  { id: 'chicken', emoji: '🍗', name: 'Chicken' },
  { id: 'sandwiches', emoji: '🥪', name: 'Sandwich' },
  { id: 'wraps', emoji: '🌮', name: 'Wraps' },
];

const CONFETTI_COLORS = ['#FF6B35', '#FFC857', '#16A34A', '#FF8C60', '#FFD580', '#22c55e', '#ff4500'];

function SpinWheel({ foods, wheelRef }) {
  const N = foods.length;
  const SEG_DEG = 360 / N;
  const R = 148;
  const SIZE = 320;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const SEG_COLORS = ['#7A2800', '#9A6600', '#6B2200', '#8B5500', '#5C1F00', '#A07800', '#6B3000'];

  return (
    <div ref={wheelRef} className="so-wheel" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ display: 'block' }}>
        <circle cx={CX} cy={CY} r={R + 8} fill="none" stroke="rgba(255,107,53,0.08)" strokeWidth="16" />
        <circle cx={CX} cy={CY} r={R + 3} fill="none" stroke="rgba(255,107,53,0.45)" strokeWidth="2.5" />

        {foods.map((food, i) => {
          const startDeg = -90 + i * SEG_DEG;
          const endDeg = startDeg + SEG_DEG;
          const sRad = (startDeg * Math.PI) / 180;
          const eRad = (endDeg * Math.PI) / 180;
          const x1 = CX + R * Math.cos(sRad);
          const y1 = CY + R * Math.sin(sRad);
          const x2 = CX + R * Math.cos(eRad);
          const y2 = CY + R * Math.sin(eRad);
          const cDeg = startDeg + SEG_DEG / 2;

          return (
            <g key={food.id}>
              <path
                d={`M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`}
                fill={SEG_COLORS[i % SEG_COLORS.length]}
                stroke="rgba(0,0,0,0.45)"
                strokeWidth="1.5"
              />
              <g transform={`translate(${CX},${CY}) rotate(${cDeg})`}>
                <text x={R * 0.62} y={-10} textAnchor="middle" dominantBaseline="middle" fontSize="20">{food.emoji}</text>
                <text
                  x={R * 0.62}
                  y={9}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgba(255,255,255,0.88)"
                  fontSize="10"
                  fontWeight="700"
                  fontFamily="Inter,sans-serif"
                  letterSpacing="0.8"
                >
                  {food.name.toUpperCase()}
                </text>
              </g>
            </g>
          );
        })}

        <circle cx={CX} cy={CY} r={34} fill="#0A0A0A" />
        <circle cx={CX} cy={CY} r={34} fill="none" stroke="#FF6B35" strokeWidth="3" />
        <circle cx={CX} cy={CY} r={5} fill="#FF6B35" />
      </svg>
    </div>
  );
}

export default function SpinnerOffer() {
  const { scrollToMenu, setActiveSpinReward, spinReward } = useApp();
  const { spinnerOfferEnabled, loaded: settingsLoaded, isCategoryVisible } = useSiteSettings();

  const foods = useMemo(() => {
    const visible = ALL_FOODS.filter((f) => isCategoryVisible(f.id));
    // Keep spinner usable even if many categories are hidden in admin
    return visible.length > 0 ? visible : ALL_FOODS;
  }, [isCategoryVisible]);

  const N = foods.length;
  const SEG_DEG = N > 0 ? 360 / N : 360;

  const offerActive = !settingsLoaded || spinnerOfferEnabled !== false;

  const savedReward = offerActive ? loadSpinReward() : null;
  const alreadySpun = offerActive && Boolean(savedReward || spinReward);

  const [selectedPrize, setSelectedPrize] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(() => {
    const r = savedReward || spinReward;
    if (!r) return null;
    const prize = SPIN_PRIZES.find((p) => p.key === r.prizeKey);
    const food = ALL_FOODS.find((f) => f.id === r.foodId);
    if (!prize || !food) return null;
    return { food, prize };
  });
  const [visible, setVisible] = useState(false);

  const rotRef = useRef(0);
  const wheelRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const reveal = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) setVisible(true);
    };
    reveal();
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.05 });
    obs.observe(el);
    window.addEventListener('scroll', reveal, { passive: true });
    return () => {
      obs.disconnect();
      window.removeEventListener('scroll', reveal);
    };
  }, []);

  useEffect(() => {
    if (!offerActive) {
      setResult(null);
      setSelectedPrize(null);
    }
  }, [offerActive]);

  if (settingsLoaded && !spinnerOfferEnabled) return null;

  const displayFoods = foods.length > 0 ? foods : ALL_FOODS;
  const wheelCount = displayFoods.length;
  const wheelSegDeg = wheelCount > 0 ? 360 / wheelCount : 360;

  const handleSelectPrize = (i) => {
    if (alreadySpun || spinning || result) return;
    setSelectedPrize(i);
  };

  const handleSpin = () => {
    if (spinning || result || alreadySpun || selectedPrize === null || wheelCount === 0) return;

    setSpinning(true);
    const foodIdx = Math.floor(Math.random() * wheelCount);
    const prize = SPIN_PRIZES[selectedPrize];
    const food = displayFoods[foodIdx];

    const targetAngle = 360 - (foodIdx * wheelSegDeg + wheelSegDeg / 2);
    const currentMod = ((rotRef.current % 360) + 360) % 360;
    let delta = targetAngle - currentMod;
    if (delta <= 0) delta += 360;
    const newRot = rotRef.current + delta + 360 * 7;
    rotRef.current = newRot;

    if (wheelRef.current) {
      wheelRef.current.style.transition = 'transform 5.5s cubic-bezier(0.17,0.67,0.12,0.99)';
      wheelRef.current.style.transform = `rotate(${newRot}deg)`;
    }

    setTimeout(() => {
      setSpinning(false);
      const reward = {
        prizeKey: prize.key,
        prizeLabel: prize.label,
        foodId: food.id,
        foodName: food.name,
        freeItemUsed: false,
      };
      saveSpinReward(reward);
      setActiveSpinReward(reward);
      setResult({ food, prize });
    }, 5600);
  };

  const handleClaimOrder = () => {
    if (!result) return;
    scrollToMenu(result.food.id);
  };

  const step = result ? 3 : selectedPrize !== null ? 2 : 1;

  return (
    <section id="spinner-offer" ref={sectionRef}>
      <div className="so-glow so-glow-a" />
      <div className="so-glow so-glow-b" />
      <div className="so-glow so-glow-c" />

      <div className="wrap">
        <div className={`so-head fu${visible ? ' vis' : ''}`}>
          <div className="sl">Special Offer</div>
          <h2 className="st so-title">
            Spin &amp; <span style={{ color: 'var(--primary)' }}>Win!</span>
          </h2>
          <p className="sd so-subtitle">
            {alreadySpun && result
              ? 'You already used your one spin — claim your reward below!'
              : 'Step 1: Pick your reward · Step 2: Spin once · Step 3: Order with your discount'}
          </p>
          <div className="so-steps">
            <span className={`so-step${step >= 1 ? ' done' : ''}`}>1. Choose reward</span>
            <span className={`so-step${step >= 2 ? ' done' : ''}`}>2. Spin wheel</span>
            <span className={`so-step${step >= 3 ? ' done' : ''}`}>3. Order &amp; save</span>
          </div>
        </div>

        <div className={`so-prizes fu${visible ? ' vis' : ''}`} style={{ transitionDelay: '.15s' }}>
          {SPIN_PRIZES.map((prize, i) => (
            <div
              key={prize.key}
              className={`so-prize${selectedPrize === i && !result ? ' selected' : ''}${result && result.prize.key === prize.key ? ' active' : ''}${alreadySpun && !result ? ' locked' : ''}`}
              style={{ '--pc': prize.color }}
              onClick={() => handleSelectPrize(i)}
              role="button"
              tabIndex={alreadySpun ? -1 : 0}
              onKeyDown={(e) => e.key === 'Enter' && handleSelectPrize(i)}
            >
              <div className="so-prize-shine" />
              {selectedPrize === i && !result && <div className="so-selected-badge">SELECTED</div>}
              <div className="so-prize-icon">{prize.icon}</div>
              <div className="so-prize-label">{prize.label}</div>
              <div className="so-prize-desc">{prize.desc}</div>
              {result && result.prize.key === prize.key && (
                <div className="so-won-badge">YOUR REWARD</div>
              )}
            </div>
          ))}
        </div>

        <div className={`so-center fu${visible ? ' vis' : ''}`} style={{ transitionDelay: '.3s' }}>
          <div className="so-food-chips">
            {displayFoods.map((food) => (
              <span key={food.id} className="so-chip">
                {food.emoji} {food.name}
              </span>
            ))}
          </div>
          <div className="so-wheel-wrap">
            <div className="so-ring so-ring-1" />
            <div className="so-ring so-ring-2" />
            <div className="so-ptr" />
            <SpinWheel foods={displayFoods} wheelRef={wheelRef} />
          </div>

          <div className="so-controls">
            {!result ? (
              <>
                <button
                  type="button"
                  className={`so-spin-btn so-spin-glow${spinning ? ' so-spinning' : ''}`}
                  onClick={handleSpin}
                  disabled={spinning || selectedPrize === null || alreadySpun}
                >
                  {spinning ? (
                    <span className="so-btn-dots"><span /><span /><span />Spinning…</span>
                  ) : selectedPrize === null ? '🎁  Select a reward first' : '🎰  SPIN NOW (one time only)'}
                </button>
                {!spinning && selectedPrize === null && (
                  <p className="so-hint">Tap Get One Free, 10% Off, or 20% Off above — then spin</p>
                )}
                {!spinning && selectedPrize !== null && (
                  <p className="so-hint">One spin per device — choose wisely!</p>
                )}
              </>
            ) : (
              <p className="so-hint so-hint-done">✓ Spin used — discount active when you order {result.food.name}</p>
            )}
          </div>
        </div>

        {result && (
          <div className="so-result so-result-celebrate">
            <div className="so-confetti" aria-hidden>
              {[...CONFETTI_COLORS, ...CONFETTI_COLORS].map((c, i) => (
                <span
                  key={i}
                  className="so-conf-dot"
                  style={{
                    '--cc': c,
                    '--cx': `${5 + (i / (CONFETTI_COLORS.length * 2)) * 90}%`,
                    '--cd': `${i * 0.05}s`,
                    '--cr': `${(i * 47) % 360}deg`,
                  }}
                />
              ))}
            </div>

            <div className="so-result-card so-result-pop">
              <div className="so-result-burst" aria-hidden>🎉</div>
              <div className="so-result-icon">{result.prize.icon}</div>
              <h3 className="so-result-title so-result-title-win">
                You won{' '}
                <span style={{ color: 'var(--primary)' }}>{result.prize.label}</span>
                {' '}on {result.food.emoji} {result.food.name}!
              </h3>
              <p className="so-result-food">{result.prize.desc}</p>
              <div className="so-result-ticket">
                🎟 Buy 1 {result.food.name} item first (full price), then add a 2nd item to get it FREE!
              </div>
              <button
                type="button"
                className="hero-btn-main"
                style={{ display: 'inline-flex', margin: '0 auto' }}
                onClick={handleClaimOrder}
              >
                Order {result.food.name} with {result.prize.label} →
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
