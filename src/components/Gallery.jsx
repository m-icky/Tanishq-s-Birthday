import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const GALLERY_ITEMS = [
  { text: "Month 01", img: "https://images.unsplash.com/photo-1544126592-807ade215a0b?w=600&q=80" },
  { text: "Month 02", img: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&q=80" },
  { text: "Month 03", img: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80" },
  { text: "Month 04", img: "https://images.unsplash.com/photo-1519612244426-475f6e67fb1e?w=600&q=80" },
  { text: "Month 05", img: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&q=80" },
  { text: "Month 06", img: "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=600&q=80" },
  { text: "Month 07", img: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80" },
  { text: "Month 08", img: "https://images.unsplash.com/photo-1556012018-50c5c0da73bf?w=600&q=80" },
  { text: "Month 09", img: "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=600&q=80" },
  { text: "Month 10", img: "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=600&q=80" },
  { text: "Month 11", img: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&q=80" },
  { text: "Month 12", img: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=600&q=80" },
];

const Gallery = () => {
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(".gallery-header", { 
        opacity: 0, 
        y: 50 
      }, {
        scrollTrigger: {
          trigger: ".gallery-header",
          start: "top 85%",
        },
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power4.out"
      });

      // Rows entrance animation
      gsap.fromTo(".gallery-container", {
        opacity: 0,
        y: 80,
        scale: 0.95
      }, {
        scrollTrigger: {
          trigger: ".gallery-container",
          start: "top 90%",
        },
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        stagger: 0.2,
        ease: "expo.out"
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section id="gallery">
      <div className="gallery-header">
        <span className="section-label">12 months · 12 memories</span>
        <h2>A year of <em style={{color:'var(--dusty-rose)'}}>firsts</em></h2>
        <div className="divider"></div>
        <p>Every month brought a new milestone. Explore the journey through two seasons of memories.</p>
      </div>

      <div className="gallery-row-wrapper">
        <div className="gallery-container">
          {GALLERY_ITEMS.slice(0, 6).map((item, index) => (
            <div 
              key={index}
              className={`gallery-box box-${index + 1}`}
              style={{ backgroundImage: `url(${item.img})` }}
              data-text={item.text}
            ></div>
          ))}
        </div>

        <div className="gallery-container">
          {GALLERY_ITEMS.slice(6, 12).map((item, index) => (
            <div 
              key={index + 6}
              className={`gallery-box box-${index + 1}`}
              style={{ backgroundImage: `url(${item.img})` }}
              data-text={item.text}
            ></div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
