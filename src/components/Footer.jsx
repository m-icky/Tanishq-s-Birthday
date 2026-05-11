import { useState, useEffect } from 'react';
import footerImg from '../assets/footer.png';

const ProgressBar = () => {
  const [scrolled, setScrolled] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return <div className="progress-bar" style={{ width: `${scrolled}%` }}></div>;
};

const Footer = () => (
  <footer className="footer-container">
    <div className="footer-div">
      <img src={footerImg} alt="Footer illustration" className="footer-bg-image" />
      <div className="footer-content">
        <strong className="footer-title">TanishQ GM</strong>
        <span className="footer-subtitle">One year old · 30 May 2026</span>
        <span className="footer-message">With love, Manu & Gouri</span>
      </div>
      <a href="https://iam-naveen.vercel.app" target="_blank" rel="noopener noreferrer" className="footer-link">Designed & Developed by Mack's.Studio</a>
    </div>
  </footer>
);

export { ProgressBar, Footer };
