import React from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import SpotlightCard from "./SpotlightCard.jsx";
import HeroCanvas from "./HeroCanvas.jsx";

const chips = [
  { className: "scene-chip--business", label: "01 / STRATEGY", title: "Advertiser", x: -158, y: -12, z: 90, rotateY: 12, rotateX: -4, delay: 0.15 },
  { className: "scene-chip--data", label: "02 / ANALYTICS", title: "Data Analyst", x: 168, y: 16, z: 125, rotateY: -10, rotateX: 5, delay: 0.32, chart: true },
  { className: "scene-chip--web", label: "03 / BUILD", title: <>Website<br />Builder</>, x: -112, y: 16, z: 58, rotateY: 9, rotateX: 4, delay: 0.48 },
];

function SceneChip({ chip, pointerX, pointerY, reduceMotion }) {
  const rotateY = useTransform(pointerX, [-1, 1], [chip.rotateY - 5, chip.rotateY + 5]);
  const rotateX = useTransform(pointerY, [-1, 1], [chip.rotateX + 4, chip.rotateX - 4]);

  return (
    <motion.div
      className={`scene-chip ${chip.className}`}
      style={{ z: chip.z, rotateY, rotateX }}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.82, y: chip.y + 30 }}
      animate={{ opacity: 1, scale: 1, y: reduceMotion ? 0 : [0, -9, 0] }}
      transition={{
        opacity: { duration: 0.65, delay: chip.delay },
        scale: { type: "spring", stiffness: 160, damping: 18, delay: chip.delay },
        y: reduceMotion ? { duration: 0 } : { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: chip.delay },
        rotateY: { duration: 0.7, delay: chip.delay },
      }}
    >
      <SpotlightCard className="scene-chip__surface">
        <span>{chip.label}</span>
        <strong>{chip.title}</strong>
        {chip.chart && <div className="scene-bars">{Array.from({ length: 7 }, (_, index) => (
          <motion.b
            key={index}
            animate={reduceMotion ? { scaleY: 1, opacity: 1 } : { scaleY: [0.55, 1], opacity: [0.62, 1] }}
            transition={reduceMotion ? { duration: 0 } : { duration: 1.35 + (index % 3) * 0.28, delay: index * 0.1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
        ))}</div>}
      </SpotlightCard>
    </motion.div>
  );
}

export default function HeroMotion() {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 115, damping: 22, mass: 0.7 });
  const smoothY = useSpring(pointerY, { stiffness: 115, damping: 22, mass: 0.7 });

  const handlePointerMove = (event) => {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1);
    pointerY.set(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
  };

  return (
    <div className="hero-motion-scene" onPointerMove={handlePointerMove} onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }}>
      <HeroCanvas />
      <div className="scene-orbit scene-orbit--outer">
        <motion.div className="scene-orbit__rotor" animate={reduceMotion ? { rotate: 0 } : { rotate: [0, 360] }} transition={{ duration: 38, repeat: Infinity, ease: "linear" }} />
      </div>
      <div className="scene-orbit scene-orbit--inner">
        <motion.div className="scene-orbit__rotor" animate={reduceMotion ? { rotate: 0 } : { rotate: [0, -360] }} transition={{ duration: 42, repeat: Infinity, ease: "linear" }} />
      </div>
      {chips.map((chip) => <SceneChip key={chip.label} chip={chip} pointerX={smoothX} pointerY={smoothY} reduceMotion={reduceMotion} />)}
    </div>
  );
}
