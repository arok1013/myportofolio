document.addEventListener('DOMContentLoaded', () => {
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

  // --- Mobile Menu Toggle ---
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIconOpen = document.getElementById('menu-icon-open');
  const menuIconClose = document.getElementById('menu-icon-close');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      mobileMenu.classList.toggle('flex');
      menuIconOpen.classList.toggle('hidden');
      menuIconClose.classList.toggle('hidden');
    });

    // Close menu when clicking a link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
        menuIconOpen.classList.remove('hidden');
        menuIconClose.classList.add('hidden');
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

  // --- Scroll Reveal Animation ---
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Unobserve once revealed to keep layout performant
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

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
            setTimeout(() => {
              card.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
            }, 50);
          } else {
            card.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
            setTimeout(() => {
              card.style.display = 'none';
            }, 300);
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
    if (modalImgContainer) {
      modalImgContainer.classList.remove('scale-95');
      modalImgContainer.classList.add('scale-100');
    }
    document.body.classList.add('overflow-hidden');
  };

  const closeModal = () => {
    if (!imageModal) return;
    imageModal.classList.add('opacity-0', 'pointer-events-none');
    if (modalImgContainer) {
      modalImgContainer.classList.remove('scale-100');
      modalImgContainer.classList.add('scale-95');
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
});
