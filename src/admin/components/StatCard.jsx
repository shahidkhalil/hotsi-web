import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';

function StatCardInner({ icon, count, label, color }) {
  return (
    <>
      <div className="admin-stat-glow" style={{ background: `radial-gradient(circle, ${color}35, transparent 70%)` }} />
      <div className="admin-stat-shine" />
      <div className="admin-stat-top" style={{ background: `linear-gradient(90deg, ${color}, ${color}44)` }} />
      <div className="admin-stat-body">
        <div className="admin-stat-icon-wrap" style={{ background: `${color}20`, borderColor: `${color}45`, boxShadow: `0 8px 28px ${color}25` }}>
          <span className="admin-stat-icon">{icon}</span>
        </div>
        <div className="admin-stat-meta">
          <div className="admin-stat-num" style={{ color }}>{count.toLocaleString()}</div>
          <div className="admin-stat-label">{label}</div>
        </div>
      </div>
      <div className="admin-stat-footer">
        <span className="admin-stat-live-dot" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
        Live count
      </div>
    </>
  );
}

export default function StatCard({ icon, value, label, color, to, delay = 0, pulse }) {
  const cardRef = useRef(null);
  const count = useAnimatedCounter(value);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { opacity: 0, y: 36, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1, duration: 0.75, delay, ease: 'back.out(1.4)' },
    );
  }, [delay]);

  useEffect(() => {
    if (!pulse || !cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { boxShadow: `0 0 0 0 ${color}55` },
      { boxShadow: `0 0 0 12px ${color}00`, duration: 0.6, ease: 'power2.out' },
    );
  }, [value, pulse, color]);

  const className = 'admin-stat-card';
  const style = { '--accent': color };

  if (to) {
    return (
      <Link to={to} className={className} style={style} ref={cardRef}>
        <StatCardInner icon={icon} count={count} label={label} color={color} />
      </Link>
    );
  }

  return (
    <div ref={cardRef} className={className} style={style}>
      <StatCardInner icon={icon} count={count} label={label} color={color} />
    </div>
  );
}
