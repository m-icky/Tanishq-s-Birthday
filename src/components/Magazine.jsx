import { createContext, Suspense, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import {
  Bone,
  BoxGeometry,
  CanvasTexture,
  Color,
  Float32BufferAttribute,
  MathUtils,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  TextureLoader,
  Uint16BufferAttribute,
  Vector3,
} from 'three';
import { easing } from 'maath';

/* ─────────────────────────────────────────────
   Context for page state
   ───────────────────────────────────────────── */
const MagazineCtx = createContext({ page: 0, setPage: () => {} });

const MagazineProvider = ({ children }) => {
  const [page, setPage] = useState(0);
  return <MagazineCtx.Provider value={{ page, setPage }}>{children}</MagazineCtx.Provider>;
};

/* ─────────────────────────────────────────────
   Geometry constants – matches Framer component
   ───────────────────────────────────────────── */
const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71;
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

const easingFactor = 0.5;
const easingFactorFold = 0.3;
const insideCurveStrength = 0.18;
const outsideCurveStrength = 0.05;
const turningCurveStrength = 0.09;

/* ─── Shared geometry with bone skinning ─── */
const pageGeometry = new BoxGeometry(PAGE_WIDTH, PAGE_HEIGHT, PAGE_DEPTH, PAGE_SEGMENTS, 2);
pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);

const position = pageGeometry.attributes.position;
const vertex = new Vector3();
const skinIndexes = [];
const skinWeights = [];

for (let i = 0; i < position.count; i++) {
  vertex.fromBufferAttribute(position, i);
  const x = vertex.x;
  const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH));
  const skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;
  skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
  skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
}

pageGeometry.setAttribute('skinIndex', new Uint16BufferAttribute(skinIndexes, 4));
pageGeometry.setAttribute('skinWeight', new Float32BufferAttribute(skinWeights, 4));

const whiteColor = new Color('white');
const pageMaterials = [
  new MeshStandardMaterial({ color: whiteColor }),
  new MeshStandardMaterial({ color: '#111' }),
  new MeshStandardMaterial({ color: whiteColor }),
  new MeshStandardMaterial({ color: whiteColor }),
];

/* ─────────────────────────────────────────────
   Page Component (bone-skinned mesh)
   ───────────────────────────────────────────── */
const Page = ({
  number, frontTex, backTex, page, opened, bookClosed,
  hoverColor = '#C39F6F', baseRoughness = 0.6, bend = 20, ...props
}) => {
  const { setPage } = useContext(MagazineCtx);
  const emissiveColor = useMemo(() => new Color(hoverColor), [hoverColor]);

  const group = useRef(null);
  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);
  const skinnedMeshRef = useRef(null);

  const manualSkinnedMesh = useMemo(() => {
    const bones = [];
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      const bone = new Bone();
      bones.push(bone);
      if (i === 0) bone.position.x = 0;
      else bone.position.x = SEGMENT_WIDTH;
      if (i > 0) bones[i - 1].add(bone);
    }
    const skeleton = new Skeleton(bones);
    const materials = [
      ...pageMaterials,
      new MeshStandardMaterial({
        color: whiteColor, map: frontTex, roughness: baseRoughness,
        emissive: emissiveColor, emissiveIntensity: 0,
      }),
      new MeshStandardMaterial({
        color: whiteColor, map: backTex, roughness: baseRoughness,
        emissive: emissiveColor, emissiveIntensity: 0,
      }),
    ];
    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, [frontTex, backTex]);

  const [highlighted, setHighlighted] = useState(false);

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) return;

    const emissiveIntensity = highlighted ? 0.22 : 0;
    const mats = skinnedMeshRef.current.material;
    mats[4].emissiveIntensity = mats[5].emissiveIntensity = MathUtils.lerp(
      mats[4].emissiveIntensity || 0, emissiveIntensity, 0.1
    );

    if (lastOpened.current !== opened) {
      turnedAt.current = Date.now();
      lastOpened.current = opened;
    }

    let turningTime = Math.min(400, Date.now() - turnedAt.current) / 400;
    turningTime = Math.sin(turningTime * Math.PI);

    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    if (!bookClosed) targetRotation += MathUtils.degToRad(number * 0.8);

    const bones = skinnedMeshRef.current.skeleton.bones;
    for (let i = 0; i < 10 + bend; i++) {
      const target = i === 0 ? group.current : bones[i];
      if (!target) continue;

      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      const turningIntensity = Math.sin(i * Math.PI * (1 / bones.length)) * turningTime;

      let rotationAngle =
        insideCurveStrength * insideCurveIntensity * targetRotation -
        outsideCurveStrength * outsideCurveIntensity * targetRotation +
        turningCurveStrength * turningIntensity * targetRotation;

      let foldRotationAngle = MathUtils.degToRad(Math.sign(targetRotation) * 2);

      if (bookClosed) {
        if (i === 0) { rotationAngle = targetRotation; foldRotationAngle = 0; }
        else { rotationAngle = 0; foldRotationAngle = 0; }
      }

      easing.dampAngle(target.rotation, 'y', rotationAngle, easingFactor, delta);

      const foldIntensity = i > 8
        ? Math.sin(i * Math.PI * (1 / bones.length) - 0.5) * turningTime
        : 0;
      easing.dampAngle(target.rotation, 'x', foldRotationAngle * foldIntensity, easingFactorFold, delta);
    }
  });

  return (
    <group
      {...props}
      ref={group}
      onPointerEnter={(e) => { e.stopPropagation(); setHighlighted(true); }}
      onPointerLeave={(e) => { e.stopPropagation(); setHighlighted(false); }}
      onClick={(e) => {
        e.stopPropagation();
        setPage(opened ? number : number + 1);
        setHighlighted(false);
      }}
    >
      <primitive
        object={manualSkinnedMesh}
        ref={skinnedMeshRef}
        position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH}
      />
    </group>
  );
};

