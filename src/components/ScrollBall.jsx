import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollBall = () => {
  const ballRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
        }
      })
      .to(ballRef.current, { top: "20%", left: "10%", duration: 1, ease: "power1.inOut" })
      .to(ballRef.current, { top: "50%", left: "5%", duration: 1, ease: "power1.inOut" })
      .to(ballRef.current, { top: "80%", left: "80%", duration: 1, ease: "power1.inOut" })
      .to(ballRef.current, { top: "40%", left: "10%", duration: 1, ease: "power1.inOut" })
      .to(ballRef.current, { 
        top: "50%", 
        left: "50%", 
        xPercent: -50, 
        yPercent: -50, 
        width: "150vw", 
        height: "150vh", 
        borderRadius: "30%", 
        opacity: 1, 
        duration: 1.5,
        ease: "power2.inOut"
      });
    });

    return () => ctx.revert();
  }, []);

  return <div className="back-elements" id="scrollBall" ref={ballRef}></div>;
};

export default ScrollBall;
