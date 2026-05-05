import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

const Hero = () => {
  const mainTitleRef = useRef(null);
  const subTitleRef = useRef(null);
  const taglineRef = useRef(null);
  const ctaRef = useRef(null);
  const navRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Split text into characters manually for the wave effect
      const splitText = (el) => {
        if (!el) return;
        const text = el.textContent.replace('✦', '').trim();
        const sup = el.querySelector('sup');
        el.innerHTML = '';
        [...text].forEach(char => {
          const span = document.createElement('span');
          span.className = 'char';
          span.innerHTML = char === ' ' ? '&nbsp;' : char;
          el.appendChild(span);
        });
        if (sup) el.appendChild(sup);
      };

      splitText(mainTitleRef.current);

      const chars = mainTitleRef.current.querySelectorAll('.char');
      gsap.set(chars, { opacity: 0 });

      const tl = gsap.timeline();
      
      tl.from(navRef.current, {
        y: -40,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.2
      })
      .from(subTitleRef.current, {
        opacity: 0,
        y: 10,
        duration: 0.8,
        ease: "power2.out"
      }, "-=0.5")
      .to(chars, {
        opacity: 1,
        duration: 0.05,
        stagger: 0.12,
        ease: "none"
      })
      .from(taglineRef.current, { y: 15, opacity: 0, duration: 0.8, ease: "power2.out" }, "-=0.2")
      .from(ctaRef.current, { y: 15, opacity: 0, duration: 0.8, ease: "power2.out" }, "-=0.4");

      // Infinite Wave Animation
      gsap.to(chars, {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        stagger: { each: 0.1, from: "start" },
        ease: "sine.inOut",
        delay: 4
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <nav className="hero-nav" ref={navRef}>
        <a href="#gallery">Gallery</a>
        <a href="#details">Details</a>
        <a href="#countdown">Countdown</a>
        <a href="#magazine">Magazine</a>
        <a href="#tv">Memories</a>
      </nav>

      <section id="hero">
        <div className="hero-inner">
          <video className="hero-video" autoPlay loop muted playsInline src="/hero section.mp4"></video>
          <div className="hero-content">
            <div>
              <h4 className="hero-title-1" ref={subTitleRef}>Happy Birthday</h4>
              <h1 className="hero-title" ref={mainTitleRef}>Tanishq<sup>✦</sup></h1>
            </div>
            <div className="hero-right">  
              <p className="hero-tagline" ref={taglineRef}>
                One little human. Twelve months of wonder. A lifetime ahead.
                Join us as we celebrate Tanishq's first year of joy.
              </p>
              <button 
                className="hero-cta" 
                ref={ctaRef}
                onClick={() => document.getElementById('details').scrollIntoView({behavior:'smooth'})}
              >
                See the details
                <span className="hero-cta-icon">
                  <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
