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
  const reveal = (elements, trigger, { start = "top 92%", end = "top 62%", stagger = 0.1, distance = 42, duration = 1, scale = 0.84 } = {}) => {
    const items = gsap.utils.toArray(elements);
    if (!items.length) return;
    const animate = (targets, scrollTrigger, delay = 0) => gsap.fromTo(targets, { autoAlpha: 0, y: distance, scale, filter: "blur(7px)" }, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      duration,
      delay,
      stagger: scrollTrigger.trigger === trigger ? stagger : 0,
      ease: "none",
      scrollTrigger,
      immediateRender: false,
    });
    if (trigger) {
      animate(items, { trigger, start, end, scrub: 0.55, invalidateOnRefresh: true });
    } else {
      items.forEach((item, index) => animate(item, { trigger: item, start, end, scrub: 0.45, invalidateOnRefresh: true }, index * 0.025));
    }
  };

  gsap.fromTo(".hero-copy > *", { y: 30, autoAlpha: 0 }, {
    y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.12,
  });

  document.querySelectorAll(".project-grid .project-card").forEach((card) => reveal(card.querySelectorAll(":scope > .project-image, :scope > .project-meta, :scope > h3, :scope > p"), null, { start: "top 94%", end: "top 62%", stagger: 0.04, distance: 50, duration: 1, scale: 0.82 }));
  document.querySelectorAll(".section-heading").forEach((group) => reveal(group.querySelectorAll(".eyebrow, h2, .section-note"), group, { stagger: 0.12, distance: 20 }));
  document.querySelectorAll(".ad-portfolio-heading").forEach((group) => reveal(group.children, group, { stagger: 0.12, distance: 18 }));
  document.querySelectorAll(".ad-case").forEach((card) => {
    reveal(card, null, { start: "top 94%", end: "top 70%", distance: 38, scale: 0.9 });
    reveal(card.querySelectorAll(":scope > .ad-case-top, :scope > h4, :scope > .ad-case-summary, :scope > .ad-case-metrics, :scope > .ad-case-tags"), null, { start: "top 94%", end: "top 64%", distance: 36, scale: 0.86 });
    const gallery = card.querySelector(".ad-case-gallery");
    if (gallery) reveal(gallery.querySelectorAll(":scope > a"), null, { start: "top 96%", end: "top 60%", stagger: 0.04, distance: 28, duration: 1, scale: 0.86 });
  });
  document.querySelectorAll(".about-image").forEach((image) => reveal(image, image, { start: "top 82%", distance: 36, duration: 0.9, scale: 0.88 }));
  document.querySelectorAll(".about-copy").forEach((group) => {
    reveal(group.querySelectorAll(":scope > .eyebrow, :scope > .about-lead, :scope > .about-body, :scope > .text-link"), null, { start: "top 94%", end: "top 66%", stagger: 0.04, distance: 34, scale: 0.88 });
    group.querySelectorAll(".profile-facts, .experience-list, .skill-list").forEach((list) => reveal(list.children, null, { start: "top 94%", end: "top 65%", stagger: 0.04, distance: 30, duration: 1, scale: 0.88 }));
  });
  document.querySelectorAll(".contact-section").forEach((section) => {
    reveal(section.querySelectorAll(":scope > .eyebrow, :scope > .contact-intro"), section, { start: "top 92%", end: "top 62%", stagger: 0.1, distance: 32, scale: 0.88 });
    section.querySelectorAll(".contact-options").forEach((group) => reveal(group.children, null, { start: "top 94%", end: "top 62%", stagger: 0.05, distance: 40, duration: 1, scale: 0.84 }));
    reveal(section.querySelectorAll(".contact-bottom > *"), null, { start: "top 95%", end: "top 62%", stagger: 0.05, distance: 34, scale: 0.88 });
  });

  document.querySelectorAll(".work-more").forEach((item) => reveal(item, null, { start: "top 96%", end: "top 62%", distance: 34, scale: 0.88 }));

  gsap.utils.toArray(".section-heading h2 .reveal-line > span, .about-copy h2 .reveal-line > span, .contact-section h2 .reveal-line > span").forEach((line) => {
    gsap.fromTo(line, { yPercent: 115, scale: 0.88, autoAlpha: 0, filter: "blur(8px)" }, {
      yPercent: 0,
      scale: 1,
      autoAlpha: 1,
      filter: "blur(0px)",
      duration: 0.9,
      stagger: 0.12,
      ease: "power4.out",
      scrollTrigger: { trigger: line.closest("h2"), start: "top 88%", end: "top 54%", scrub: 0.55, invalidateOnRefresh: true },
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
