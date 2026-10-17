import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Small cursor-reactive WebGL accent for the hero. */
export default function HeroCanvas({ onReady }) {
  const hostRef = useRef(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      onReadyRef.current?.();
      return undefined;
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      onReadyRef.current?.();
      return undefined;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 30);
    camera.position.z = 7;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    host.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(1.55, 5);
    const position = geometry.attributes.position;
    const basePositions = position.array.slice();
    const material = new THREE.MeshBasicMaterial({
      color: 0xc8ac77,
      wireframe: true,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(1.12, 0.88, 0.65);
    scene.add(mesh);
    let scrollTween;
    let scaleTween;
    if (!reducedMotion) {
      scrollTween = gsap.to(mesh.rotation, {
        z: 0.82,
        scrollTrigger: {
          trigger: host.closest("#home") || host,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });
      scaleTween = gsap.to(mesh.scale, {
        x: 1.34,
        y: 1.04,
        scrollTrigger: {
          trigger: host.closest("#home") || host,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });
    }

    const pointer = new THREE.Vector2();
    const smoothPointer = new THREE.Vector2();
    let frame = 0;
    let didSignalReady = false;
    let visible = !document.hidden;
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const onPointerMove = (event) => {
      const rect = host.getBoundingClientRect();
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
      const t = time * 0.00045;
      if (!reducedMotion) {
        smoothPointer.lerp(pointer, 0.035);
        mesh.rotation.y += (smoothPointer.x * 0.28 - mesh.rotation.y) * 0.025 + 0.0015;
        mesh.rotation.x += (smoothPointer.y * 0.2 - mesh.rotation.x) * 0.025;
        const amplitude = 0.055;
        for (let i = 0; i < position.count; i += 1) {
          const x = basePositions[i * 3];
          const y = basePositions[i * 3 + 1];
          const z = basePositions[i * 3 + 2];
          const wave = Math.sin(x * 2.2 + t) * Math.cos(y * 1.8 - t * 0.8) * amplitude;
          const scale = 1 + wave;
          position.setXYZ(i, x * scale, y * scale, z * scale);
        }
        position.needsUpdate = true;
        geometry.computeVertexNormals();
      }
      renderer.render(scene, camera);
      if (!didSignalReady) {
        didSignalReady = true;
        onReadyRef.current?.();
      }
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      geometry.dispose();
      material.dispose();
      scrollTween?.scrollTrigger?.kill();
      scaleTween?.scrollTrigger?.kill();
      scrollTween?.kill();
      scaleTween?.kill();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className="hero-canvas" aria-hidden="true" />;
}
