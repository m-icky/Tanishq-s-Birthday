import { useState, useEffect } from 'react';

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', mins: '00', secs: '00' });

  useEffect(() => {
    const target = new Date('2026-05-30T16:00:00');
    
    const interval = setInterval(() => {
      const now = new Date();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: '🎉', hours: '🎂', mins: '🎈', secs: '✨' });
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0'),
        hours: String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0'),
        mins: String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0'),
        secs: String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0')
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="countdown">
      <div className="countdown-bg"></div>
      <h2>Counting down to the big day</h2>
      <p>30 May 2026 · 4:00 PM</p>
      <div className="countdown-grid">
        <div className="countdown-unit">
          <span className="countdown-num">{timeLeft.days}</span>
          <span className="countdown-label">Days</span>
        </div>
        <div className="countdown-unit">
          <span className="countdown-num">{timeLeft.hours}</span>
          <span className="countdown-label">Hours</span>
        </div>
        <div className="countdown-unit">
          <span className="countdown-num">{timeLeft.mins}</span>
          <span className="countdown-label">Minutes</span>
        </div>
        <div className="countdown-unit">
          <span className="countdown-num">{timeLeft.secs}</span>
          <span className="countdown-label">Seconds</span>
        </div>
      </div>
    </section>
  );
};

export default Countdown;
