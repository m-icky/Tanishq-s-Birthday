import { useState, useCallback, useRef, useEffect, useLayoutEffect, startTransition } from 'react';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── 12 months of memories ─── */
const GALLERY_ITEMS = [
  { month: "Month 01", label: "The Beginning", img: "https://images.unsplash.com/photo-1544126592-807ade215a0b?w=600&q=80" },
  { month: "Month 02", label: "First Smiles", img: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&q=80" },
  { month: "Month 03", label: "Tiny Explorer", img: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80" },
  { month: "Month 04", label: "Growing Fast", img: "https://images.unsplash.com/photo-1519612244426-475f6e67fb1e?w=600&q=80" },
  { month: "Month 05", label: "Little Joy", img: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&q=80" },
  { month: "Month 06", label: "Half Way", img: "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=600&q=80" },
  { month: "Month 07", label: "New Adventures", img: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80" },
  { month: "Month 08", label: "Curious Soul", img: "https://images.unsplash.com/photo-1556012018-50c5c0da73bf?w=600&q=80" },
  { month: "Month 09", label: "Standing Tall", img: "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=600&q=80" },
  { month: "Month 10", label: "Almost There", img: "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=600&q=80" },
  { month: "Month 11", label: "Full of Life", img: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&q=80" },
  { month: "Month 12", label: "One Year!", img: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=600&q=80" },
];

/* ─── theme colours ─── */
const THEME = {
  bg: '#4A3525',
  accent: '#8E5E38',
  accentLight: '#C39F6F',
  cream: '#FCFAF7',
  cardBorder: 'rgba(195, 159, 111, 0.18)',
  sideOpacity: 0.65,
};

/* ─── constants ─── */
const CARD_W = 300;
const CARD_H = 420;
const SPACING = 9;
const NAV_COOLDOWN = 350;

/* ─── helper ─── */
const padNum = (n) => String(n).padStart(2, '0');

/* ─── 3D position calculators ─── */
function getVerticalStyle(index, current, total) {
  let diff = index - current;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;
  const s = SPACING;

  if (diff === 0) return { x: 0, y: 0, scale: 1, opacity: 1, zIndex: 10, rotateX: 0, rotateY: 0 };
  if (diff === -1) return { x: -18 * s, y: -22 * s, scale: 0.84, opacity: THEME.sideOpacity, zIndex: 7, rotateX: 12, rotateY: -6 };
  if (diff === -2) return { x: -30 * s, y: -38 * s, scale: 0.70, opacity: THEME.sideOpacity * 0.54, zIndex: 5, rotateX: 22, rotateY: -12 };
  if (diff === 1) return { x: 18 * s, y: 22 * s, scale: 0.84, opacity: THEME.sideOpacity, zIndex: 7, rotateX: -12, rotateY: 6 };
  if (diff === 2) return { x: 30 * s, y: 38 * s, scale: 0.70, opacity: THEME.sideOpacity * 0.54, zIndex: 5, rotateX: -22, rotateY: 12 };
  return { x: diff > 0 ? 60 : -60, y: diff > 0 ? 80 : -80, scale: 0.55, opacity: 0, zIndex: 0, rotateX: 0, rotateY: 0 };
}

function getHorizontalStyle(index, current, total) {
  let diff = index - current;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;
  const s = SPACING;

  if (diff === 0) return { x: 0, y: 0, scale: 1, opacity: 1, zIndex: 10, rotateY: 0, rotateX: 0 };
  if (diff === -1) return { x: -28 * s, y: 8 * s, scale: 0.80, opacity: THEME.sideOpacity * 0.85, zIndex: 7, rotateY: 14, rotateX: 0 };
  if (diff === -2) return { x: -46 * s, y: 14 * s, scale: 0.65, opacity: THEME.sideOpacity * 0.38, zIndex: 5, rotateY: 26, rotateX: 0 };
  if (diff === 1) return { x: 28 * s, y: 8 * s, scale: 0.80, opacity: THEME.sideOpacity * 0.85, zIndex: 7, rotateY: -14, rotateX: 0 };
  if (diff === 2) return { x: 46 * s, y: 14 * s, scale: 0.65, opacity: THEME.sideOpacity * 0.38, zIndex: 5, rotateY: -26, rotateX: 0 };
  return { x: diff > 0 ? 90 : -90, y: 20, scale: 0.5, opacity: 0, zIndex: 0, rotateY: 0, rotateX: 0 };
}

/* ═════════════════════  CARD  ═════════════════════ */
function CarouselCard({ index, item, isCurrent, cardStyle: cs, orientation, onDragEnd }) {
  const ref = useRef(null);

  return (
    <motion.div
      ref={ref}
      style={{
        position: 'absolute',
        zIndex: cs.zIndex,
        transformStyle: 'preserve-3d',
        cursor: isCurrent ? 'grab' : 'auto',
        WebkitTapHighlightColor: 'transparent',
      }}
      animate={{
        x: cs.x,
        y: cs.y,
        scale: cs.scale,
        opacity: cs.opacity,
        rotateX: cs.rotateX,
        rotateY: cs.rotateY,
        zIndex: cs.zIndex,
      }}
      transition={{ type: 'spring', stiffness: 280, damping: 28, mass: 0.9 }}
      drag={isCurrent ? (orientation === 'horizontal' ? 'x' : 'y') : false}
      dragConstraints={orientation === 'horizontal' ? { left: 0, right: 0 } : { top: 0, bottom: 0 }}
      dragElastic={0.18}
      onDragEnd={onDragEnd}
      whileDrag={{ cursor: 'grabbing' }}
      tabIndex={isCurrent ? 0 : -1}
    >
      <div
        style={{
          position: 'relative',
          width: CARD_W,
          height: CARD_H,
          borderRadius: 20,
          overflow: 'hidden',
          background: '#1a110b',
          border: `1px solid ${THEME.cardBorder}`,
          boxShadow: isCurrent
            ? '0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(195,159,111,0.08)'
            : '0 8px 32px rgba(0,0,0,0.4)',
          pointerEvents: isCurrent ? 'auto' : 'none',
        }}
      >
        {/* image */}
        <motion.img
          src={item.img}
          alt={item.label}
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            pointerEvents: 'none',
          }}
          initial={{ scale: 1, filter: 'grayscale(100%) brightness(0.85)' }}
          whileHover={{ scale: 1.07, filter: 'grayscale(0%) brightness(1)' }}
          animate={isCurrent ? { filter: 'grayscale(0%) brightness(1)' } : { filter: 'grayscale(100%) brightness(0.85)' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />

        {/* gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(28,19,13,0.82) 0%, rgba(28,19,13,0.2) 40%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />

        {/* counter badge */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(195,159,111,0.15)',
            borderRadius: 100,
            padding: '3px 10px',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: isCurrent ? THEME.accentLight : 'rgba(255,255,255,0.45)',
            fontVariantNumeric: 'tabular-nums',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {padNum(index + 1)}
        </div>

        {/* bottom text */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '24px 20px 20px',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: THEME.accentLight,
              marginBottom: 6,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
            }}
          >
            {item.month}
          </span>
          <span
            style={{
              display: 'block',
              fontSize: 18,
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              color: THEME.cream,
              lineHeight: 1.2,
            }}
          >
            {item.label}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ═════════════════════  GALLERY  ═════════════════════ */
const Gallery = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [orientation, setOrientation] = useState('vertical');
  const lastNavTime = useRef(0);
  const stageRef = useRef(null);
  const autoPlayRef = useRef(null);
  const total = GALLERY_ITEMS.length;

  /* navigate with cooldown */
  const navigate = useCallback((dir) => {
    const now = Date.now();
    if (now - lastNavTime.current < NAV_COOLDOWN) return;
    lastNavTime.current = now;
    startTransition(() => {
      setCurrentIndex((prev) =>
        dir > 0 ? (prev === total - 1 ? 0 : prev + 1) : (prev === 0 ? total - 1 : prev - 1)
      );
    });
  }, [total]);

  /* drag handler */
  const handleDragEnd = (_e, info) => {
    const threshold = 50;
    if (orientation === 'horizontal') {
      if (info?.offset?.x < -threshold) navigate(1);
      else if (info?.offset?.x > threshold) navigate(-1);
    } else {
      if (info?.offset?.y < -threshold) navigate(1);
      else if (info?.offset?.y > threshold) navigate(-1);
    }
  };

  /* wheel handler – only inside the 3D stage div */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const handler = (e) => {
      if (Math.abs(e.deltaY) > 30) {
        e.preventDefault();
        e.deltaY > 0 ? navigate(1) : navigate(-1);
      } else if (Math.abs(e.deltaX) > 30) {
        e.preventDefault();
        e.deltaX > 0 ? navigate(1) : navigate(-1);
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [navigate]);

  /* auto-play every 4s */
  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      navigate(1);
    }, 4000);
    return () => clearInterval(autoPlayRef.current);
  }, [navigate]);

  /* reset auto-play on manual interaction */
  const handleManualNav = (dir) => {
    clearInterval(autoPlayRef.current);
    navigate(dir);
    autoPlayRef.current = setInterval(() => navigate(1), 4000);
  };

  /* GSAP header entrance */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.carousel3d-header', { opacity: 0, y: 50 }, {
        scrollTrigger: { trigger: '.carousel3d-header', start: 'top 85%' },
        opacity: 1, y: 0, duration: 1, ease: 'power4.out',
      });
      gsap.fromTo('.carousel3d-stage', { opacity: 0, scale: 0.9 }, {
        scrollTrigger: { trigger: '.carousel3d-stage', start: 'top 90%' },
        opacity: 1, scale: 1, duration: 1.2, ease: 'expo.out',
      });
    });
    return () => ctx.revert();
  }, []);

  /* derived */
  const getCardStyle = (index) =>
    orientation === 'horizontal'
      ? getHorizontalStyle(index, currentIndex, total)
      : getVerticalStyle(index, currentIndex, total);

  const isVisible = (index) => {
    let diff = index - currentIndex;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return Math.abs(diff) <= 2;
  };

  const progress = currentIndex / Math.max(total - 1, 1) * 100;

  return (
    <section
      id="gallery"
      style={{
        padding: '6rem 0 8rem',
        background: 'transparent',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* ── header ── */}
      <div className="carousel3d-header" style={{ maxWidth: 700, margin: '0 auto 3rem', textAlign: 'center', padding: '0 2rem' }}>
        <span className="section-label">12 months · 12 memories</span>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(2.5rem, 8vw, 5rem)',
          fontWeight: 300,
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          color: 'var(--soft-black)',
        }}>
          A year of <em style={{ color: 'var(--dusty-rose)' }}>firsts</em>
        </h2>
        <div className="divider" />
        <p style={{ marginTop: '1.5rem', fontSize: '0.95rem', color: 'var(--text-light)', lineHeight: 1.8, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
          Swipe, drag, or use the arrows to explore every milestone.
        </p>
      </div>

      {/* ── 3D stage ── */}
      <div
        ref={stageRef}
        className="carousel3d-stage"
        style={{
          position: 'relative',
          width: '100%',
          height: 700,
          background: THEME.bg,
          borderRadius: 28,
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* subtle radial glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at center, rgba(142,94,56,0.10) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* orientation switch */}
        <div style={{
          position: 'absolute', top: 18, left: 18, zIndex: 20,
          display: 'flex', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
          borderRadius: 100, padding: 4,
          border: '1px solid rgba(195,159,111,0.12)', gap: 3,
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        }}>
          {['vertical', 'horizontal'].map((o) => (
            <button
              key={o}
              onClick={() => {
                if (orientation !== o) startTransition(() => { setOrientation(o); setCurrentIndex(0); });
              }}
              style={{
                padding: '7px 16px', borderRadius: 100, border: 'none',
                background: orientation === o ? THEME.cream : 'transparent',
                color: orientation === o ? THEME.bg : 'rgba(255,255,255,0.6)',
                fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
                textTransform: 'uppercase', cursor: orientation === o ? 'default' : 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: orientation === o ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {o === 'vertical' ? '↕ Stack' : '↔ Stage'}
            </button>
          ))}
        </div>

        {/* ── progress bar (left) ── */}
        <div style={{
          position: 'absolute', left: 22, top: '50%', transform: 'translateY(-50%)',
          zIndex: 15, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        }}>
          <span style={{
            fontSize: 13, fontWeight: 700, letterSpacing: '0.12em',
            color: THEME.cream, fontVariantNumeric: 'tabular-nums',
          }}>
            {padNum(currentIndex + 1)}
          </span>
          <div style={{
            width: 2, height: 120, borderRadius: 2,
            background: 'rgba(255,255,255,0.1)', position: 'relative', overflow: 'visible',
          }}>
            <motion.div
              animate={{ height: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%',
                background: THEME.accent, borderRadius: 2,
              }}
            />
            {GALLERY_ITEMS.map((_, i) => (
              <button
                key={i}
                onClick={() => { clearInterval(autoPlayRef.current); startTransition(() => setCurrentIndex(i)); autoPlayRef.current = setInterval(() => navigate(1), 4000); }}
                aria-label={`Go to ${i + 1}`}
                style={{
                  position: 'absolute', left: '50%',
                  top: `${i / Math.max(total - 1, 1) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: i === currentIndex ? 9 : 5,
                  height: i === currentIndex ? 9 : 5,
                  borderRadius: '50%',
                  border: `1.5px solid ${i === currentIndex ? THEME.accentLight : 'rgba(255,255,255,0.25)'}`,
                  background: i === currentIndex ? THEME.accent : THEME.bg,
                  cursor: 'pointer', padding: 0,
                  transition: 'all 0.25s',
                }}
              />
            ))}
          </div>
          <span style={{
            fontSize: 11, fontWeight: 400, letterSpacing: '0.08em',
            color: 'rgba(255,255,255,0.25)', fontVariantNumeric: 'tabular-nums',
          }}>
            {padNum(total)}
          </span>
        </div>

        {/* ── cards ── */}
        <div style={{
          position: 'relative', width: CARD_W, height: CARD_H,
          perspective: 1400, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {GALLERY_ITEMS.map((item, index) => {
            if (!isVisible(index)) return null;
            const cs = getCardStyle(index);
            const isCurrent = index === currentIndex;
            return (
              <CarouselCard
                key={index}
                index={index}
                item={item}
                isCurrent={isCurrent}
                cardStyle={cs}
                orientation={orientation}
                onDragEnd={handleDragEnd}
              />
            );
          })}
        </div>

        {/* ── navigation buttons (right) ── */}
        <div style={{
          position: 'absolute', right: 22, top: '50%', transform: 'translateY(-50%)',
          zIndex: 15, display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {[
            { label: '↑', dir: -1, ariaLabel: 'Previous' },
            { label: '↓', dir: 1, ariaLabel: 'Next' },
          ].map(({ label, dir, ariaLabel }) => (
            <button
              key={dir}
              onClick={() => handleManualNav(dir)}
              aria-label={ariaLabel}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                border: `1px solid rgba(195,159,111,0.15)`,
                background: 'rgba(255,255,255,0.06)',
                color: '#fff', fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s, border-color 0.2s',
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = THEME.accent;
                e.currentTarget.style.borderColor = THEME.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = 'rgba(195,159,111,0.15)';
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── dot nav (bottom, horizontal mode only) ── */}
        {orientation === 'horizontal' && (
          <div style={{
            position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 6, zIndex: 15,
          }}>
            {GALLERY_ITEMS.map((_, i) => (
              <button
                key={i}
                onClick={() => { clearInterval(autoPlayRef.current); startTransition(() => setCurrentIndex(i)); autoPlayRef.current = setInterval(() => navigate(1), 4000); }}
                style={{
                  width: i === currentIndex ? 28 : 8,
                  height: 8,
                  borderRadius: 4,
                  border: 'none',
                  background: i === currentIndex ? THEME.accent : 'rgba(255,255,255,0.25)',
                  cursor: 'pointer', padding: 0,
                  transition: 'all 0.25s',
                }}
              />
            ))}
          </div>
        )}

        {/* ── month info overlay (bottom-left) ── */}
        <div style={{
          position: 'absolute', bottom: 24, left: 24, zIndex: 15,
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <motion.span
            key={`month-${currentIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: THEME.accentLight, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {GALLERY_ITEMS[currentIndex].month}
          </motion.span>
          <motion.span
            key={`label-${currentIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            style={{
              fontSize: 22, fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300, color: THEME.cream, lineHeight: 1.2,
            }}
          >
            {GALLERY_ITEMS[currentIndex].label}
          </motion.span>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
