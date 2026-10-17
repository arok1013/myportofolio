import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import earthImage from "./assets/earth-reference.png";

const CHARACTER_VIDEO = "/media/grn.mp4";

gsap.registerPlugin(ScrollTrigger);

const GOLD = 0xc8ac77;
const RADIUS = 1.55;

function createEarthHemisphere(texture) {
  const divisions = 160;
  const positions = [];
  const uvs = [];
  const indices = [];
  const lookup = Array.from({ length: divisions + 1 }, () => new Int32Array(divisions + 1).fill(-1));

  for (let row = 0; row <= divisions; row += 1) {
    const y = 1 - (row / divisions) * 2;
    for (let column = 0; column <= divisions; column += 1) {
      const x = (column / divisions) * 2 - 1;
      const radiusSquared = x * x + y * y;
      if (radiusSquared > 1) continue;
      lookup[row][column] = positions.length / 3;
      positions.push(x * RADIUS * 1.003, y * RADIUS * 1.003, Math.sqrt(1 - radiusSquared) * RADIUS * 1.003);
      uvs.push((x + 1) * 0.5, (y + 1) * 0.5);
    }
  }

  for (let row = 0; row < divisions; row += 1) {
    for (let column = 0; column < divisions; column += 1) {
      const topLeft = lookup[row][column];
      const topRight = lookup[row][column + 1];
      const bottomLeft = lookup[row + 1][column];
      const bottomRight = lookup[row + 1][column + 1];
      if (topLeft >= 0 && topRight >= 0 && bottomLeft >= 0) indices.push(topLeft, bottomLeft, topRight);
      if (topRight >= 0 && bottomLeft >= 0 && bottomRight >= 0) indices.push(topRight, bottomLeft, bottomRight);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const material = new THREE.MeshPhysicalMaterial({
    map: texture, transparent: true, alphaTest: 0.015, side: THREE.DoubleSide,
    roughness: 0.58, metalness: 0.04, clearcoat: 0.24, depthWrite: true,
  });
  return new THREE.Mesh(geometry, material);
}

function createRocket() {
  const rocket = new THREE.Group();
  const bodyMaterial = new THREE.MeshPhysicalMaterial({ color: 0xf2eee2, metalness: 0.18, roughness: 0.28, clearcoat: 0.72 });
  const goldMaterial = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.58, roughness: 0.26, emissive: 0x593a15, emissiveIntensity: 0.24 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x26413a, metalness: 0.42, roughness: 0.28 });
  rocket.add(new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.11, 0.34, 24), bodyMaterial));
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.22, 24), goldMaterial);
  nose.position.y = 0.27;
  rocket.add(nose);
  const window = new THREE.Mesh(new THREE.SphereGeometry(0.045, 20, 16), darkMaterial);
  window.position.set(0, 0.06, 0.102);
  window.scale.set(1, 1, 0.48);
  rocket.add(window);
  const windowRim = new THREE.Mesh(new THREE.TorusGeometry(0.047, 0.008, 8, 24), goldMaterial);
  windowRim.position.set(0, 0.06, 0.105);
  rocket.add(windowRim);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.086, 0.012, 8, 24), goldMaterial);
  band.rotation.x = Math.PI / 2;
  band.position.y = -0.08;
  rocket.add(band);
  const finShape = new THREE.Shape();
  finShape.moveTo(0, -0.04); finShape.lineTo(0.13, -0.18); finShape.lineTo(0.045, 0.015); finShape.closePath();
  const finGeometry = new THREE.ShapeGeometry(finShape);
  for (let i = 0; i < 3; i += 1) {
    const fin = new THREE.Mesh(finGeometry, goldMaterial);
    fin.position.set(i === 1 ? 0 : (i === 0 ? -0.07 : 0.07), -0.08, i === 1 ? -0.095 : 0.045);
    fin.rotation.y = i * (Math.PI * 2 / 3);
    rocket.add(fin);
  }
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.1, 16), darkMaterial);
  nozzle.position.y = -0.21;
  rocket.add(nozzle);
  const flameMaterial = new THREE.MeshBasicMaterial({ color: 0xffa45d, transparent: true, opacity: 0.85, depthWrite: false });
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.2, 16), flameMaterial);
  flame.position.y = -0.34;
  flame.rotation.z = Math.PI;
  rocket.add(flame);
  return { group: rocket, flame };
}

