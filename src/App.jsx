import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import CustomCursor from "./components/CustomCursor.jsx";
import Preloader from "./components/Preloader.jsx";
import gsap from "gsap";
import profile from "./assets/profile_cinematic.jpeg";
import simarko from "./assets/simarko.png";
import wedding from "./assets/wedding.png";
import jobtracker from "./assets/jobtracker.png";
import kantin from "./assets/kantin_uds.png";

const HeroCanvas = lazy(() => import("./HeroCanvas.jsx"));

const projects = [
  { number: "01", name: "SIMARKO DISNAV Bitung", category: "Database · Web Administration", year: "2026", image: simarko, description: "Sistem manajemen data operasional untuk mendukung administrasi dan monitoring informasi instansi." },
  { number: "02", name: "Premium Wedding Invitation", category: "Digital Experience · Front-end", year: "2026", image: wedding, description: "Undangan digital dengan galeri, love story, RSVP online, dan integrasi Google Maps.", href: "https://weeding-bagus-icha.vercel.app/" },
  { number: "03", name: "Job Tracker", category: "Web Application · Data", year: "2025", image: jobtracker, description: "Aplikasi untuk merapikan proses pencarian kerja dan melacak progres lamaran." },
  { number: "04", name: "Kantin UDS", category: "Business System · Web", year: "2025", image: kantin, description: "Sistem informasi kantin yang membantu digitalisasi alur pemesanan dan pengelolaan data." },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [["Work", "#work"], ["About", "#about"], ["Contact", "#contact"]];
  return <header className="site-header"><a className="brand" href="#home" aria-label="AFW, kembali ke atas">AFW<span>.</span></a><button className="menu-toggle" aria-expanded={menuOpen} aria-label="Buka navigasi" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "Tutup" : "Menu"}</button><nav className={menuOpen ? "nav-links is-open" : "nav-links"}>{links.map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}<a className="nav-cta" href="mailto:hello@fianwr.my.id">Let’s talk <span>↗</span></a></nav></header>;
}

function Hero({ onCanvasReady }) {
  return <section id="home" className="hero-section"><div className="hero-glow" /><div className="hero-copy"><p className="eyebrow"><span className="status-dot" /> AVAILABLE FOR SELECT PROJECTS <span className="eyebrow-rule" /> JEMBER, ID</p><h1>Ideas into<br /><span>digital impact.</span></h1><p className="hero-intro">I’m Fian — a creative developer shaping thoughtful digital experiences where technology meets real-world needs.</p><div className="hero-actions"><a className="button button-light" href="#work">Explore my work <span>↓</span></a><a className="text-link" href="#about">A little about me <span>↗</span></a></div></div><div className="hero-art" aria-hidden="true"><Suspense fallback={<div className="hero-canvas hero-canvas--loading" />}><HeroCanvas onReady={onCanvasReady} /></Suspense><div className="hero-orbit hero-orbit--one" /><div className="hero-orbit hero-orbit--two" /><div className="hero-art-label"><span>CREATIVE<br />DEVELOPMENT</span><span>01 — 03</span></div></div><div className="hero-bottom"><span>INDEPENDENT DEVELOPER / DIGITAL BUSINESS SPECIALIST</span><a href="#work">SCROLL TO DISCOVER <span>↓</span></a></div></section>;
}

function ProjectCard({ project }) {
  const cardRef = useRef(null);
  useEffect(() => {
    const card = cardRef.current;
    if (!card || window.matchMedia("(pointer: coarse)").matches) return undefined;
    gsap.set(card, { transformPerspective: 900, transformOrigin: "center center" });
    const rotateX = gsap.quickTo(card, "rotationX", { duration: 0.45, ease: "power3.out" });
    const rotateY = gsap.quickTo(card, "rotationY", { duration: 0.45, ease: "power3.out" });
    const onMove = (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      rotateX((0.5 - y) * 5);
      rotateY((x - 0.5) * 6);
    };
    const onLeave = () => { rotateX(0); rotateY(0); };
    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", onLeave);
    return () => {
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(card);
    };
  }, []);
  return <article className="project-card" data-cursor-hover ref={cardRef}><a className="project-image" href={project.href || "#contact"} target={project.href ? "_blank" : undefined} rel={project.href ? "noreferrer" : undefined} aria-label={`Lihat ${project.name}`}><img src={project.image} alt={project.name} loading="lazy" /><span className="project-open">↗</span></a><div className="project-meta"><span>{project.number} / {project.category}</span><span>{project.year}</span></div><h3>{project.name}</h3><p>{project.description}</p></article>;
}

