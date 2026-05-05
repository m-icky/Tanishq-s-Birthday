import { useState, useLayoutEffect } from 'react';
import gsap from 'gsap';

const Magazine = () => {
  const [flippedPages, setFlippedPages] = useState(new Set());
  const [isBookOpen, setIsBookOpen] = useState(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo("#magHeader", { opacity: 0, y: 30 }, {
        scrollTrigger: { trigger: "#magazine", start: "top 80%" },
        opacity: 1, y: 0, duration: 0.9, ease: "power3.out"
      });
      gsap.fromTo(".magazine-container", { opacity: 0, scale: 0.95 }, {
        scrollTrigger: { trigger: "#magazine", start: "top 70%" },
        opacity: 1, scale: 1, duration: 1.2, ease: "power3.out"
      });
    });
    return () => ctx.revert();
  }, []);

  const handlePageClick = (index) => {
    const newFlipped = new Set(flippedPages);
    if (newFlipped.has(index)) {
      newFlipped.delete(index);
    } else {
      newFlipped.add(index);
    }
    
    setFlippedPages(newFlipped);
    setIsBookOpen(newFlipped.size > 0);
  };

  const pages = [
    { frontTitle: "TANISHQ", frontSub: "THE FIRST YEAR", frontDate: "EST. MAY 2025", backImg: "https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800&q=80" },
    { frontImg: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80", backImg: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80" },
    { frontImg: "https://images.unsplash.com/photo-1519612244426-475f6e67fb1e?w=800&q=80", backImg: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&q=80" },
    { frontImg: "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=800&q=80", backImg: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80" },
    { frontImg: "https://images.unsplash.com/photo-1556012018-50c5c0da73bf?w=800&q=80", backImg: "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=800&q=80" },
    { frontImg: "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=800&q=80", backImg: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80" },
    { frontImg: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=800&q=80", backCover: true }
  ];

  return (
    <section id="magazine">
      <div className="magazine-header" id="magHeader">
        <span className="section-label">Birthday Edition</span>
        <h2 className="mag-title">The <em style={{color:'var(--dusty-rose)'}}>First Year</em> Magazine</h2>
        <p>Flip through the pages of Tanishq's wonderful first year.</p>
      </div>

      <div className="magazine-container">
        <div className={`book ${isBookOpen ? 'open' : ''}`}>
          {pages.map((page, i) => (
            <div 
              key={i} 
              className={`page ${flippedPages.has(i) ? 'flipped' : ''}`}
              style={{ '--z': pages.length - i, '--fz': pages.length + i }}
              onClick={() => handlePageClick(i)}
            >
              <div className={`page-front ${i === 0 ? 'cover-front' : ''}`}>
                <div className="page-content">
                  {i === 0 ? (
                    <>
                      <div className="magazine-title">{page.frontTitle}</div>
                      <div className="magazine-subtitle">{page.frontSub}</div>
                      <div className="magazine-date">{page.frontDate}</div>
                      <div className="magazine-tap">Click to Open</div>
                    </>
                  ) : (
                    <div className="mag-photo-full"><img src={page.frontImg} alt={`Page ${i} front`} /></div>
                  )}
                </div>
              </div>
              <div className={`page-back ${page.backCover ? 'cover-back' : ''}`}>
                <div className="page-content">
                  {page.backCover ? (
                    <>
                      <div className="magazine-title-small">T✦</div>
                      <div className="magazine-footer">TO BE CONTINUED...</div>
                    </>
                  ) : (
                    <div className="mag-photo-full"><img src={page.backImg} alt={`Page ${i} back`} /></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Magazine;
