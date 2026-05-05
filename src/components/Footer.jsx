import { useState, useEffect } from 'react';

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
  <footer>
    <strong>Tanishq GM ✦</strong>
    <span>One year old · 30 May 2026</span>
    <br/><br/>
    <span>With love, Manu & Gouri</span>
  </footer>
);

export { ProgressBar, Footer };
