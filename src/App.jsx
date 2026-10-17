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
  return <header className="site-header"><a className="brand" href="#home" aria-label="AFW, kembali ke atas">AFW<span>.</span></a><button className="menu-toggle" aria-expanded={menuOpen} aria-label="Buka navigasi" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "Tutup" : "Menu"}</button><nav className={menuOpen ? "nav-links is-open" : "nav-links"}>{links.map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}<a className="nav-cta" href="mailto:fianwirarb@gmail.com">Let’s talk <span>↗</span></a></nav></header>;
}

function Hero({ onCanvasReady, onPhotoClick }) {
  return <section id="home" className="hero-section"><div className="hero-glow" /><div className="hero-copy"><p className="eyebrow"><span className="status-dot" /> AVAILABLE FOR SELECT PROJECTS <span className="eyebrow-rule" /> JEMBER, ID</p><div className="hero-title-layout"><h1>Ideas into<br /><span>digital impact.</span></h1><button type="button" className="hero-profile" data-cursor-hover aria-label="Lihat foto Aditya Fian Wirayudha ukuran penuh" onClick={onPhotoClick}><img src={profile} alt="Aditya Fian Wirayudha" /><span>ADITYA FIAN<br />WIRAYUDHA</span></button></div><p className="hero-intro">I’m Fian — a digital marketing advertiser and creative developer. I combine campaign data, compelling creative, and technology to grow brands and build useful digital experiences.</p><div className="hero-actions"><a className="button button-light" href="#work">Explore my work <span>↓</span></a><a className="text-link" href="#about">A little about me <span>↗</span></a></div></div><div className="hero-art" aria-hidden="true"><Suspense fallback={<div className="hero-canvas hero-canvas--loading" />}><HeroCanvas onReady={onCanvasReady} /></Suspense><div className="hero-orbit hero-orbit--one" /><div className="hero-orbit hero-orbit--two" /><div className="hero-art-label"><span>CREATIVE<br />DEVELOPMENT</span><span>01 — 03</span></div></div><div className="hero-bottom"><span>ADVERTISING / DIGITAL BUSINESS / DEVELOPMENT</span><a href="#work">SCROLL TO DISCOVER <span>↓</span></a></div></section>;
}

