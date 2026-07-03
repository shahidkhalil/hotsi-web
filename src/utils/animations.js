import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import Swiper from 'swiper';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export function initParticles() {
  const c = document.getElementById('hero-particles');
  if (!c) return;
  const ctx = c.getContext('2d');
  c.width = innerWidth;
  c.height = innerHeight;
  const pts = Array.from({ length: 80 }, () => ({
    x: Math.random() * c.width,
    y: Math.random() * c.height,
    r: Math.random() * 2 + 0.5,
    dx: (Math.random() - 0.5) * 0.4,
    dy: (Math.random() - 0.5) * 0.4,
    a: Math.random() * 0.4 + 0.1,
    col: Math.random() > 0.5 ? '255,107,53' : '255,200,87',
  }));
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    pts.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.col},${p.a})`;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > c.width) p.dx *= -1;
      if (p.y < 0 || p.y > c.height) p.dy *= -1;
    });
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize', () => { c.width = innerWidth; c.height = innerHeight; });
}

export function initBurger() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  const rend = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  rend.setPixelRatio(Math.min(devicePixelRatio, 2));
  rend.setSize(W, H);
  const sc = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
  cam.position.z = 5;
  sc.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dl = new THREE.DirectionalLight(0xff6b35, 2);
  dl.position.set(2, 3, 4);
  sc.add(dl);
  const fl = new THREE.DirectionalLight(0xffc857, 0.8);
  fl.position.set(-3, 1, 2);
  sc.add(fl);
  const bg = new THREE.Group();
  sc.add(bg);
  const bm = new THREE.MeshStandardMaterial({ color: 0xc8751a, roughness: 0.7, metalness: 0.1 });
  const tg = new THREE.SphereGeometry(1.2, 32, 32);
  tg.scale(1, 0.6, 1);
  const top = new THREE.Mesh(tg, bm);
  top.position.y = 0.8;
  bg.add(top);
  for (let i = 0; i < 8; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshStandardMaterial({ color: 0xf5deb3 }));
    const a = (i / 8) * Math.PI * 2;
    const r = 0.5 + Math.random() * 0.4;
    s.position.set(Math.cos(a) * r, 1.08, Math.sin(a) * r);
    bg.add(s);
  }
  const pat = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.2, 32), new THREE.MeshStandardMaterial({ color: 0x5c3317, roughness: 0.9 }));
  pat.position.y = 0.1;
  bg.add(pat);
  const che = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.05, 2.2), new THREE.MeshStandardMaterial({ color: 0xffb800, roughness: 0.6 }));
  che.position.y = 0.22;
  bg.add(che);
  const let_ = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.12, 8, 32), new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 0.8 }));
  let_.rotation.x = Math.PI / 2;
  let_.position.y = -0.1;
  bg.add(let_);
  for (let i = 0; i < 3; i++) {
    const tm = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.06, 32), new THREE.MeshStandardMaterial({ color: 0xe53e3e, roughness: 0.7 }));
    const a = (i / 3) * Math.PI * 2;
    tm.position.set(Math.cos(a) * 0.35, -0.2, Math.sin(a) * 0.35);
    bg.add(tm);
  }
  const bot = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.25, 32), bm);
  bot.position.y = -0.45;
  bg.add(bot);
  const rm = new THREE.MeshBasicMaterial({ color: 0xff6b35, transparent: true, opacity: 0.2 });
  const rg = new THREE.TorusGeometry(2, 0.015, 8, 100);
  const r1 = new THREE.Mesh(rg, rm);
  r1.rotation.x = Math.PI / 3;
  sc.add(r1);
  const r2 = new THREE.Mesh(rg, rm.clone());
  r2.rotation.x = -Math.PI / 4;
  r2.rotation.y = Math.PI / 3;
  sc.add(r2);
  let tx = 0;
  let ty = 0;
  document.addEventListener('mousemove', (e) => { tx = (e.clientX / innerWidth - 0.5) * 0.8; ty = -(e.clientY / innerHeight - 0.5) * 0.6; });
  let t = 0;
  (function tick() {
    requestAnimationFrame(tick);
    t += 0.01;
    bg.rotation.y += (tx - bg.rotation.y) * 0.05;
    bg.rotation.x += (ty - bg.rotation.x) * 0.05;
    bg.position.y = Math.sin(t) * 0.15;
    r1.rotation.z += 0.003;
    r2.rotation.z -= 0.002;
    rend.render(sc, cam);
  })();
  window.addEventListener('resize', () => {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
    rend.setSize(w, h);
  });
}

export function initGSAP() {
  gsap.registerPlugin(ScrollTrigger);
  gsap.from('.hero-title .line span', { yPercent: 110, duration: 1, stagger: 0.15, ease: 'power4.out', delay: 0.2 });
  gsap.from('.hero-label', { opacity: 0, y: 20, duration: 0.8, delay: 0.1 });
  gsap.from('.hero-sub', { opacity: 0, y: 30, duration: 0.9, delay: 0.6 });
  gsap.from('.hero-btns', { opacity: 0, y: 30, duration: 0.9, delay: 0.8 });
  gsap.from('.hero-stats > div', { opacity: 0, y: 20, duration: 0.7, stagger: 0.12, delay: 1 });
  gsap.from('.hero-float,.steam', { opacity: 0, scale: 0.5, duration: 1, stagger: 0.2, delay: 0.5, ease: 'back.out(2)' });
}

export function initFades() {
  const obs = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('vis'); }), { threshold: 0.1 });
  document.querySelectorAll('.fu').forEach((el) => obs.observe(el));
}

let swiperInstance = null;

export function initSwiper() {
  if (swiperInstance) return;
  swiperInstance = new Swiper('.reviewsSwiper', {
    modules: [Autoplay, Pagination],
    slidesPerView: 'auto',
    spaceBetween: 24,
    loop: true,
    autoplay: { delay: 3500, disableOnInteraction: false },
    pagination: { el: '.swiper-pagination', clickable: true },
    grabCursor: true,
  });
}

export function initCountdowns() {
  const ends = [Date.now() + 3 * 3600000 + 22 * 60000, Date.now() + 7 * 3600000 + 45 * 60000, Date.now() + 11 * 3600000 + 30 * 60000];
  function pad(n) { return String(n).padStart(2, '0'); }
  function rend(el, end) {
    const d = end - Date.now();
    if (d < 0) { el.innerHTML = '<span style="font-size:11px;color:#EF4444">Expired</span>'; return; }
    const h = Math.floor(d / 3600000);
    const m = Math.floor((d % 3600000) / 60000);
    const s = Math.floor((d % 60000) / 1000);
    el.innerHTML = `<div class="cu"><div class="cn2">${pad(h)}</div><div class="cl">H</div></div><div class="cu"><div class="cn2">${pad(m)}</div><div class="cl">M</div></div><div class="cu"><div class="cn2">${pad(s)}</div><div class="cl">S</div></div>`;
  }
  ['cd1', 'cd2', 'cd3'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    rend(el, ends[i]);
    setInterval(() => rend(el, ends[i]), 1000);
  });
}

export function initCatScroll() {
  const g = document.querySelector('.cat-grid');
  if (!g) return;
  g.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { g.scrollLeft += e.deltaY; e.preventDefault(); }
  }, { passive: false });
  let down = false;
  let startX = 0;
  let startLeft = 0;
  let moved = false;
  g.addEventListener('pointerdown', (e) => {
    down = true;
    moved = false;
    startX = e.clientX;
    startLeft = g.scrollLeft;
    g.classList.add('dragging');
  });
  g.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) moved = true;
    g.scrollLeft = startLeft - dx;
  });
  const end = () => { down = false; g.classList.remove('dragging'); };
  g.addEventListener('pointerup', end);
  g.addEventListener('pointerleave', end);
  g.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
}

export function initRipple() {
  document.querySelectorAll('.rp').forEach((el) => {
    el.addEventListener('click', function (e) {
      const r = this.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const rp = document.createElement('span');
      rp.className = 'rfx';
      rp.style.left = `${x}px`;
      rp.style.top = `${y}px`;
      this.appendChild(rp);
      setTimeout(() => rp.remove(), 700);
    });
  });
}

export function boot() {
  initParticles();
  initBurger();
  initGSAP();
  initFades();
  initSwiper();
  initCountdowns();
  initCatScroll();
  initRipple();
}
