import * as THREE from 'three';

/** A quiet, scroll-linked WebGL stage behind the entire portfolio. */
export function initPortfolioWorld({ reducedMotion = false } = {}) {
  if (!document.body || !window.WebGLRenderingContext) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (error) {
    console.warn('WebGL is unavailable; the portfolio will use its CSS background.', error);
    return null;
  }

  const canvas = renderer.domElement;
  canvas.className = 'portfolio-world-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x06090a, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070a0b, 0.012);
  const camera = new THREE.PerspectiveCamera(43, window.innerWidth / window.innerHeight, 0.1, 140);
  camera.position.set(0, 0, 20);

  scene.add(new THREE.AmbientLight(0xd8d2c3, 1.05));
  const goldLight = new THREE.PointLight(0xd8ad68, 78, 32, 2);
  goldLight.position.set(-6, 4, 6);
  scene.add(goldLight);
  const tealLight = new THREE.PointLight(0x6b9b92, 58, 28, 2);
  tealLight.position.set(7, -8, -2);
  scene.add(tealLight);

  const gold = new THREE.MeshStandardMaterial({ color: 0xd8bd87, metalness: 0.82, roughness: 0.26, emissive: 0x251707, emissiveIntensity: 0.58 });
  const teal = new THREE.MeshStandardMaterial({ color: 0x7caaa1, metalness: 0.72, roughness: 0.3, emissive: 0x071b1a, emissiveIntensity: 0.5 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x9caa9f, metalness: 0.42, roughness: 0.2, clearcoat: 0.72, transparent: true, opacity: 0.36, side: THREE.DoubleSide });
  const wireGold = new THREE.MeshBasicMaterial({ color: 0xe3c486, wireframe: true, transparent: true, opacity: 0.3 });
  const world = new THREE.Group();
  scene.add(world);

  const anchors = [];
  const anchorY = [4, -5, -14, -23, -32, -41, -50];
  anchorY.forEach((y, index) => {
    const group = new THREE.Group();
    const side = index % 2 === 0 ? 1 : -1;
    group.position.set(side * (window.innerWidth < 700 ? 3.1 : index % 3 === 0 ? 5.3 : 4.5), y, -4.5);
    group.rotation.set(0.28 + index * 0.14, 0.25, side * 0.16);
    if (window.innerWidth < 700) group.scale.setScalar(0.74);
    world.add(group);

    const crystalGeometry = new THREE.IcosahedronGeometry(index % 2 === 0 ? 1.55 : 1.2, 1);
    const crystal = new THREE.Mesh(crystalGeometry, glass);
    group.add(crystal);
    const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(index % 2 === 0 ? 1.58 : 1.23, 1), wireGold);
    group.add(wire);

    const orbit = new THREE.Mesh(
      new THREE.TorusGeometry(index % 2 === 0 ? 2.5 : 2.05, 0.018, 6, 112),
      index % 2 === 0 ? gold : teal,
    );
    orbit.rotation.set(0.72 + index * 0.16, 0.15, -0.42);
    group.add(orbit);
    const secondOrbit = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.009, 5, 96), wireGold);
    secondOrbit.rotation.set(1.1, 0.88, 0.3);
    group.add(secondOrbit);

    const satellite = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), index % 2 === 0 ? gold : teal);
    satellite.position.set(2.5, 0, 0);
    orbit.add(satellite);
    anchors.push({ group, crystal, wire, orbit, secondOrbit, phase: index * 0.82, y, side, index });
  });

  // Fine stars and dust form a deep field that glides past as the camera follows the page.
  const particleCount = window.innerWidth < 700 ? 280 : 520;
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  for (let i = 0; i < particleCount; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 28;
    positions[i * 3 + 1] = 9 - Math.random() * 68;
    positions[i * 3 + 2] = -12 + Math.random() * 18;
    sizes[i] = 0.45 + Math.random() * 1.5;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  dustGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: 0xc8b488, size: 0.055, transparent: true, opacity: 0.57, sizeAttenuation: true, depthWrite: false }));
  world.add(dust);

  const pointer = new THREE.Vector2();
  const cameraTarget = new THREE.Vector3();
  let scrollProgress = 0;
  let frame = 0;
  let lastTime = 0;
  let pageVisible = !document.hidden;

  const updateScroll = () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollProgress = THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1);
  };
  const onPointerMove = (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
  };
  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
    renderer.setSize(window.innerWidth, window.innerHeight);
    anchors.forEach(({ group, side, index }) => {
      group.position.x = side * (window.innerWidth < 700 ? 3.1 : index % 3 === 0 ? 5.3 : 4.5);
      group.scale.setScalar(window.innerWidth < 700 ? 0.74 : 1);
    });
    updateScroll();
  };
  const onVisibility = () => { pageVisible = !document.hidden; };
  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  updateScroll();

  const render = (time = 0) => {
    frame = requestAnimationFrame(render);
    if (!pageVisible) return;
    const dt = Math.min((time - lastTime) / 1000 || 0.016, 0.04);
    lastTime = time;

    const travel = reducedMotion ? 0 : scrollProgress * 54;
    cameraTarget.set(reducedMotion ? 0 : pointer.x * 0.72, -travel + (reducedMotion ? 0 : pointer.y * 0.42), 20);
    camera.position.lerp(cameraTarget, reducedMotion ? 1 : 0.055);
    camera.lookAt(reducedMotion ? 0 : pointer.x * 0.3, -travel, -4);

    if (!reducedMotion) {
      const timeSeconds = time * 0.001;
      anchors.forEach(({ group, crystal, wire, orbit, secondOrbit, phase, y }) => {
        const nearCamera = Math.abs(y + travel) < 16;
        const influence = nearCamera ? 1 : 0.45;
        group.rotation.y += dt * 0.13 * influence;
        group.rotation.x = 0.28 + Math.sin(timeSeconds * 0.34 + phase) * 0.09;
        crystal.rotation.y -= dt * 0.08 * influence;
        wire.rotation.y += dt * 0.12 * influence;
        orbit.rotation.z += dt * 0.08 * influence;
        secondOrbit.rotation.x += dt * 0.1 * influence;
        const pulse = 1 + Math.sin(timeSeconds * 0.72 + phase) * 0.035;
        crystal.scale.setScalar(pulse);
        wire.scale.setScalar(pulse * 1.015);
      });
      dust.rotation.y = Math.sin(timeSeconds * 0.08) * 0.045 + pointer.x * 0.025;
      dust.rotation.z = pointer.y * 0.012;
      goldLight.position.x = -6 + pointer.x * 2;
      tealLight.position.x = 7 + pointer.x * 1.5;
    }
    renderer.render(scene, camera);
  };
  render();

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', updateScroll);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    world.traverse((object) => {
      object.geometry?.dispose();
      if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
      else object.material?.dispose();
    });
    renderer.dispose();
    canvas.remove();
  };
}
