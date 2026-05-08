import { useRef, useEffect, useState } from 'react';

const TOTAL_FRAMES = 160;
const LERP_FACTOR = 0.09; // Lower = silkier/slower, higher = snappier

const ScrollVideo = () => {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const framesRef = useRef([]);
  const framesLoadedRef = useRef(0);
  const framesReadyRef = useRef(false);
  const targetFrameRef = useRef(0);
  const currentFrameRef = useRef(0);
  const lastDrawnFrameRef = useRef(-1);
  const rafIdRef = useRef(null);

  const [loadingPct, setLoadingPct] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  // Pre-load all frames
  useEffect(() => {
    const frames = [];
    let loaded = 0;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `/frames/frame_${String(i).padStart(4, '0')}.jpg`;
      img.onload = () => {
        loaded++;
        framesLoadedRef.current = loaded;
        setLoadingPct(Math.round((loaded / TOTAL_FRAMES) * 100));

        if (loaded === TOTAL_FRAMES) {
          framesReadyRef.current = true;

          // Set canvas to native frame resolution
          const canvas = canvasRef.current;
          if (canvas && frames[0]) {
            canvas.width = frames[0].naturalWidth;
            canvas.height = frames[0].naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(frames[0], 0, 0);
          }

          setIsLoaded(true);
        }
      };
      frames.push(img);
    }

    framesRef.current = frames;
  }, []);

  // Scroll handler — only updates target (cheap math)
  useEffect(() => {
    const handleScroll = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      const total = wrapper.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      const pct = Math.min(1, Math.max(0, scrolled / total));

      targetFrameRef.current = pct * (TOTAL_FRAMES - 1);
      setScrollPct(Math.round(pct * 100));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth render loop (lerp + canvas draw)
  useEffect(() => {
    if (!isLoaded) return;

    const smoothLoop = () => {
      const frames = framesRef.current;
      const canvas = canvasRef.current;
      if (!canvas || !frames.length) return;

      const ctx = canvas.getContext('2d');

      // Lerp toward target
      currentFrameRef.current += (targetFrameRef.current - currentFrameRef.current) * LERP_FACTOR;

      // Round to nearest frame index
      const idx = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(currentFrameRef.current)));

      // Only redraw if frame actually changed
      if (idx !== lastDrawnFrameRef.current && frames[idx] && frames[idx].complete) {
        ctx.drawImage(frames[idx], 0, 0, canvas.width, canvas.height);
        lastDrawnFrameRef.current = idx;
      }

      rafIdRef.current = requestAnimationFrame(smoothLoop);
    };

    smoothLoop();

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isLoaded]);

  return (
    <div id="scrub-wrapper" ref={wrapperRef}>
      <div id="video-scrub">
        <div id="video-wrapper">
          <canvas id="scrub-canvas" ref={canvasRef}></canvas>

          {/* Loading indicator */}
          <div id="frame-loader" className={isLoaded ? 'hidden' : ''}>
            <div className="frame-loader-text">Loading moments...</div>
            <div className="frame-loader-bar">
              <div
                className="frame-loader-fill"
                style={{ width: `${loadingPct}%` }}
              ></div>
            </div>
          </div>

          {/* Vignette overlay */}
          <div className="video-vignette"></div>

          {/* Scroll percentage hint */}
          <div className="video-progress-hint">{scrollPct}%</div>
        </div>
      </div>
    </div>
  );
};

export default ScrollVideo;
