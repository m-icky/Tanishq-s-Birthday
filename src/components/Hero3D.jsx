import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const Hero3D = () => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 4. Lights
    // Warm soft ambient fill light
    const ambientLight = new THREE.AmbientLight('#FAF6F0', 1.8);
    scene.add(ambientLight);

    // Warm golden key light (shining from front-left-top)
    const keyLight = new THREE.DirectionalLight('#FFF5E6', 2.5);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    // Cool secondary fill light (shining from back-right)
    const fillLight = new THREE.DirectionalLight('#E0F2FE', 1.2);
    fillLight.position.set(-5, -2, -5);
    scene.add(fillLight);

    // Subtle warm point light for shiny accents
    const pointLight = new THREE.PointLight('#C39F6F', 2.0, 10);
    pointLight.position.set(0, 2, 2);
    scene.add(pointLight);

    // 5. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // Disable zooming so it doesn't hijack scroll wheels
    controls.enablePan = false;  // Restrict panning to keep model centered
    controls.minPolarAngle = Math.PI / 4;  // Restrict vertical rotation slightly
    controls.maxPolarAngle = Math.PI / 1.8;

    // 6. Model Group (for centering & self-rotation)
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // 7. GLTF Loader
    const loader = new GLTFLoader();
    let mixer = null;
    const clock = new THREE.Clock();

    loader.load(
      '/baby.glb',
      (gltf) => {
        const model = gltf.scene;

        // Traverse model to configure lighting and premium materials
        model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            
            // Boost texture filter quality
            if (node.material) {
              node.material.roughness = Math.max(node.material.roughness, 0.4); // avoid extreme plastic shine
              if (node.material.map) {
                node.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
              }
            }
          }
        });

        // Compute Bounding Box to perfectly center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center the loaded model inside our group
        model.position.set(-center.x, -center.y, -center.z);
        modelGroup.add(model);

        // Normalize scaling to fit viewport perfectly
        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 3.6 / maxDim; // Standardized height of 3.6 units
        modelGroup.scale.setScalar(scaleFactor);

        // Position the group slightly lower for balance
        modelGroup.position.y = -0.4;

        // Handle Animations if present in the GLB
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
        }

        // Hide loading screen
        setLoading(false);
      },
      (xhr) => {
        if (xhr.total) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          setProgress(percent);
        }
      },
      (error) => {
        console.error('Error loading GLB 3D Model:', error);
        setLoading(false);
      }
    );

    // 8. Animation & Resize loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const delta = clock.getDelta();

      // Update mixer animations
      if (mixer) {
        mixer.update(delta);
      }

      // Idle auto-rotation when user isn't actively dragging
      if (modelGroup && controls.state === -1) {
        modelGroup.rotation.y += 0.003;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Responsive Canvas Resizing
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="hero-3d-wrapper" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div 
        ref={containerRef} 
        style={{ width: '100%', height: '100%' }} 
        title="Drag to rotate, interact with the 3D wonder!"
      />
      
      {/* Premium Elegant Loader */}
      {loading && (
        <div className="hero-3d-loader">
          <div className="loader-ring" />
          <span className="loader-text">Loading wonder...</span>
          <span className="loader-percentage">{progress}%</span>
          <div className="loader-bar-bg">
            <div className="loader-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Hero3D;