function createGreenScreenVideo(video) {
  const width = 288;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  let lastFrameTime = -1;

  const update = (time) => {
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || time === lastFrameTime) return;
    lastFrameTime = time;
    context.drawImage(video, 0, 0, width, height);
    const frame = context.getImageData(0, 0, width, height);
    const pixels = frame.data;
    for (let offset = 0; offset < pixels.length; offset += 4) {
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const dominance = green - Math.max(red, blue);
      if (green > 55 && dominance > 42) {
        pixels[offset + 3] = 0;
      } else if (green > 48 && dominance > 16) {
        pixels[offset + 3] *= 1 - (dominance - 16) / 26;
        pixels[offset] = Math.min(255, red + (green - red) * 0.35);
        pixels[offset + 2] = Math.min(255, blue + (green - blue) * 0.35);
      }
    }
    context.putImageData(frame, 0, 0);
    texture.needsUpdate = true;
  };
  return { texture, update };
}

function createCharacterCutout(texture) {
  const character = new THREE.Group();
  const height = 3.42;
  const width = height * (9 / 16);
  const material = new THREE.MeshBasicMaterial({
    map: texture, transparent: true, alphaTest: 0.025,
    side: THREE.DoubleSide, depthWrite: false, toneMapped: false,
  });
  const figure = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  figure.position.y = height / 2;
  character.add(figure);
  character.position.set(-1.72, -1.78, 0.18);
  return character;
}

