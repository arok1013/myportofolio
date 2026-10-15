import React, { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

/** Adapted from the Spotlight Card pattern in the 21st.dev component catalog. */
export default function SpotlightCard({ children, className = "" }) {
  const cardRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const updateSpotlight = (event) => {
    const card = cardRef.current;
    if (!card) return;
    const bounds = card.getBoundingClientRect();
    card.style.setProperty("--spotlight-x", `${event.clientX - bounds.left}px`);
    card.style.setProperty("--spotlight-y", `${event.clientY - bounds.top}px`);
  };

  return (
    <div
      ref={cardRef}
      className={`spotlight-card ${className}`}
      onPointerMove={updateSpotlight}
    >
      {children}
      {!reduceMotion && <motion.span
        className="spotlight-card__shimmer"
        aria-hidden="true"
        initial={{ x: "-160%", opacity: 0 }}
        animate={{ x: ["-160%", "220%"], opacity: [0, 0.65, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />}
      <span className="spotlight-card__beam" />
    </div>
  );
}
