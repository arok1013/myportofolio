import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const GOLD = 0xc8ac77;
const RADIUS = 1.55;

function addLatitudeLongitude(group) {
  const material = new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.22, depthWrite: false });
  const addRing = (points) => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.LineLoop(geometry, material);
    group.add(line);
  };

  // Fine spherical parallels and meridians give the form a clear digital-globe silhouette.
  for (let latitude = -60; latitude <= 60; latitude += 30) {
    const phi = THREE.MathUtils.degToRad(latitude);
    const ringRadius = RADIUS * Math.cos(phi);
    const y = RADIUS * Math.sin(phi);
    const points = Array.from({ length: 96 }, (_, i) => {
      const angle = (i / 96) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(angle) * ringRadius, y, Math.sin(angle) * ringRadius);
    });
    addRing(points);
  }
  for (let longitude = 0; longitude < 180; longitude += 30) {
    const theta = THREE.MathUtils.degToRad(longitude);
    const points = Array.from({ length: 65 }, (_, i) => {
      const phi = -Math.PI / 2 + (i / 64) * Math.PI;
      return new THREE.Vector3(
        RADIUS * Math.cos(phi) * Math.cos(theta),
        RADIUS * Math.sin(phi),
        RADIUS * Math.cos(phi) * Math.sin(theta),
      );
    });
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
  }
}

function addDataNetwork(group) {
  // Deterministic point distribution with denser arcs suggesting connected regions.
  const points = [];
  const count = 420;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const ring = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    const x = Math.cos(theta) * ring;
    const z = Math.sin(theta) * ring;
    // Softly vary density to form broad, continent-like clusters without a literal map.
    const region = Math.sin(theta * 1.7 + y * 5.5) + Math.cos(theta * 2.4 - y * 3.2);
    if (region > -0.35 || i % 5 === 0) points.push(x * RADIUS * 1.006, y * RADIUS * 1.006, z * RADIUS * 1.006);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  const material = new THREE.PointsMaterial({ color: 0xf1d39b, size: 0.025, transparent: true, opacity: 0.82, sizeAttenuation: true, depthWrite: false });
  group.add(new THREE.Points(geometry, material));

  // Short links connect nearby data nodes into a subtle, triangulated network.
  const linkPositions = [];
  const nodeList = [];
  for (let i = 0; i < points.length; i += 3) nodeList.push(new THREE.Vector3(points[i], points[i + 1], points[i + 2]));
  for (let i = 0; i < nodeList.length; i += 1) {
    let nearest = -1;
    let nearestDistance = 0.23;
    for (let j = i + 1; j < nodeList.length; j += 1) {
      const distance = nodeList[i].distanceTo(nodeList[j]);
      if (distance < nearestDistance) { nearest = j; nearestDistance = distance; }
    }
    if (nearest >= 0) linkPositions.push(...nodeList[i].toArray(), ...nodeList[nearest].toArray());
  }
  const linkGeometry = new THREE.BufferGeometry();
  linkGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linkPositions, 3));
  const linkMaterial = new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.25, depthWrite: false });
  group.add(new THREE.LineSegments(linkGeometry, linkMaterial));
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
    host.appendChild(renderer.domElement);

    const world = new THREE.Group();
    world.rotation.x = -0.16;
    scene.add(world);

    // A spherical triangular shell echoes the supplied reference image.
    const shellGeometry = new THREE.IcosahedronGeometry(RADIUS, 3);
    const shellMaterial = new THREE.MeshBasicMaterial({ color: GOLD, wireframe: true, transparent: true, opacity: 0.45, depthWrite: false });
    world.add(new THREE.Mesh(shellGeometry, shellMaterial));
    addLatitudeLongitude(world);
    addDataNetwork(world);

    // Orbital path and a small moving signal satellite add depth without crowding the hero.
    const orbitPoints = Array.from({ length: 128 }, (_, i) => {
      const angle = (i / 128) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(angle) * 2.02, Math.sin(angle) * 0.52, 0.08);
    });
    const orbitMaterial = new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.2, depthWrite: false });
    world.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(orbitPoints), orbitMaterial));
    const satellite = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffe4ae }));
    world.add(satellite);

    let scrollTween;
    let scaleTween;
    if (!reducedMotion) {
      scrollTween = gsap.to(world.rotation, { z: 0.65, scrollTrigger: { trigger: host.closest("#home") || host, start: "top top", end: "bottom top", scrub: 1.2 } });
      scaleTween = gsap.to(world.scale, { x: 1.12, y: 1.12, z: 1.12, scrollTrigger: { trigger: host.closest("#home") || host, start: "top top", end: "bottom top", scrub: 1.2 } });
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
        satellite.position.set(Math.cos(t) * 2.02, Math.sin(t) * 0.52, 0.08);
        satellite.material.opacity = 0.72 + Math.sin(t * 3) * 0.25;
      }
      renderer.render(scene, camera);
      if (!didSignalReady) { didSignalReady = true; onReadyRef.current?.(); }
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      scrollTween?.scrollTrigger?.kill();
      scaleTween?.scrollTrigger?.kill();
      scrollTween?.kill();
      scaleTween?.kill();
      world.traverse((object) => {
        object.geometry?.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material?.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className="hero-canvas" aria-hidden="true" />;
}
