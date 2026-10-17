import React from "react";
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
  const reveal = (elements, trigger, { start = "top 86%", stagger = 0.1, distance = 40, duration = 0.82, scale = 0.88 } = {}) => {
    const items = gsap.utils.toArray(elements);
    if (!items.length || !trigger) return;
    gsap.fromTo(items, { autoAlpha: 0, y: distance, scale, filter: "blur(7px)" }, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      duration,
      stagger,
      ease: "power3.out",
      scrollTrigger: { trigger, start, once: true },
      immediateRender: false,
    });
  };

  gsap.fromTo(".hero-copy > *", { y: 30, autoAlpha: 0 }, {
    y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.12,
  });

  document.querySelectorAll(".project-grid").forEach((group) => reveal(group.querySelectorAll(".project-card"), group, { start: "top 88%", stagger: 0.13, distance: 42, duration: 0.9, scale: 0.84 }));
  document.querySelectorAll(".section-heading").forEach((group) => reveal(group.querySelectorAll(".eyebrow, h2, .section-note"), group, { stagger: 0.12, distance: 20 }));
  document.querySelectorAll(".ad-portfolio-heading").forEach((group) => reveal(group.children, group, { stagger: 0.12, distance: 18 }));
  document.querySelectorAll(".ad-case-grid").forEach((group) => reveal(group.querySelectorAll(".ad-case"), group, { start: "top 84%", stagger: 0.16, distance: 38, duration: 0.9, scale: 0.86 }));
  document.querySelectorAll(".ad-case").forEach((card) => reveal(card.querySelectorAll(".ad-case-gallery > a"), card, { start: "top 72%", stagger: 0.075, distance: 24, duration: 0.65, scale: 0.86 }));
  document.querySelectorAll(".about-image").forEach((image) => reveal(image, image, { start: "top 82%", distance: 36, duration: 0.9, scale: 0.88 }));
  document.querySelectorAll(".about-copy").forEach((group) => {
    reveal(group.querySelectorAll(":scope > .eyebrow, :scope > .about-lead, :scope > .about-body, :scope > .text-link"), group, { stagger: 0.1, distance: 20 });
    group.querySelectorAll(".profile-facts, .experience-list, .skill-list").forEach((list) => reveal(list.children, list, { start: "top 90%", stagger: 0.075, distance: 25, duration: 0.68, scale: 0.9 }));
  });
  document.querySelectorAll(".contact-section").forEach((section) => {
    reveal(section.querySelectorAll(":scope > .eyebrow, :scope > .contact-intro, :scope > .contact-bottom"), section, { stagger: 0.12, distance: 20 });
    section.querySelectorAll(".contact-options").forEach((group) => reveal(group.children, group, { start: "top 88%", stagger: 0.14, distance: 32, duration: 0.82, scale: 0.88 }));
  });

  gsap.utils.toArray(".section-heading h2 .reveal-line > span, .about-copy h2 .reveal-line > span, .contact-section h2 .reveal-line > span").forEach((line) => {
    gsap.fromTo(line, { yPercent: 115, scale: 0.88, autoAlpha: 0, filter: "blur(8px)" }, {
      yPercent: 0,
      scale: 1,
      autoAlpha: 1,
      filter: "blur(0px)",
      duration: 0.9,
      stagger: 0.12,
      ease: "power4.out",
      scrollTrigger: { trigger: line.closest("h2"), start: "top 82%", once: true },
    });
  });

  const refreshAfterLayout = () => ScrollTrigger.refresh();
  document.fonts?.ready.then(refreshAfterLayout);
  window.addEventListener("load", refreshAfterLayout, { once: true });
});

window.addEventListener("pagehide", () => {
  gsap.ticker.remove(tick);
  motion.revert();
  lenis.destroy();
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}, { once: true });