function Projects() {
  return <section id="work" className="work-section section-pad"><div className="section-heading"><div><p className="eyebrow">SELECTED PROJECTS <span className="eyebrow-rule" /> 2024 — 2026</p><h2><span className="reveal-line"><span>Making useful</span></span><span className="reveal-line"><span className="muted-title">things matter.</span></span></h2></div><p className="section-note">A selection of products and platforms built to turn complex tasks into clear, usable experiences.</p></div><div className="project-grid">{projects.map((project) => <ProjectCard key={project.number} project={project} />)}</div><a className="work-more" href="mailto:hello@fianwr.my.id">Have a project in mind? <span>Let’s make it happen ↗</span></a></section>;
}

function About() {
  const skills = ["Creative development", "Web applications", "Database design", "Digital strategy", "Data management", "Business systems"];
  return <section id="about" className="about-section section-pad"><div className="about-image"><img src={profile} alt="Aditya Fian Wirayudha" loading="lazy" /><span className="image-caption">ADITYA FIAN WIRAYUDHA · 2026</span></div><div className="about-copy"><p className="eyebrow">A LITTLE ABOUT ME <span className="eyebrow-rule" /> 02 / 03</p><h2><span className="reveal-line"><span>Curious by nature.</span></span><span className="reveal-line"><span className="muted-title">Practical by design.</span></span></h2><p className="about-lead">I connect business thinking with technology to create digital tools that feel clear, useful, and human.</p><p className="about-body">With a background in Digital Business and hands-on experience building websites, managing databases, and working with data, I enjoy making complicated processes easier to understand and use.</p><div className="skill-list">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div><a className="text-link" href="https://linkedin.com/in/aditya-fian-wirayudha-b10223247" target="_blank" rel="noreferrer">More about my journey <span>↗</span></a></div></section>;
}

function Contact() {
  return <section id="contact" className="contact-section section-pad"><p className="eyebrow">HAVE SOMETHING IN MIND? <span className="eyebrow-rule" /> 03 / 03</p><h2><span className="reveal-line"><span>Let’s make</span></span><span className="reveal-line"><span className="muted-title">it meaningful.</span></span></h2><a className="contact-link" href="mailto:hello@fianwr.my.id">hello@fianwr.my.id <span>↗</span></a><div className="contact-bottom"><p>Open to thoughtful collaborations, freelance projects, and good conversations.</p><div><a href="https://github.com/arok1013" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://www.instagram.com/afwiramax/" target="_blank" rel="noreferrer">Instagram ↗</a><a href="https://linkedin.com/in/aditya-fian-wirayudha-b10223247" target="_blank" rel="noreferrer">LinkedIn ↗</a></div></div></section>;
}

export default function App() {
  const [assetsReady, setAssetsReady] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [preloaderDone, setPreloaderDone] = useState(false);
  const onCanvasReady = () => setCanvasReady(true);

  useEffect(() => {
    const assets = [...projects.map((project) => project.image), profile];
    Promise.all([
      Promise.all(assets.map((src) => {
        const image = new Image();
        image.src = src;
        return image.decode().catch(() => undefined);
      })),
      document.fonts?.ready || Promise.resolve(),
    ]).then(() => setAssetsReady(true));
  }, []);

  return <><CustomCursor />{!preloaderDone && <Preloader ready={assetsReady && canvasReady} onComplete={() => setPreloaderDone(true)} />}<Header /><main><Hero onCanvasReady={onCanvasReady} /><Projects /><About /><Contact /></main><footer className="site-footer"><a className="brand" href="#home">AFW<span>.</span></a><span>DESIGNED & BUILT WITH INTENTION · © 2026</span><a href="#home">BACK TO TOP ↑</a></footer></>;
}
