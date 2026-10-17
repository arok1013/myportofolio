import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const moveDotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3.out" });
    const moveDotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3.out" });
    const moveRingX = gsap.quickTo(ring, "x", { duration: 0.42, ease: "power3.out" });
    const moveRingY = gsap.quickTo(ring, "y", { duration: 0.42, ease: "power3.out" });
    const onPointerMove = (event) => {
      moveDotX(event.clientX);
      moveDotY(event.clientY);
      moveRingX(event.clientX);
      moveRingY(event.clientY);
      gsap.to([dot, ring], { autoAlpha: 1, duration: 0.18, overwrite: "auto" });
    };
    const onPointerOver = (event) => {
      if (event.target.closest("a, button, [data-cursor-hover]")) {
        gsap.to(ring, { scale: 1.7, backgroundColor: "rgba(211, 185, 139, 0.12)", duration: 0.28, ease: "power2.out" });
        gsap.to(dot, { scale: 0.55, duration: 0.2, overwrite: "auto" });
      }
    };
    const onPointerOut = (event) => {
      if (event.target.closest("a, button, [data-cursor-hover]")) {
        gsap.to(ring, { scale: 1, backgroundColor: "transparent", duration: 0.3, ease: "power2.out" });
        gsap.to(dot, { scale: 1, duration: 0.2, overwrite: "auto" });
      }
    };
    const onWindowLeave = () => gsap.to([dot, ring], { autoAlpha: 0, duration: 0.2 });

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerover", onPointerOver);
    document.addEventListener("pointerout", onPointerOut);
    document.documentElement.addEventListener("pointerleave", onWindowLeave);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
      document.documentElement.removeEventListener("pointerleave", onWindowLeave);
      gsap.killTweensOf([dot, ring]);
    };
  }, []);

  return <div className="custom-cursor" aria-hidden="true"><span ref={ringRef} className="custom-cursor__ring" /><span ref={dotRef} className="custom-cursor__dot" /></div>;
}