/* ─────────────────────────────────────────────
   Book Component
   ───────────────────────────────────────────── */
const Book = ({ pages, textures, bend = 20 }) => {
  const { page } = useContext(MagazineCtx);
  const [delayedPage, setDelayedPage] = useState(page);

  useEffect(() => {
    let timeout;
    const goToPage = () => {
      setDelayedPage((prev) => {
        if (page === prev) return prev;
        timeout = setTimeout(goToPage, Math.abs(page - prev) > 2 ? 50 : 150);
        return page > prev ? prev + 1 : prev - 1;
      });
    };
    goToPage();
    return () => clearTimeout(timeout);
  }, [page]);

  return (
    <group rotation-y={-Math.PI / 2}>
      {pages.map((pageData, index) => (
        <Page
          key={index}
          page={delayedPage}
          number={index}
          opened={delayedPage > index}
          bookClosed={delayedPage === 0 || delayedPage === pages.length}
          frontTex={textures[pageData.frontIdx]}
          backTex={textures[pageData.backIdx]}
          hoverColor="#C39F6F"
          baseRoughness={0.6}
          bend={bend}
        />
      ))}
    </group>
  );
};

/* ─────────────────────────────────────────────
   Studio Lighting (matches Framer setup)
   ───────────────────────────────────────────── */
const StudioLighting = () => (
  <group>
    <directionalLight
      position={[2, 5, 2]}
      intensity={1.8}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-bias={-0.0001}
      color="#ffffff"
    />
    <ambientLight intensity={0.5} color="#f5f5f5" />
    <pointLight position={[3, 4, 3]} intensity={0.8} distance={8} decay={1} color="#ffffff" />
    <pointLight position={[-3, 4, -2]} intensity={0.5} distance={8} decay={1} color="#fff8f0" />
  </group>
);

/* ─────────────────────────────────────────────
   Page Navigation UI
   ───────────────────────────────────────────── */
