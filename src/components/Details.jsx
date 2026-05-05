import { useLayoutEffect } from 'react';
import gsap from 'gsap';

const Details = () => {
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("#detailsLeft", {
        scrollTrigger: { trigger: "#details", start: "top 70%" },
        x: -50, opacity: 0, duration: 1, ease: "power3.out"
      });
      gsap.from("#detailsRight", {
        scrollTrigger: { trigger: "#details", start: "top 70%" },
        x: 50, opacity: 0, duration: 1, ease: "power3.out"
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section id="details">
      <div className="details-bg-text">30·05</div>
      <div className="details-inner">
        <div className="details-left" id="detailsLeft">
          <span className="section-label">You're invited</span>
          <h2>Come celebrate<br/>the <em style={{color:'var(--dusty-rose)'}}>little one</em></h2>
          <div className="details-photo-stack">
            <div className="details-photo">
              <img src="https://images.unsplash.com/photo-1544126592-807ade215a0b?w=300&q=80" alt="Baby 1" />
            </div>
            <div className="details-photo">
              <img src="https://images.unsplash.com/photo-1519689680058-324335c77eba?w=300&q=80" alt="Baby 2" />
            </div>
            <div className="details-photo">
              <img src="https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=300&q=80" alt="Baby 3" />
            </div>
          </div>
        </div>

        <div className="details-right" id="detailsRight">
          <span className="section-label">Event details</span>
          <ul className="details-info-list">
            <li className="details-info-item">
              <div className="info-icon">
                <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
              <div>
                <span className="info-label">Date & Time</span>
                <span className="info-value">30 May 2026</span>
                <span className="info-sub">4:00 PM onwards</span>
              </div>
            </li>
            <li className="details-info-item">
              <div className="info-icon">
                <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </div>
              <div>
                <span className="info-label">Venue</span>
                <span className="info-value">S.A.V Hall</span>
                <span className="info-sub">Kanayannur, Kerala</span>
              </div>
            </li>
          </ul>
          <div className="map-wrapper">
            <iframe
              src="https://maps.google.com/maps?q=S.A.V+Hall+Kanayannur+Kerala&output=embed"
              allowFullScreen
              loading="lazy"
              title="Venue location"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Details;
