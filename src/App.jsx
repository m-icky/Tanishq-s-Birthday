import React, { useRef, useEffect } from 'react';
import ScrollBall from './components/ScrollBall';
import Hero from './components/Hero';
import Countdown from './components/Countdown';
import ScrollVideo from './components/ScrollVideo';
import Gallery from './components/Gallery';
import Details from './components/Details';
import Magazine from './components/Magazine';
import TVSection from './components/TVSection';
import { ProgressBar, Footer } from './components/Footer';

function App() {
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);
  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const cursorPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const cursorScale = useRef(1);
  const isHovering = useRef(false);
  const hasMoved = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      
      if (!hasMoved.current) {
        hasMoved.current = true;
        if (cursorRef.current) cursorRef.current.style.opacity = '1';
        if (cursorDotRef.current) cursorDotRef.current.style.opacity = '1';
      }
    };

    const handleMouseOver = (e) => {
      const target = e.target.closest('a, button, .sp-card, .page, .hero-cta, [role="button"]');
      isHovering.current = !!target;
    };

    const handleMouseLeave = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = '0';
      if (cursorDotRef.current) cursorDotRef.current.style.opacity = '0';
    };

    const handleMouseEnter = () => {
      if (hasMoved.current) {
        if (cursorRef.current) cursorRef.current.style.opacity = '1';
        if (cursorDotRef.current) cursorDotRef.current.style.opacity = '1';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    let animationFrameId;
    const render = () => {
      const lerp = (start, end, amt) => (1 - amt) * start + amt * end;
      
      // Smoothly interpolate position
      cursorPos.current.x = lerp(cursorPos.current.x, mousePos.current.x, 0.15);
      cursorPos.current.y = lerp(cursorPos.current.y, mousePos.current.y, 0.15);

      // Smoothly interpolate scale
      const targetScale = isHovering.current ? 1.8 : 1;
      cursorScale.current = lerp(cursorScale.current, targetScale, 0.15);

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorPos.current.x - 20}px, ${cursorPos.current.y - 20}px, 0) scale(${cursorScale.current})`;
        cursorRef.current.style.borderColor = isHovering.current ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.4)';
        cursorRef.current.style.backgroundColor = isHovering.current ? 'rgba(255, 255, 255, 0.1)' : 'transparent';
      }
      
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${mousePos.current.x - 3}px, ${mousePos.current.y - 3}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);


  
  return (
    <>
      <div className="page-grain"></div>
      <div id="circle" ref={cursorRef}></div>
      <div id="cursor-dot" ref={cursorDotRef}></div>
      <ProgressBar />
      <ScrollBall />
      
      <main>
        <Hero />
        <Countdown />
        <ScrollVideo />
        <Gallery />
        <Details />
        <Magazine />
        <TVSection />
      </main>

      <Footer />
    </>
  )
}

export default App