function ProfileLightbox({ onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label="Foto Aditya Fian Wirayudha ukuran penuh" onClick={onClose}><button className="photo-lightbox__close" type="button" onClick={onClose} aria-label="Tutup foto">Tutup <span>×</span></button><img src={profile} alt="Aditya Fian Wirayudha" onClick={(event) => event.stopPropagation()} /></div>;
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

function AdvertisingPortfolio() {
  const cases = [
    {
      period: "MAY — AUG 2026",
      company: "Berkah Agro Lestari Creative",
      role: "Advertiser Digital Marketing · Meta Ads",
      summary: "Mengelola kampanye untuk lima lini produk kesehatan, mulai dari pengujian creative, penulisan hook, hingga optimasi dan evaluasi performa iklan.",
      metrics: [["13+", "ad creative aktif"], ["4", "akun iklan"], ["5", "lini produk"]],
      tags: ["Meta Ads", "Creative testing", "Campaign optimization"],
      screenshots: [["/portfolio/berkah-agro-overview.jpg", "Ringkasan campaign Berkah Agro Lestari"], ["/portfolio/berkah-agro-scale-case.jpg", "Studi kasus akun iklan skala besar"], ["/portfolio/berkah-agro-cost-case.jpg", "Studi kasus efisiensi biaya iklan"], ["/portfolio/berkah-agro-multiproduct-case.jpg", "Studi kasus campaign multi-produk"]],
      number: "01",
    },
    {
      period: "AUG — SEP 2026",
      company: "CV Artha Berkah Rejeki",
      role: "Digital Marketing Advertiser · Multi-platform",
      summary: "Mengelola iklan lintas platform untuk lima akun toko, memantau ROI dan ROAS harian, serta menyesuaikan budget berdasarkan performa.",
      metrics: [["Rp558,7 jt", "pendapatan terkelola"], ["10.697", "pesanan"], ["20,26×", "rata-rata ROI GMV Max"]],
      tags: ["TikTok Shop GMV Max", "TikTok Ads", "Meta Ads", "Shopee Ads"],
      screenshots: [["/portfolio/artha-gmv-max-performance.jpg", "Dashboard performa TikTok Shop GMV Max"], ["/portfolio/artha-tiktok-ads.jpg", "Dashboard TikTok Ads Manager"], ["/portfolio/artha-meta-ads.jpg", "Dashboard Meta Ads Manager"], ["/portfolio/artha-shopee-ads.jpg", "Dashboard Shopee Ads"]],
      number: "02",
    },
  ];

  return <div className="ad-portfolio"><div className="ad-portfolio-heading"><p className="eyebrow">ADVERTISING PORTFOLIO <span className="eyebrow-rule" /> PERFORMANCE & CAMPAIGNS</p><h3>Growth, backed by data.</h3><p>Selected digital advertising work, from creative testing to multi-platform campaign optimization.</p></div><div className="ad-case-grid">{cases.map((item) => <article className="ad-case" key={item.number}><div className="ad-case-top"><span>{item.number} / {item.role}</span><span>{item.period}</span></div><h4>{item.company}</h4><p className="ad-case-summary">{item.summary}</p><div className="ad-case-metrics">{item.metrics.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div><div className="ad-case-tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="ad-case-gallery" aria-label={`Screenshot portfolio ${item.company}`}>{item.screenshots.map(([src, caption]) => <a href={src} target="_blank" rel="noreferrer" key={src} aria-label={`Buka screenshot: ${caption}`}><img src={src} alt={caption} loading="lazy" /><span>{caption}</span></a>)}</div></article>)}</div></div>;
}

function Projects() {
  return <section id="work" className="work-section section-pad"><div className="section-heading"><div><p className="eyebrow">SELECTED PROJECTS <span className="eyebrow-rule" /> 2024 — 2026</p><h2><span className="reveal-line"><span>Making useful</span></span><span className="reveal-line"><span className="muted-title">things matter.</span></span></h2></div><p className="section-note">A selection of products and platforms built to turn complex tasks into clear, usable experiences.</p></div><div className="project-grid">{projects.map((project) => <ProjectCard key={project.number} project={project} />)}</div><AdvertisingPortfolio /><a className="work-more" href="mailto:fianwirarb@gmail.com">Have a project in mind? <span>Let’s make it happen ↗</span></a></section>;
}

function About({ onPhotoClick }) {
  const skills = ["Meta Ads", "TikTok Ads", "TikTok Shop GMV Max", "Shopee Ads", "Campaign analytics", "Creative strategy", "Canva · CapCut", "Laravel · PHP · MySQL"];
  const experience = [
    { year: "Agt—Sep 2026", title: "Digital Marketing Advertiser", place: "CV Artha Berkah Rejeki · Besuki, Situbondo", detail: "Mengelola iklan di 4 platform untuk 5 akun toko. Rp40,4 jt belanja iklan menghasilkan Rp558,7 jt pendapatan dan 10.697 pesanan." },
    { year: "Mei—Agt 2026", title: "Advertiser Digital Marketing", place: "Berkah Agro Lestari Creative · Jember", detail: "Mengelola 13+ ad creative aktif di 4 akun Meta Ads untuk 5 lini produk kesehatan." },
    { year: "Mei—Jun 2024", title: "Staf Administrasi & Manajemen Data", place: "BAPENDA Kabupaten Jember · Magang", detail: "Memvalidasi 400+ data transaksi pajak dan membantu meningkatkan efisiensi pengolahan data." },
    { year: "Jan 2022—Des 2024", title: "Staf Kominfo · Social Media Manager", place: "HMFEB · Universitas dr. Soebandi" },
    { year: "Jul—Agt 2024", title: "Koordinator PDD & Logistik · KKN", place: "Pengabdian masyarakat · Kabupaten Jember" },
  ];
  return <section id="about" className="about-section section-pad"><button type="button" className="about-image" data-cursor-hover aria-label="Lihat foto Aditya Fian Wirayudha ukuran penuh" onClick={onPhotoClick}><img src={profile} alt="Aditya Fian Wirayudha" loading="lazy" /><span className="image-caption">ADITYA FIAN WIRAYUDHA · JEMBER, ID</span></button><div className="about-copy"><p className="eyebrow">A LITTLE ABOUT ME <span className="eyebrow-rule" /> 02 / 03</p><h2><span className="reveal-line"><span>Always curious.</span></span><span className="reveal-line"><span className="muted-title">Purposeful by design.</span></span></h2><p className="about-lead">Lulusan Bisnis Digital yang memadukan pemasaran berbasis kinerja, kreativitas, dan teknologi.</p><p className="about-body">Saya lulus Cumlaude dari program S1 Bisnis Digital Universitas dr. Soebandi dengan IPK 3,73. Pengalaman saya mencakup periklanan multi-platform, analisis kampanye, pengembangan web, dan pengelolaan basis data—membantu tim mengambil keputusan yang lebih tepat dan membangun pengalaman digital yang bermanfaat.</p><div className="profile-facts"><div><span>PENDIDIKAN</span><strong>S1 Bisnis Digital</strong><small>Universitas dr. Soebandi</small></div><div><span>PENCAPAIAN</span><strong>Cumlaude · IPK 3,73</strong><small>Jember, Jawa Timur</small></div></div><div className="experience-list"><p className="eyebrow">PENGALAMAN <span className="eyebrow-rule" /></p>{experience.map((item) => <div className="experience-row" key={item.title}><span>{item.year}</span><div><strong>{item.title}</strong><small>{item.place}</small>{item.detail && <small className="experience-detail">{item.detail}</small>}</div></div>)}</div><div className="skill-list">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div><a className="text-link" href="https://linkedin.com/in/aditya-fian-wirayudha-b10223247" target="_blank" rel="noreferrer">Lihat perjalanan saya <span>↗</span></a></div></section>;
}

function Contact() {
  return <section id="contact" className="contact-section section-pad"><p className="eyebrow">HAVE SOMETHING IN MIND? <span className="eyebrow-rule" /> 03 / 03</p><h2><span className="reveal-line"><span>Let’s make</span></span><span className="reveal-line"><span className="muted-title">it meaningful.</span></span></h2><p className="contact-intro">Punya ide atau peluang kolaborasi? Hubungi saya lewat email atau WhatsApp.</p><div className="contact-options"><a className="contact-option" href="mailto:fianwirarb@gmail.com"><span>EMAIL</span><strong>fianwirarb@gmail.com</strong><em>Kirim email ↗</em></a><a className="contact-option" href="https://wa.me/6285117315388" target="_blank" rel="noreferrer"><span>TELEPON / WHATSAPP</span><strong>+62 851-1731-5388</strong><em>Chat via WhatsApp ↗</em></a></div><div className="contact-bottom"><p>Open to thoughtful collaborations, freelance projects, and good conversations.</p><div><a href="https://github.com/arok1013" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://www.instagram.com/afwiramax/" target="_blank" rel="noreferrer">Instagram ↗</a><a href="https://linkedin.com/in/aditya-fian-wirayudha-b10223247" target="_blank" rel="noreferrer">LinkedIn ↗</a></div></div></section>;
}

export default function App() {
  const [assetsReady, setAssetsReady] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const closePhoto = () => setPhotoOpen(false);
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

  return <><CustomCursor />{!preloaderDone && <Preloader ready={assetsReady && canvasReady} onComplete={() => setPreloaderDone(true)} />}<Header /><main><Hero onCanvasReady={onCanvasReady} onPhotoClick={() => setPhotoOpen(true)} /><Projects /><About onPhotoClick={() => setPhotoOpen(true)} /><Contact /></main><footer className="site-footer"><a className="brand" href="#home">AFW<span>.</span></a><span>ADITYA FIAN WIRAYUDHA · CREATIVE DEVELOPER & DIGITAL ADVERTISER · © 2026</span><a href="#home">BACK TO TOP ↑</a></footer>{photoOpen && <ProfileLightbox onClose={closePhoto} />}</>;
}