const PageNav = ({ totalPages }) => {
  const { page, setPage } = useContext(MagazineCtx);
  return (
    <div className="magazine-page-nav">
      {[...Array(totalPages + 1)].map((_, i) => (
        <button
          key={i}
          className={`magazine-page-dot ${page === i ? 'active' : ''}`}
          onClick={() => setPage(i)}
          aria-label={`Go to page ${i}`}
        />
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Image URLs for magazine pages
   ───────────────────────────────────────────── */
const MAGAZINE_URLS = [
  'https://picsum.photos/seed/tanishq-cover/1024/1536',
  'https://picsum.photos/seed/tanishq-p1/1024/1536',
  'https://picsum.photos/seed/tanishq-p2/1024/1536',
  'https://picsum.photos/seed/tanishq-p3/1024/1536',
  'https://picsum.photos/seed/tanishq-p4/1024/1536',
  'https://picsum.photos/seed/tanishq-p5/1024/1536',
  'https://picsum.photos/seed/tanishq-p6/1024/1536',
  'https://picsum.photos/seed/tanishq-p7/1024/1536',
  'https://picsum.photos/seed/tanishq-p8/1024/1536',
  'https://picsum.photos/seed/tanishq-p9/1024/1536',
  'https://picsum.photos/seed/tanishq-p10/1024/1536',
  'https://picsum.photos/seed/tanishq-p11/1024/1536',
  'https://picsum.photos/seed/tanishq-back/1024/1536',
];

const generatePages = (count) => {
  const pages = [{ frontIdx: 0, backIdx: 1 }];
  for (let i = 2; i < count - 2; i += 2) {
    pages.push({ frontIdx: i, backIdx: i + 1 });
  }
  pages.push({ frontIdx: count - 2, backIdx: count - 1 });
  return pages;
};

/* ─────────────────────────────────────────────
   Scene wrapper (rendered inside Canvas)
   ───────────────────────────────────────────── */
const MagazineScene = ({ textures, onReady }) => {
  const pages = useMemo(() => generatePages(textures.length), [textures.length]);

  useEffect(() => { onReady(); }, []);

  return (
    <>
      <PerspectiveCamera makeDefault position={[-0.5, 1, 4]} fov={45} zoom={1.2} />

      <group position-y={0}>
        <Float rotation-x={-Math.PI / 5} floatIntensity={1} speed={2} rotationIntensity={2}>
          <Book pages={pages} textures={textures} bend={20} />
        </Float>

        <OrbitControls enablePan={false} enableZoom={false} enableRotate={true} />
        <StudioLighting />

        <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <shadowMaterial transparent opacity={0.2} />
        </mesh>
      </group>
    </>
  );
};

/* ─────────────────────────────────────────────
   Helper: load image as texture via HTML Image
   (avoids Three.js TextureLoader CORS issues)
   ───────────────────────────────────────────── */
function loadImageTexture(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const tex = new CanvasTexture(img);
      tex.colorSpace = SRGBColorSpace;
      tex.needsUpdate = true;
      resolve(tex);
    };
    img.onerror = () => {
      // Fallback: warm-toned canvas placeholder
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 768;
      const ctx = canvas.getContext('2d');
      const hue = 25 + Math.random() * 20;
      ctx.fillStyle = `hsl(${hue}, 35%, 82%)`;
      ctx.fillRect(0, 0, 512, 768);
      ctx.fillStyle = `hsl(${hue}, 30%, 65%)`;
      ctx.font = 'bold 64px serif';
      ctx.textAlign = 'center';
      ctx.fillText('✦', 256, 420);
      const tex = new CanvasTexture(canvas);
      tex.colorSpace = SRGBColorSpace;
      resolve(tex);
    };
    img.src = url;
  });
}

/* ─────────────────────────────────────────────
   Generate premium FRONT COVER texture
   ───────────────────────────────────────────── */
function createCoverTexture() {
  const W = 1024, H = 1536;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Rich dark background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1C130D');
  bg.addColorStop(0.5, '#2A1F16');
  bg.addColorStop(1, '#1C130D');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle radial glow in center
  const glow = ctx.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, W * 0.6);
  glow.addColorStop(0, 'rgba(195, 159, 111, 0.08)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Gold border inset
  const inset = 50;
  ctx.strokeStyle = 'rgba(195, 159, 111, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2);

  // Inner decorative border
  ctx.strokeStyle = 'rgba(195, 159, 111, 0.15)';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(inset + 12, inset + 12, W - (inset + 12) * 2, H - (inset + 12) * 2);

  // Corner decorations
  const cornerSize = 30;
  const corners = [
    [inset + 4, inset + 4],
    [W - inset - 4, inset + 4],
    [inset + 4, H - inset - 4],
    [W - inset - 4, H - inset - 4],
  ];
  ctx.strokeStyle = 'rgba(195, 159, 111, 0.5)';
  ctx.lineWidth = 1.5;
  corners.forEach(([cx, cy], i) => {
    const dx = i % 2 === 0 ? 1 : -1;
    const dy = i < 2 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(cx + dx * cornerSize, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + dy * cornerSize);
    ctx.stroke();
  });

  // Top decorative star
  ctx.fillStyle = 'rgba(195, 159, 111, 0.6)';
  ctx.font = '36px serif';
  ctx.textAlign = 'center';
  ctx.fillText('✦', W / 2, inset + 80);

  // "HAPPY BIRTHDAY" label
  ctx.fillStyle = 'rgba(195, 159, 111, 0.7)';
  ctx.font = '600 28px sans-serif';
  ctx.letterSpacing = '12px';
  ctx.textAlign = 'center';
  ctx.fillText('H A P P Y   B I R T H D A Y', W / 2, H * 0.28);

  // Decorative line under label
  ctx.strokeStyle = 'rgba(195, 159, 111, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W * 0.25, H * 0.30);
  ctx.lineTo(W * 0.75, H * 0.30);
  ctx.stroke();

  // Main name "TANISHQ"
  ctx.fillStyle = '#FCFAF7';
  ctx.font = '300 120px serif';
  ctx.textAlign = 'center';
  ctx.fillText('TANISHQ', W / 2, H * 0.44);

  // Decorative diamond divider
  ctx.fillStyle = 'rgba(195, 159, 111, 0.5)';
  ctx.font = '20px serif';
  ctx.fillText('◆  ◆  ◆', W / 2, H * 0.49);

  // Subtitle "THE FIRST YEAR"
  ctx.fillStyle = 'rgba(195, 159, 111, 0.8)';
  ctx.font = '300 32px sans-serif';
  ctx.fillText('T H E   F I R S T   Y E A R', W / 2, H * 0.55);

  // Date
  ctx.fillStyle = 'rgba(252, 250, 247, 0.5)';
  ctx.font = '300 26px serif';
  ctx.fillText('30th May 2026', W / 2, H * 0.62);

  // Bottom decorative star
  ctx.fillStyle = 'rgba(195, 159, 111, 0.4)';
  ctx.font = '24px serif';
  ctx.fillText('✦', W / 2, H - inset - 55);

  // Bottom text
  ctx.fillStyle = 'rgba(252, 250, 247, 0.3)';
  ctx.font = '300 16px sans-serif';
  ctx.fillText('A  C E L E B R A T I O N  O F  L O V E', W / 2, H - inset - 25);

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/* ─────────────────────────────────────────────
   Generate premium BACK COVER texture
   ───────────────────────────────────────────── */
function createBackCoverTexture() {
  const W = 1024, H = 1536;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Dark background matching front
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1C130D');
  bg.addColorStop(0.5, '#241A12');
  bg.addColorStop(1, '#1C130D');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle glow
  const glow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.5);
  glow.addColorStop(0, 'rgba(195, 159, 111, 0.05)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Gold border
  ctx.strokeStyle = 'rgba(195, 159, 111, 0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 50, W - 100, H - 100);

  // Monogram "T" with star
  ctx.fillStyle = 'rgba(195, 159, 111, 0.6)';
  ctx.font = '300 100px serif';
  ctx.textAlign = 'center';
  ctx.fillText('T', W / 2, H * 0.45);

  ctx.font = '28px serif';
  ctx.fillText('✦', W / 2, H * 0.50);

  // "TO BE CONTINUED..."
  ctx.fillStyle = 'rgba(252, 250, 247, 0.35)';
  ctx.font = '300 20px sans-serif';
  ctx.fillText('T O   B E   C O N T I N U E D . . .', W / 2, H * 0.58);

  // Bottom text
  ctx.fillStyle = 'rgba(252, 250, 247, 0.2)';
  ctx.font = '300 14px sans-serif';
  ctx.fillText('M A D E   W I T H   ♥', W / 2, H - 80);

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/* ─────────────────────────────────────────────
   Main Magazine Component
   ───────────────────────────────────────────── */
const Magazine = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [textures, setTextures] = useState(null);
  const pages = useMemo(() => generatePages(MAGAZINE_URLS.length), []);

  // Load all textures: canvas covers + image pages
  useEffect(() => {
    const coverFront = createCoverTexture();
    const coverBack = createBackCoverTexture();

    // Load inner page images, then combine with covers
    Promise.all(MAGAZINE_URLS.slice(1, -1).map(loadImageTexture)).then((pageTextures) => {
      setTextures([coverFront, ...pageTextures, coverBack]);
    });
  }, []);

  return (
    <section id="magazine">
      <div className="magazine-header" id="magHeader">
        <span className="section-label">Birthday Edition</span>
        <h2 className="mag-title">
          The <em style={{ color: 'var(--dusty-rose)' }}>First Year</em> Magazine
        </h2>
        <p className="mag-subtitle">
          Click on pages to flip through Tanishq's wonderful first year
        </p>
      </div>

      <MagazineProvider>
        <div className="magazine-3d-wrapper">
          {(isLoading || !textures) && (
            <div className="magazine-loader">
              <div className="magazine-loader-ring" />
              <span className="magazine-loader-text">Loading 3D Magazine…</span>
            </div>
          )}

          {textures && (
            <Canvas
              shadows
              resize={{ offsetSize: true }}
              gl={{
                antialias: true,
                powerPreference: 'high-performance',
                precision: 'mediump',
                depth: true,
              }}
              dpr={[1, 2]}
              style={{ cursor: 'grab' }}
            >
              <Suspense fallback={null}>
                <MagazineScene textures={textures} onReady={() => setIsLoading(false)} />
              </Suspense>
            </Canvas>
          )}

          <PageNav totalPages={pages.length} />
        </div>
      </MagazineProvider>
    </section>
  );
};

export default Magazine;
