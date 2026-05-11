import { useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform, useMotionValue, useVelocity, useAnimationFrame } from "framer-motion";

function wrap(min, max, v) {
  const rangeSize = max - min;
  return (((v - min) % rangeSize) + rangeSize) % rangeSize + min;
}

function ScrollVelocityRow({ children, baseVelocity = 5, direction = 1, scrollSensitivity = 5 }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  
  // Allow positive + negative scroll influence based on speed and scroll sensitivity
  const velocityFactor = useTransform(
    smoothVelocity,
    [-1000, 1000],
    [-scrollSensitivity, scrollSensitivity],
    { clamp: false }
  );
  
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const directionFactor = useRef(direction);

  useAnimationFrame((t, delta) => {
    const velocity = velocityFactor.get();
    // Base speed movement
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    // Scroll-assisted movement acceleration
    moveBy += directionFactor.current * velocity * (delta / 100);
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div style={{ overflow: "hidden", whiteSpace: "nowrap", display: "flex", width: "100%" }}>
      <motion.div
        style={{ x, display: "flex", whiteSpace: "nowrap" }}
        drag="x"
        dragElastic={0.2}
        dragMomentum={false}
        onDrag={(event, info) => {
          baseX.set(baseX.get() + info.delta.x / 10);
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

// Warm, elegant default images matching the cream/gold/brown color palette
const DEFAULT_ROWA_IMAGES = [
  { src: "https://images.unsplash.com/photo-1544126592-807ade215a0b?w=600&q=80", alt: "The Beginning" },
  { src: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&q=80", alt: "First Smiles" },
  { src: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80", alt: "Tiny Explorer" },
  { src: "https://images.unsplash.com/photo-1519612244426-475f6e67fb1e?w=600&q=80", alt: "Growing Fast" },
  { src: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&q=80", alt: "Little Joy" },
  { src: "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=600&q=80", alt: "Half Way" }
];

const DEFAULT_ROWB_IMAGES = [
  { src: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80", alt: "New Adventures" },
  { src: "https://images.unsplash.com/photo-1556012018-50c5c0da73bf?w=600&q=80", alt: "Curious Soul" },
  { src: "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=600&q=80", alt: "Standing Tall" },
  { src: "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=600&q=80", alt: "Almost There" },
  { src: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&q=80", alt: "Full of Life" },
  { src: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=600&q=80", alt: "One Year!" }
];

export default function VelocityGallery({
  rowAImages = DEFAULT_ROWA_IMAGES,
  rowBImages = DEFAULT_ROWB_IMAGES,
  rowAVelocity = 4,
  rowBVelocity = 4,
  scrollSensitivity = 4,
  imageWidth = 220,
  imageHeight = 150,
  borderRadius = 12,
  gap = 12,
  rowGap = 16,
  showGradients = true,
  gradientColor = "#C38760" // Matches the #hero background color perfectly!
}) {
  const [selectedImage, setSelectedImage] = useState(null);

  const renderImages = (images) =>
    images.map((image, idx) => {
      const imgSrc = typeof image.src === "string" ? image.src : image.src?.src || "";
      const imgAlt = image.alt || `Image ${idx + 1}`;
      return (
        <img
          key={idx}
          src={imgSrc}
          alt={imgAlt}
          width={imageWidth}
          height={imageHeight}
          loading="lazy"
          decoding="async"
          onClick={() => setSelectedImage({ src: imgSrc, alt: imgAlt })}
          style={{
            marginLeft: `${gap}px`,
            marginRight: `${gap}px`,
            display: "inline-block",
            height: `${imageHeight}px`,
            width: `${imageWidth}px`,
            borderRadius: `${borderRadius}px`,
            objectFit: "cover",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
            flexShrink: 0,
            pointerEvents: "auto",
            userSelect: "none",
            cursor: "pointer",
            transition: "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
            filter: "brightness(0.92) contrast(1.02) saturate(0.9)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.filter = "brightness(1) contrast(1.05) saturate(1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1.0)";
            e.currentTarget.style.filter = "brightness(0.92) contrast(1.02) saturate(0.9)";
          }}
        />
      );
    });

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden", padding: "16px 0" }}>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: `${rowGap}px` }}>
        <ScrollVelocityRow baseVelocity={rowAVelocity} direction={1} scrollSensitivity={scrollSensitivity}>
          {renderImages(rowAImages)}
        </ScrollVelocityRow>
        <ScrollVelocityRow baseVelocity={rowBVelocity} direction={-1} scrollSensitivity={scrollSensitivity}>
          {renderImages(rowBImages)}
        </ScrollVelocityRow>
      </div>

      {showGradients && (
        <>
          <div style={{ pointerEvents: "none", position: "absolute", inset: "0 auto 0 0", width: "20%", background: `linear-gradient(to right, ${gradientColor}, transparent)` }} />
          <div style={{ pointerEvents: "none", position: "absolute", inset: "0 0 0 auto", width: "20%", background: `linear-gradient(to left, ${gradientColor}, transparent)` }} />
        </>
      )}

      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedImage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(28, 19, 13, 0.9)", // Warm dark coffee background
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            cursor: "pointer",
            padding: "40px"
          }}
        >
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
            src={selectedImage.src}
            alt={selectedImage.alt}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              objectFit: "contain",
              borderRadius: `${borderRadius * 1.5}px`,
              boxShadow: "0 24px 70px rgba(0,0,0,0.6)",
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: "default"
            }}
          />
        </motion.div>
      )}
    </div>
  );
}
