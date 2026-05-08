import { useRef, useEffect, useState } from 'react';

/**
 * RetroGrid – Animated perspective grid background
 * Ported from Framer's RetroGrid component (no Framer dependencies)
 */
const RetroGrid = ({
  angle = 65,
  cellSize = 60,
  opacity = 0.5,
  lineColor = '#6d6e71',
  backgroundColor = 'transparent',
  animationSpeed = 5,
  perspective = 200,
  fadeHeight = 90,
  fadeColor = '#1C130D',
  animationDirection = 'both',
  gridType = 'standard',
  style = {},
}) => {
  const gridRef = useRef(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [clickedCell, setClickedCell] = useState(null);

  // Inject animation keyframes
  useEffect(() => {
    const animationName = `gridMove-${Date.now()}`;
    let keyframes = '';

    if (animationDirection === 'horizontal') {
      keyframes = `@keyframes ${animationName} {
        from { background-position: 0 0, 0 0; }
        to { background-position: ${cellSize + 1}px 0, ${cellSize + 1}px 0; }
      }`;
    } else if (animationDirection === 'vertical') {
      keyframes = `@keyframes ${animationName} {
        from { background-position: 0 0, 0 0; }
        to { background-position: 0 ${cellSize + 1}px, 0 ${cellSize + 1}px; }
      }`;
    } else {
      keyframes = `@keyframes ${animationName} {
        from { background-position: 0 0, 0 0; }
        to { background-position: ${cellSize + 1}px ${cellSize + 1}px, ${cellSize + 1}px ${cellSize + 1}px; }
      }`;
    }

    const styleSheet = document.createElement('style');
    styleSheet.innerHTML = keyframes;
    document.head.appendChild(styleSheet);

    if (gridRef.current) {
      gridRef.current.style.animation = `${animationName} ${animationSpeed}s linear infinite`;
    }

    return () => {
      try { document.head.removeChild(styleSheet); } catch (e) {}
    };
  }, [cellSize, animationSpeed, animationDirection]);

  const getGridBackgroundImage = () => {
    if (gridType === 'diamond') {
      const size = cellSize;
      const svg = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
          <polygon points="${size/2},0 ${size},${size/2} ${size/2},${size} 0,${size/2}" 
            fill="none" stroke="${lineColor}" stroke-width="1"/>
        </svg>`
      );
      return `url('data:image/svg+xml,${svg}')`;
    } else if (gridType === 'diagonal') {
      return `repeating-linear-gradient(45deg, ${lineColor}, ${lineColor} 1px, transparent 1px, transparent ${cellSize}px)`;
    } else {
      return `linear-gradient(to right, ${lineColor} 1px, transparent 1px),
              linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)`;
    }
  };

  const containerStyle = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    pointerEvents: 'none',
    perspective: `${perspective}px`,
    opacity,
    backgroundColor,
    ...style,
  };

  const gridWrapperStyle = {
    position: 'absolute',
    inset: 0,
    transform: `rotateX(${angle}deg)`,
    width: '100%',
    height: '100%',
  };

  const gridStyle = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    backgroundImage: getGridBackgroundImage(),
    backgroundRepeat: 'repeat',
    backgroundSize: `${cellSize}px ${cellSize}px`,
    pointerEvents: 'auto',
  };

  const overlayStyle = {
    position: 'absolute',
    inset: 0,
    background: `linear-gradient(to top, ${fadeColor}, transparent ${fadeHeight}%)`,
    pointerEvents: 'none',
  };

  // Cell hover overlay (only for standard grid)
  const renderCellOverlay = () => {
    if (gridType !== 'standard') return null;
    const cell = clickedCell || hoveredCell;
    if (!cell) return null;
    return (
      <div style={{
        position: 'absolute',
        left: cell.col * cellSize,
        top: cell.row * cellSize,
        width: cellSize,
        height: cellSize,
        background: clickedCell ? 'rgba(195, 159, 111, 0.2)' : 'rgba(195, 159, 111, 0.1)',
        borderRadius: 6,
        pointerEvents: 'none',
        transition: 'background 0.2s',
        zIndex: 2,
      }} />
    );
  };

  const handleCellHover = (e) => {
    if (gridType !== 'standard') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setHoveredCell({ col: Math.floor(x / cellSize), row: Math.floor(y / cellSize) });
  };

  const handleCellClick = (e) => {
    if (gridType !== 'standard') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setClickedCell({ col: Math.floor(x / cellSize), row: Math.floor(y / cellSize) });
    setTimeout(() => setClickedCell(null), 300);
  };

  return (
    <div style={containerStyle}>
      <div style={gridWrapperStyle}>
        <div
          style={gridStyle}
          ref={gridRef}
          onMouseMove={handleCellHover}
          onMouseLeave={() => setHoveredCell(null)}
          onClick={handleCellClick}
        />
        {renderCellOverlay()}
      </div>
      <div style={overlayStyle} />
    </div>
  );
};

export default RetroGrid;
