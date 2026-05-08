import { useLayoutEffect } from 'react';
import gsap from 'gsap';

const TVSection = () => {
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("#tvHeader", {
        scrollTrigger: { trigger: "#tv", start: "top 80%" },
        opacity: 0, y: 20, duration: 0.8
      });
      gsap.from("#tvFrame", {
        scrollTrigger: { trigger: "#tv", start: "top 60%" },
        scale: 0.9, opacity: 0, duration: 1, ease: "back.out(1.7)"
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section id="tv">
      <div className="tv-header" id="tvHeader">
        <span className="section-label" style={{color:'White'}}>Captured moments</span>
        <h2>Watch the <em style={{color:'White'}}>magic</em> unfold</h2>
        <p style={{color:'White'}}>A little film for a little star</p>
      </div>

      <div className="tv-outer">
        <div className="tv-antenna">
          <div className="tv-antenna-arm">
            <div className="tv-antenna-ball"></div>
          </div>
          <div className="tv-antenna-arm" style={{transform: 'rotate(20deg)'}}>
            <div className="tv-antenna-ball"></div>
          </div>
        </div>

        <div className="tv-frame" id="tvFrame">
          <div className="tv-screen-border">
            <div className="tv-screen">
              <video autoPlay loop muted playsInline src="/hero-section.mp4"></video>
            </div>
          </div>
          <div className="tv-knobs">
            <div className="tv-knob"></div>
            <span className="tv-brand">Tanishq TV</span>
            <div className="tv-knob"></div>
          </div>
          <div className="tv-grain"></div>
        </div>
      </div>
    </section>
  );
};

export default TVSection;
