const PHI = (1 + Math.sqrt(5)) / 2;
const ICO_VERTICES = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
].map(([x, y, z]) => {
  const length = Math.hypot(x, y, z);
  return [x / length, y / length, z / length];
});
const ICO_EDGES = [];
ICO_VERTICES.forEach((a, i) => ICO_VERTICES.slice(i + 1).forEach((b, offset) => {
  if (Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 1.12) ICO_EDGES.push([i, i + offset + 1]);
}));

const rotate = ([x, y, z], rx, ry, rz) => {
  const cx = Math.cos(rx), sx = Math.sin(rx);
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const cz = Math.cos(rz), sz = Math.sin(rz);
  const y1 = y * cx - z * sx, z1 = y * sx + z * cx;
  const x2 = x * cy + z1 * sy, z2 = -x * sy + z1 * cy;
  return [x2 * cz - y1 * sz, x2 * sz + y1 * cz, z2];
};

/** Canvas 3D projection for browsers where WebGL is unavailable or blocked. */
export function initPortfolioWorld({ reducedMotion = false } = {}) {
  const canvas = document.createElement('canvas');
  canvas.className = 'portfolio-world-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) {
    canvas.remove();
    return null;
  }

  const anchors = [4, -5, -14, -23, -32, -41, -50];
  const dust = Array.from({ length: window.innerWidth < 700 ? 150 : 250 }, () => ({
    x: (Math.random() - 0.5) * 26,
    y: 8 - Math.random() * 66,
    z: -15 + Math.random() * 17,
    radius: 0.5 + Math.random() * 1.25,
    phase: Math.random() * Math.PI * 2,
  }));
  const pointer = { x: 0, y: 0 };
  let progress = 0;
  let frame = 0;
  let visible = !document.hidden;
  let width = 0;
  let height = 0;
  let ratio = 1;

  const resize = () => {
    ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    updateScroll();
  };
  const updateScroll = () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
    if (reducedMotion) draw(performance.now());
  };
  const onPointerMove = (event) => {
    pointer.x = (event.clientX / width - 0.5) * 2;
    pointer.y = (event.clientY / height - 0.5) * 2;
  };
  const project = (point, offsetY = 0) => {
    const focalLength = height / (2 * Math.tan(43 * Math.PI / 360));
    const distance = Math.max(2, 20 - point[2]);
    return {
      x: width / 2 + (point[0] - pointer.x * 0.56) * focalLength / distance,
      y: height / 2 - (point[1] + offsetY - pointer.y * 0.3) * focalLength / distance,
      scale: focalLength / distance,
    };
  };

  const drawCrystal = (cx, cy, scale, time, index) => {
    const tint = index % 2 ? '124, 177, 165' : '224, 194, 137';
    const spin = reducedMotion ? 0 : time * 0.00022 + index * 0.82;
    const radius = window.innerWidth < 700 ? 1.08 : 1.45;
    const screenRadius = radius * scale;
    const vertices = ICO_VERTICES.map((vertex) => {
      const rotated = rotate(vertex.map((value) => value * screenRadius), 0.35 + Math.sin(spin) * 0.12, spin, index * 0.2);
      return { x: cx + rotated[0], y: cy - rotated[1], z: rotated[2] };
    });

    context.save();
    context.lineWidth = 1.15;
    context.strokeStyle = `rgba(${tint}, .58)`;
    context.shadowColor = `rgba(${tint}, .8)`;
    context.shadowBlur = 17;
    ICO_EDGES.forEach(([a, b]) => {
      context.beginPath();
      context.moveTo(vertices[a].x, vertices[a].y);
      context.lineTo(vertices[b].x, vertices[b].y);
      context.stroke();
    });
    context.shadowBlur = 0;
    vertices.forEach((vertex, vertexIndex) => {
      if (vertexIndex % 3 !== 0) return;
      context.beginPath();
      context.arc(vertex.x, vertex.y, Math.max(0.8, 1.2 * scale), 0, Math.PI * 2);
      context.fillStyle = `rgba(${tint}, .95)`;
      context.fill();
    });

    [1, 1.45].forEach((ringScale, ringIndex) => {
      context.beginPath();
      context.ellipse(cx, cy, radius * scale * ringScale * 1.8, radius * scale * ringScale * 0.62,
        0.4 + Math.sin(spin) * 0.16 + ringIndex * 0.7, 0, Math.PI * 2);
      context.strokeStyle = `rgba(${tint}, ${ringIndex ? '.24' : '.42'})`;
      context.lineWidth = ringIndex ? 0.8 : 1.1;
      context.stroke();
    });
    context.restore();
  };

  function draw(time) {
    if (!context || !width || !height) return;
    context.clearRect(0, 0, width, height);
    const travel = reducedMotion ? 0 : progress * 54;

    // Floating dust gives every section a subtle sense of parallax depth.
    dust.forEach((particle, index) => {
      const screen = project([particle.x, particle.y, particle.z], travel);
      if (screen.y < -20 || screen.y > height + 20) return;
      const twinkle = reducedMotion ? 0.36 : 0.27 + (Math.sin(time * 0.001 + particle.phase) + 1) * 0.18;
      context.beginPath();
      context.arc(screen.x, screen.y, Math.min(2.6, Math.max(0.45, particle.radius * screen.scale * 0.035)), 0, Math.PI * 2);
      context.fillStyle = index % 8 === 0 ? `rgba(180, 209, 194, ${twinkle})` : `rgba(221, 196, 151, ${twinkle})`;
      context.fill();
    });

    anchors.forEach((worldY, index) => {
      const relativeY = worldY + travel;
      const center = project([index % 2 ? -4.7 : 4.7, relativeY, -4.5]);
      if (center.y < -height * 0.6 || center.y > height * 1.6) return;
      const glowRadius = Math.min(240, 160 * center.scale);
      const glow = context.createRadialGradient(center.x, center.y, 0, center.x, center.y, glowRadius);
      glow.addColorStop(0, index % 2 ? 'rgba(90, 143, 132, .15)' : 'rgba(207, 166, 99, .16)');
      glow.addColorStop(1, 'rgba(10, 13, 13, 0)');
      context.fillStyle = glow;
      context.beginPath();
      context.arc(center.x, center.y, glowRadius, 0, Math.PI * 2);
      context.fill();
      drawCrystal(center.x, center.y, center.scale, time, index);
    });
  }

  const render = (time) => {
    frame = requestAnimationFrame(render);
    if (visible && !reducedMotion) draw(time);
  };
  const onVisibility = () => { visible = !document.hidden; };
  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  draw(performance.now());
  if (!reducedMotion) render(performance.now());

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', resize);
    window.removeEventListener('scroll', updateScroll);
    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('visibilitychange', onVisibility);
    canvas.remove();
  };
}
