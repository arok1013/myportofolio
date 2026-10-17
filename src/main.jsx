import { createRoot } from "react-dom/client";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import App from "./App.jsx";
import "./style.css";

gsap.registerPlugin(ScrollTrigger);

const root = createRoot(document.getElementById("root"));
root.render(<App />);

const lenis = new Lenis({
  duration: 1.25,
  smoothWheel: true,
  syncTouch: true,
  syncTouchLerp: 0.075,
  touchInertiaExponent: 1.7,
  wheelMultiplier: 0.9,
  touchMultiplier: 1.2,
  anchors: true,
});

lenis.on("scroll", ScrollTrigger.update);
const tick = (time) => lenis.raf(time * 1000);
gsap.ticker.add(tick);
gsap.ticker.lagSmoothing(0);

const motion = gsap.matchMedia();
motion.add("(prefers-reduced-motion: no-preference)", () => {
  gsap.from(".hero-copy > *", {
    y: 32,
    opacity: 0,
    duration: 1.05,
    stagger: 0.11,
    ease: "power3.out",
    delay: 0.16,
  });
  gsap.utils.toArray(".project-card, .about-copy > :not(h2), .contact-section > :not(h2), .section-heading > div > :not(h2)").forEach((element) => {
    gsap.from(element, {
      y: 28,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: { trigger: element, start: "top 88%", once: true },
    });
  });
  gsap.utils.toArray(".section-heading h2 .reveal-line > span, .about-copy h2 .reveal-line > span, .contact-section h2 .reveal-line > span").forEach((line) => {
    gsap.fromTo(line, { yPercent: 115 }, {
      yPercent: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: "power4.out",
      scrollTrigger: { trigger: line.closest("h2"), start: "top 82%", once: true },
    });
  });
});

window.addEventListener("pagehide", () => {
  gsap.ticker.remove(tick);
  motion.revert();
  lenis.destroy();
}, { once: true });
