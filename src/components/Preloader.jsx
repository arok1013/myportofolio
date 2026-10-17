import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function Preloader({ ready, onComplete }) {
  const rootRef = useRef(null);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (ready) return undefined;
    const counter = { value: 0 };
    const tween = gsap.to(counter, {
      value: 92,
      duration: 3.8,
      ease: "power1.out",
      onUpdate: () => setPercent(Math.floor(counter.value)),
    });
    return () => tween.kill();
  }, [ready]);

  useEffect(() => {
    if (!ready || !rootRef.current) return undefined;
    const counter = { value: percent };
    const timeline = gsap.timeline({
      onComplete: () => onComplete?.(),
    });
    timeline.to(counter, {
      value: 100,
      duration: 0.28,
      ease: "power2.out",
      onUpdate: () => setPercent(Math.round(counter.value)),
    }).to(rootRef.current, { autoAlpha: 0, yPercent: -100, duration: 0.72, ease: "power4.inOut" });
    return () => timeline.kill();
  }, [ready]);

  return <div className="preloader" ref={rootRef} role="status" aria-live="polite" aria-label="Memuat portofolio"><div className="preloader__top"><span>AFW<span className="preloader__accent">.</span></span><span>PORTFOLIO / 2026</span></div><div className="preloader__bottom"><span>SHAPING DIGITAL EXPERIENCES</span><strong>{String(percent).padStart(2, "0")}<small>%</small></strong></div><div className="preloader__track"><span style={{ transform: `scaleX(${percent / 100})` }} /></div></div>;
}
