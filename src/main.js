import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { animate, inView } from "framer-motion";
import HeroMotion from "./HeroMotion.jsx";

const heroMotionRoot = document.getElementById('hero-motion-root');
if (heroMotionRoot) createRoot(heroMotionRoot).render(createElement(HeroMotion));

const initializePortfolio = () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const worldModule = window.WebGLRenderingContext
    ? import('./PortfolioWorld.js')
    : import('./PortfolioDepthFallback.js');
  worldModule
    .then(({ initPortfolioWorld }) => initPortfolioWorld({ reducedMotion }))
    .catch((error) => console.warn('3D portfolio world could not be loaded.', error));
  // --- Header Scroll Effect ---
  const header = document.querySelector('header');
  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('glass-nav', 'py-4');
      header.classList.remove('py-6', 'bg-transparent');
    } else {
      header.classList.remove('glass-nav', 'py-4');
      header.classList.add('py-6', 'bg-transparent');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Trigger on load
  if (header && !reducedMotion) {
    animate(header, { opacity: [0, 1], y: [-14, 0], filter: ['blur(5px)', 'blur(0px)'] }, {
      duration: 0.85, ease: [0.22, 1, 0.36, 1],
    }).then(() => header.style.removeProperty('transform'));
    header.querySelectorAll('a, button').forEach((link, index) => {
      const controls = animate(link, { opacity: [0, 1], y: [-10, 0], z: [-80, 0], rotateX: [12, 0], transformPerspective: 1100 }, {
        duration: 0.68, delay: 0.12 + index * 0.045, ease: [0.22, 1, 0.36, 1],
      });
      controls.then(() => link.style.removeProperty('transform'));
    });
  }

  // Fine gold scroll progress line, driven by Motion's DOM animation engine.
  const progressLine = document.getElementById('motion-progress');
  let progressFrame = 0;
  const updateProgress = () => {
    if (!progressLine || reducedMotion) return;
    cancelAnimationFrame(progressFrame);
    progressFrame = requestAnimationFrame(() => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      animate(progressLine, { scaleX: progress }, { duration: 0.24, ease: 'easeOut' });
    });
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // Gentle first impression for the hero copy and calls to action.
  if (!reducedMotion) {
    const heroIntro = document.querySelectorAll('#home h1, #home h2, #home p, #home .text-accent, #home .flex a, #hero-interactive-area');
    heroIntro.forEach((element, index) => {
      const controls = animate(element, {
        opacity: [0, 1], y: [32, 0], z: [-160, 0], rotateX: [16, 0], rotateY: [index % 2 ? 5 : -5, 0], scale: [0.965, 1], transformPerspective: 1150, filter: ['blur(8px)', 'blur(0px)'],
      }, {
        duration: 0.9,
        delay: 0.12 + index * 0.085,
        ease: [0.22, 1, 0.36, 1],
      });
      controls.then(() => element.style.removeProperty('transform'));
    });

    // Keep the ambient hero movement on the same Motion engine as page reveals.
    document.querySelectorAll('.animate-glow-shift-1').forEach((element) => {
      animate(element, { x: [0, 40, -30, 0], y: [0, -30, 40, 0], scale: [1, 1.15, 0.9, 1], opacity: [0.15, 0.25, 0.2, 0.15] }, {
        duration: 12, repeat: Infinity, ease: 'easeInOut',
      });
    });
    document.querySelectorAll('.animate-glow-shift-2').forEach((element) => {
      animate(element, { x: [0, -34, 26, 0], y: [0, 26, -34, 0], scale: [1, 0.9, 1.14, 1], opacity: [0.18, 0.1, 0.24, 0.18] }, {
        duration: 15, repeat: Infinity, ease: 'easeInOut',
      });
    });
    document.querySelectorAll('.spin-slow').forEach((element) => {
      animate(element, { rotate: [0, 360] }, { duration: 25, repeat: Infinity, ease: 'linear' });
    });
    document.querySelectorAll('.spin-reverse-slow').forEach((element) => {
      animate(element, { rotate: [0, -360] }, { duration: 35, repeat: Infinity, ease: 'linear' });
    });
    document.querySelectorAll('.scene-bars b').forEach((bar, index) => {
      animate(bar, { scaleY: [0.55, 1], opacity: [0.62, 1] }, {
        duration: 1.35 + (index % 3) * 0.28, delay: index * 0.1, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut',
      });
    });
  }

  // --- Mobile Menu Toggle ---
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIconOpen = document.getElementById('menu-icon-open');
  const menuIconClose = document.getElementById('menu-icon-close');

  if (menuBtn && mobileMenu) {
    const setMobileMenu = (open) => {
      mobileMenu.dataset.open = String(open);
      menuIconOpen?.classList.toggle('hidden', open);
      menuIconClose?.classList.toggle('hidden', !open);
      if (open) {
        mobileMenu.classList.remove('hidden');
        mobileMenu.classList.add('flex');
        if (!reducedMotion) {
          animate(mobileMenu, { opacity: [0, 1], y: [-14, 0], filter: ['blur(6px)', 'blur(0px)'] }, {
            duration: 0.42, ease: [0.22, 1, 0.36, 1],
          });
          mobileMenu.querySelectorAll('a').forEach((link, index) => {
            const controls = animate(link, { opacity: [0, 1], x: [-12, 0] }, {
              duration: 0.38, delay: 0.06 + index * 0.045, ease: [0.22, 1, 0.36, 1],
            });
            controls.then(() => link.style.removeProperty('transform'));
          });
        }
      } else if (reducedMotion) {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
      } else {
        animate(mobileMenu, { opacity: 0, y: -10, filter: 'blur(5px)' }, {
          duration: 0.22, ease: [0.4, 0, 1, 1],
        }).then(() => {
          if (mobileMenu.dataset.open === 'false') {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('flex');
            mobileMenu.style.removeProperty('transform');
            mobileMenu.style.removeProperty('opacity');
            mobileMenu.style.removeProperty('filter');
          }
        });
      }
    };

    menuBtn.addEventListener('click', () => setMobileMenu(mobileMenu.dataset.open !== 'true'));

    // Close menu when clicking a link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        setMobileMenu(false);
      });
    });
  }

  // --- Smooth Scroll & Active Links ---
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('nav a');

  const highlightNav = () => {
    let scrollPos = window.scrollY + 100;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('text-accent', 'font-semibold');
          link.classList.add('text-text-secondary');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('text-accent', 'font-semibold');
            link.classList.remove('text-text-secondary');
          }
        });
      }
    });
  };
  window.addEventListener('scroll', highlightNav);
  highlightNav();

  // --- Motion-powered scroll reveals and cascading content ---
  const revealElements = [...document.querySelectorAll('.reveal'), ...document.querySelectorAll('footer')];
  const revealedSections = new WeakSet();
  revealElements.forEach((section) => inView(section, () => {
    if (revealedSections.has(section)) return;
    revealedSections.add(section);
    section.classList.add('active');
    if (reducedMotion) return;

    // Inspired by the layered reveal and stagger patterns used across 21st.dev:
    // animate the actual content hierarchy instead of revealing only each section.
    const motionItems = section.querySelectorAll(
      '.glass-card, .project-card, .timeline-item, .filter-btn, h2, h3, h4, p, li, blockquote, dt, dd, span, strong, a, button, .text-accent.font-semibold'
    );
    const cardItems = new Set(section.querySelectorAll('.glass-card, .project-card, .timeline-item'));
    // Cards enter as a composed layer; all copy and micro-labels inside them
    // get their own short cascade so every part of the page feels alive.
    const targets = [...motionItems];
    targets.forEach((item, index) => {
      const isCard = cardItems.has(item);
      const controls = animate(item, {
        opacity: [0, 1],
        y: [isCard ? 34 : 22, 0],
        z: [isCard ? -190 : -115, 0],
        rotateX: [isCard ? 18 : 13, 0],
        rotateY: [index % 2 === 0 ? -7 : 7, 0],
        scale: isCard ? [0.94, 1] : [0.985, 1],
        transformPerspective: 1250,
        filter: [isCard ? 'blur(6px)' : 'blur(3px)', 'blur(0px)'],
      }, {
        duration: isCard ? 1.05 : 0.78,
        delay: Math.min(index * 0.022, 0.68),
        ease: [0.22, 1, 0.36, 1],
      });
      // Framer's DOM animation writes a final transform; release it so CSS hover
      // lift and the existing 3D interactions remain available.
      controls.then(() => item.style.removeProperty('transform'));
    });
  }, { amount: 0.12, margin: '0px 0px -8% 0px' }));

  // Subtle pointer-following spotlight on project and information cards.
  if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.glass-card, .project-card, .timeline-item, .filter-btn, #contact a').forEach((card) => {
      card.style.transformStyle = 'preserve-3d';
      card.addEventListener('pointermove', (event) => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty('--card-pointer-x', `${event.clientX - bounds.left}px`);
        card.style.setProperty('--card-pointer-y', `${event.clientY - bounds.top}px`);
        const x = (event.clientX - bounds.left) / bounds.width * 2 - 1;
        const y = (event.clientY - bounds.top) / bounds.height * 2 - 1;
        animate(card, {
          transformPerspective: 1250,
          rotateX: -y * 5.5,
          rotateY: x * 6.5,
          z: 16,
        }, { type: 'spring', stiffness: 220, damping: 24, mass: 0.45 });
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--card-pointer-x', '50%');
        card.style.setProperty('--card-pointer-y', '50%');
        animate(card, { rotateX: 0, rotateY: 0, z: 0 }, {
          type: 'spring', stiffness: 180, damping: 22,
        }).then(() => card.style.removeProperty('transform'));
      });
    });
  }

  // --- Portfolio Filtering ---
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (filterButtons.length > 0 && projectCards.length > 0) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Reset button classes
        filterButtons.forEach(b => {
          b.classList.remove('bg-accent', 'text-primary');
          b.classList.add('border', 'border-white/10', 'text-text-secondary');
        });

        // Set active button classes
        btn.classList.add('bg-accent', 'text-primary');
        btn.classList.remove('border', 'border-white/10', 'text-text-secondary');

        const filterValue = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
          const cardYear = card.getAttribute('data-year');
          
          if (filterValue === 'all' || cardYear === filterValue) {
            card.style.display = 'flex';
            card.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
            if (!reducedMotion) {
              const controls = animate(card, {
                opacity: [0, 1], y: [18, 0], scale: [0.97, 1], filter: ['blur(5px)', 'blur(0px)'],
              }, { duration: 0.58, ease: [0.22, 1, 0.36, 1] });
              controls.then(() => {
                card.style.removeProperty('transform');
                card.style.removeProperty('opacity');
                card.style.removeProperty('filter');
              });
            }
          } else {
            card.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
            if (reducedMotion) {
              card.style.display = 'none';
            } else {
              animate(card, {
                opacity: 0, y: -10, scale: 0.97, filter: 'blur(4px)',
              }, { duration: 0.24, ease: [0.4, 0, 1, 1] }).then(() => {
                if (card.classList.contains('pointer-events-none')) {
                  card.style.display = 'none';
                  card.style.removeProperty('transform');
                  card.style.removeProperty('opacity');
                  card.style.removeProperty('filter');
                }
              });
            }
          }
        });
      });
    });
  }

  // --- Image Lightbox Modal (Profile & Projects) ---
  const imageModal = document.getElementById('image-modal');
  const modalClose = document.getElementById('modal-close');
  const modalImg = imageModal ? imageModal.querySelector('img') : null;
  const modalImgContainer = imageModal ? imageModal.querySelector('div') : null;

  const openModal = (src, alt) => {
    if (!imageModal || !modalImg) return;
    modalImg.src = src;
    modalImg.alt = alt;
    imageModal.classList.remove('opacity-0', 'pointer-events-none');
    if (!reducedMotion) {
      animate(imageModal, { opacity: [0, 1], filter: ['blur(10px)', 'blur(0px)'] }, {
        duration: 0.38, ease: [0.22, 1, 0.36, 1],
      }).then(() => {
        imageModal.style.removeProperty('opacity');
        imageModal.style.removeProperty('filter');
      });
    }
    if (modalImgContainer) {
      modalImgContainer.classList.remove('scale-95');
      modalImgContainer.classList.add('scale-100');
      if (!reducedMotion) animate(modalImgContainer, { opacity: [0, 1], scale: [0.94, 1], y: [18, 0] }, {
        duration: 0.48, ease: [0.22, 1, 0.36, 1],
      }).then(() => modalImgContainer.style.removeProperty('transform'));
    }
    document.body.classList.add('overflow-hidden');
  };

  const closeModal = () => {
    if (!imageModal) return;
    imageModal.classList.add('opacity-0', 'pointer-events-none');
    if (!reducedMotion) animate(imageModal, { opacity: 0, filter: 'blur(8px)' }, { duration: 0.22 }).then(() => {
      imageModal.style.removeProperty('opacity');
      imageModal.style.removeProperty('filter');
    });
    if (modalImgContainer) {
      modalImgContainer.classList.remove('scale-100');
      modalImgContainer.classList.add('scale-95');
      if (!reducedMotion) animate(modalImgContainer, { opacity: 0, scale: 0.96, y: 10 }, { duration: 0.2 }).then(() => {
        modalImgContainer.style.removeProperty('transform');
        modalImgContainer.style.removeProperty('opacity');
      });
    }
    document.body.classList.remove('overflow-hidden');
  };

  // Profile Image Trigger
  const profileImgTrigger = document.getElementById('profile-img-trigger');
  if (profileImgTrigger) {
    profileImgTrigger.addEventListener('click', () => {
      openModal(profileImgTrigger.src, profileImgTrigger.alt);
    });
  }

  // Project Image Triggers
  const projectImages = document.querySelectorAll('.project-card img');
  projectImages.forEach(img => {
    img.classList.add('cursor-pointer');
    img.addEventListener('click', () => {
      openModal(img.src, img.alt);
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (imageModal) {
    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal) {
        closeModal();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  // --- 3D Parallax Card Tilt Effect ---
  const interactiveArea = document.getElementById('hero-interactive-area');
  const tiltCard = document.getElementById('hero-tilt-card');
  
  if (interactiveArea && tiltCard) {
    const floatBadges = tiltCard.querySelectorAll('.absolute');
    const sceneChips = interactiveArea.querySelectorAll('.scene-chip');
    const bgRings = interactiveArea.querySelectorAll('.ring-wrapper-1, .ring-wrapper-2');
    const glowBlobs = [];

    interactiveArea.addEventListener('mousemove', (e) => {
      // Only run 3D effect on wider screens for premium desktop experience
      if (window.innerWidth < 1024) return;

      const rect = interactiveArea.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * 2 - 1; // -1 to 1
      const y = (e.clientY - rect.top) / rect.height * 2 - 1; // -1 to 1

      // Tilt angles
      const maxTilt = 10;
      const tiltX = -y * maxTilt;
      const tiltY = x * maxTilt;

      sceneChips.forEach((chip) => {
        chip.style.setProperty('--pointer-x', `${-x * 15}px`);
        chip.style.setProperty('--pointer-y', `${-y * 12}px`);
      });

      // Card Tilt
      tiltCard.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;

      // Badges translation
      floatBadges.forEach((badge) => {
        let factor = 12;
        if (badge.classList.contains('tilt-child-3d-deep')) {
          factor = 20;
        }
        const badgeX = x * factor;
        const badgeY = y * factor;
        badge.style.transform = `translateX(${badgeX}px) translateY(${badgeY}px)`;
      });

      // Rings translation (center offsets preserved)
      bgRings.forEach((ring) => {
        const ringX = -x * 15;
        const ringY = -y * 15;
        ring.style.transform = `translate(calc(-50% + ${ringX}px), calc(-50% + ${ringY}px))`;
      });

      // Glow blobs translation
      glowBlobs.forEach((blob) => {
        const blobX = -x * 25;
        const blobY = -y * 25;
        blob.style.transform = `translate(${blobX}px, ${blobY}px)`;
      });
    });

    interactiveArea.addEventListener('mouseleave', () => {
      // Reset smoothly
      tiltCard.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      
      floatBadges.forEach((badge) => {
        badge.style.transform = 'translateX(0px) translateY(0px)';
      });

      sceneChips.forEach((chip) => {
        chip.style.setProperty('--pointer-x', '0px');
        chip.style.setProperty('--pointer-y', '0px');
      });

      bgRings.forEach((ring) => {
        ring.style.transform = 'translate(-50%, -50%)';
      });

      glowBlobs.forEach((blob) => {
        blob.style.transform = 'translate(0px, 0px)';
      });
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePortfolio, { once: true });
} else {
  initializePortfolio();
}