/** Interactive digital-world globe for the portfolio hero. */
export default function HeroCanvas({ onReady }) {
  const hostRef = useRef(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) { onReadyRef.current?.(); return undefined; }
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    } catch { onReadyRef.current?.(); return undefined; }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 30);
    camera.position.z = 7;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    host.appendChild(renderer.domElement);

    const world = new THREE.Group();
    world.rotation.x = -0.16;
    world.position.x = 1.12;
    scene.add(world);

    scene.add(new THREE.HemisphereLight(0xe8dfca, 0x27332f, 1.25));
    const keyLight = new THREE.DirectionalLight(0xffe4bd, 2.8);
    keyLight.position.set(-3, 4, 5);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xa8c0b4, 2.4);
    rimLight.position.set(3, 1.5, -3);
    scene.add(rimLight);
    const faceLight = new THREE.PointLight(0xf3c681, 8, 6, 2);
    faceLight.position.set(-1.5, 1.3, 3);
    scene.add(faceLight);
    let loadedTextures = 0;
    let renderedFirstFrame = false;
    let didSignalReady = false;
    const signalReady = () => {
      if (!didSignalReady && loadedTextures === 2 && renderedFirstFrame) {
        didSignalReady = true;
        onReadyRef.current?.();
      }
    };
    const onTextureReady = () => { loadedTextures += 1; signalReady(); };
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(earthImage, onTextureReady, undefined, onTextureReady);
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const characterVideo = document.createElement("video");
    characterVideo.src = CHARACTER_VIDEO;
    characterVideo.muted = true;
    characterVideo.defaultMuted = true;
    characterVideo.volume = 0;
    characterVideo.loop = true;
    characterVideo.autoplay = true;
    characterVideo.playsInline = true;
    characterVideo.preload = "auto";
    const characterTexture = createGreenScreenVideo(characterVideo);
    const character = createCharacterCutout(characterTexture.texture);
    let videoReady = false;
    const markVideoReady = () => {
      if (videoReady) return;
      videoReady = true;
      loadedTextures += 1;
      signalReady();
    };
    characterVideo.addEventListener("loadeddata", markVideoReady, { once: true });
    characterVideo.addEventListener("error", markVideoReady, { once: true });
    characterVideo.play().catch(() => {});
    scene.add(character);

    // The supplied Earth photograph is curved onto a smooth sphere, keeping the continents photoreal and the silhouette fully 3D.
    const globeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x17345c, metalness: 0.12, roughness: 0.46,
      clearcoat: 0.72, clearcoatRoughness: 0.3, emissive: 0x07162b, emissiveIntensity: 0.16,
    });
    const globe = new THREE.Mesh(new THREE.SphereGeometry(RADIUS, 96, 64), globeMaterial);
    globe.add(createEarthHemisphere(earthTexture));
    world.add(globe);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({ color: 0x90c4a2, transparent: true, opacity: 0.075, side: THREE.BackSide, depthWrite: false });
    world.add(new THREE.Mesh(new THREE.SphereGeometry(RADIUS * 1.075, 64, 48), atmosphereMaterial));

    // A slender tilted orbit carries a small detailed rocket around the globe.
    const orbitPlane = new THREE.Group();
    orbitPlane.rotation.set(0.52, -0.12, -0.12);
    world.add(orbitPlane);
    const orbitRadiusX = 2.04;
    const orbitRadiusY = 2.25;
    const orbitPoints = Array.from({ length: 160 }, (_, i) => {
      const angle = (i / 160) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(angle) * orbitRadiusX, Math.sin(angle) * orbitRadiusY, 0);
    });
    const orbitMaterial = new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.25, depthWrite: false });
    orbitPlane.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(orbitPoints), orbitMaterial));
    const { group: rocket, flame } = createRocket();
    const initialOrbitAngle = Math.PI / 2;
    rocket.position.set(Math.cos(initialOrbitAngle) * orbitRadiusX, Math.sin(initialOrbitAngle) * orbitRadiusY, 0);
    rocket.rotation.z = Math.atan2(orbitRadiusY * Math.cos(initialOrbitAngle), -orbitRadiusX * Math.sin(initialOrbitAngle)) - Math.PI / 2;
    orbitPlane.add(rocket);

    let scrollTween;
    let scaleTween;
    if (!reducedMotion) {
      scrollTween = gsap.to(world.rotation, { z: 0.65, scrollTrigger: { trigger: host.closest("#home") || host, start: "top top", end: "bottom top", scrub: 1.2 } });
      scaleTween = gsap.to(world.scale, { x: 1.12, y: 1.12, z: 1.12, scrollTrigger: { trigger: host.closest("#home") || host, start: "top top", end: "bottom top", scrub: 1.2 } });
    }

    const pointer = new THREE.Vector2();
    const smoothPointer = new THREE.Vector2();
    let frame = 0;
    let visible = !document.hidden;
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.position.z = Math.max(7, 7.2 / camera.aspect);
      camera.position.x = 0.4;
      camera.lookAt(0.4, 0, 0);
      const compact = camera.aspect < 1.25;
      world.position.x = compact ? 0.92 : 1.12;
      character.position.x = compact ? -1.55 : -1.72;
      character.scale.setScalar(compact ? 0.9 : 1.08);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const onPointerMove = (event) => {
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -(((event.clientY - rect.top) / rect.height) * 2 - 1));
    };
    const onVisibilityChange = () => { visible = !document.hidden; };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    resize();

    const render = (time) => {
      frame = requestAnimationFrame(render);
      if (!visible) return;
      const t = time * 0.00035;
      if (!reducedMotion) {
        smoothPointer.lerp(pointer, 0.035);
        world.rotation.y += (smoothPointer.x * 0.34 - world.rotation.y) * 0.018 + 0.001;
        world.rotation.x += (-0.16 + smoothPointer.y * 0.2 - world.rotation.x) * 0.018;
        character.rotation.y += (-smoothPointer.x * 0.13 - character.rotation.y) * 0.025;
        character.rotation.x += (smoothPointer.y * 0.035 - character.rotation.x) * 0.025;
        character.rotation.z = Math.sin(t * 1.25) * 0.012;
        character.position.y = -1.78 + Math.sin(t * 1.8) * 0.035;
        globe.rotation.y = Math.sin(t * 0.32) * 0.27;
        globe.rotation.z = Math.sin(t * 0.22) * 0.035;
        const orbitAngle = initialOrbitAngle + t * 1.15;
        const rocketX = Math.cos(orbitAngle) * orbitRadiusX;
        const rocketY = Math.sin(orbitAngle) * orbitRadiusY;
        rocket.position.set(rocketX, rocketY, 0);
        rocket.rotation.z = Math.atan2(orbitRadiusY * Math.cos(orbitAngle), -orbitRadiusX * Math.sin(orbitAngle)) - Math.PI / 2;
        flame.scale.setScalar(0.82 + (Math.sin(t * 12) + 1) * 0.2);
        flame.material.opacity = 0.66 + (Math.sin(t * 12) + 1) * 0.14;
      }
      characterTexture.update(characterVideo.currentTime);
      renderer.render(scene, camera);
      renderedFirstFrame = true;
      signalReady();
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      characterVideo.pause();
      characterVideo.removeAttribute("src");
      characterVideo.load();
      scrollTween?.scrollTrigger?.kill();
      scaleTween?.scrollTrigger?.kill();
      scrollTween?.kill();
      scaleTween?.kill();
      const disposedMaterials = new Set();
      const disposedTextures = new Set();
      scene.traverse((object) => {
        object.geometry?.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          if (!material || disposedMaterials.has(material)) return;
          disposedMaterials.add(material);
          Object.values(material).forEach((value) => {
            if (value?.isTexture && !disposedTextures.has(value)) {
              disposedTextures.add(value);
              value.dispose();
            }
          });
          material.dispose();
        });
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className="hero-canvas" aria-hidden="true" />;
}
