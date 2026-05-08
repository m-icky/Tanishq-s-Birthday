import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import Hero3D from './Hero3D';
import RetroGrid from './RetroGrid';
import LightRays from './LightRays';
import { IoImages, IoInformationCircle, IoTimer, IoBook, IoTv } from 'react-icons/io5';

const Hero = () => {
  const mainTitleRef = useRef(null);
  const subTitleRef = useRef(null);
  const taglineRef = useRef(null);
  const ctaRef = useRef(null);
  const navRef = useRef(null);
  const container3D = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      tl.from(navRef.current, {
        y: -40,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.2
      })
      .from(container3D.current, {
        opacity: 0,
        scale: 0.85,
        duration: 1.5,
        ease: "power4.out"
      }, "-=0.8");

      if (taglineRef.current) {
        tl.from(taglineRef.current, { y: 15, opacity: 0, duration: 0.8, ease: "power2.out" }, "-=1.0");
      }
      if (ctaRef.current) {
        tl.from(ctaRef.current, { y: 15, opacity: 0, duration: 0.8, ease: "power2.out" }, "-=0.4");
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <nav className="hero-nav" style={{opacity:1}} ref={navRef}>
        {/* Desktop text links */}
        <div className="nav-links nav-links--text">
          <a href="#countdown">Countdown</a>
          <a href="#gallery">Gallery</a>
          <a href="#details">Details</a>
          <a href="#magazine">Magazine</a>
          <a href="#tv">Memories</a>
        </div>

        {/* Mobile icon links */}
        <div className="nav-links nav-links--icons">
          <a href="#countdown" aria-label="Countdown"><IoTimer /></a>
          <a href="#gallery" aria-label="Gallery"><IoImages /></a>
          <a href="#details" aria-label="Details"><IoInformationCircle /></a>
          <a href="#magazine" aria-label="Magazine"><IoBook /></a>
          <a href="#tv" aria-label="Memories"><IoTv /></a>
        </div>
      </nav>

      <section id="hero">
        <div className="hero-inner">
          {/* Light Rays from the top */}
          <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
            <LightRays
              raysOrigin="top-center"
              raysColor="#C39F6F"
              raysSpeed={1.0}
              lightSpread={0.8}
              rayLength={1.5}
              followMouse={true}
              mouseInfluence={0.08}
              noiseAmount={0.03}
              distortion={0.06}
              pulsating={true}
              fadeDistance={1.2}
            />
          </div>

          {/* RetroGrid animated background */}
          <RetroGrid
            angle={65}
            cellSize={60}
            opacity={0.8}
            lineColor="rgba(195, 159, 111, 0.3)"
            backgroundColor="transparent"
            animationSpeed={4}
            perspective={200}
            fadeHeight={85}
            fadeColor="#1C130D"
            animationDirection="both"
            gridType="standard"
            style={{ zIndex: 1 }}
          />

          {/* Centered 3D model */}
          <div className="hero-3d-container" ref={container3D}>
            <Hero3D />
          </div>

          <div className="hero-content">
            <div>
              <h4 className="hero-title-1" ref={subTitleRef}>Happy Birthday</h4>
              <h1 className="hero-title" ref={mainTitleRef}>TanishQ</h1>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
