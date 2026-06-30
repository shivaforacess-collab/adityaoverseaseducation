/* =============================================
   ADITYA OVERSEAS EDUCATION - Main JS
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- HAMBURGER MENU ---- */
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
      });
    });
  }

  /* ---- STICKY HEADER ---- */
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  /* ---- ACTIVE NAV LINK ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav a');

  const activateNav = () => {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        const id = section.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', activateNav);

  /* ---- SCROLL REVEAL ---- */
  const reveals = document.querySelectorAll('[data-reveal]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach(el => observer.observe(el));

  /* ---- COUNTER ANIMATION ---- */
  const counters = document.querySelectorAll('[data-count]');

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => countObserver.observe(el));

  function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  /* ---- GALLERY ADMIN PANEL ---- */
  const dropZone = document.querySelector('.upload-drop-zone');
  const fileInput = document.getElementById('file-input');
  const galleryGrid = document.getElementById('gallery-grid');
  const uploadedImages = JSON.parse(localStorage.getItem('aoe_gallery') || '[]');

  // Load stored images
  if (galleryGrid) {
    renderGallery(uploadedImages);

    // Click to browse
    if (dropZone) {
      dropZone.addEventListener('click', () => fileInput && fileInput.click());

      dropZone.addEventListener('dragover', e => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      });

      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));

      dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        handleFiles(Array.from(e.dataTransfer.files));
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', () => handleFiles(Array.from(fileInput.files)));
    }
  }

  function handleFiles(files) {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (!imageFiles.length) { showToast('Please select image files only.'); return; }

    let loaded = 0;
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedImages.push({ src: e.target.result, name: file.name, date: new Date().toLocaleDateString() });
        loaded++;
        if (loaded === imageFiles.length) {
          try { localStorage.setItem('aoe_gallery', JSON.stringify(uploadedImages)); } catch(e) {}
          renderGallery(uploadedImages);
          showToast(`✔ ${imageFiles.length} image(s) added to gallery!`);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function renderGallery(images) {
    if (!galleryGrid) return;

    if (!images.length) {
      galleryGrid.innerHTML = `
        <div class="gallery-item">
          <div class="gallery-placeholder">
            <div class="icon">🖼️</div>
            <span>No images yet. Upload above to get started.</span>
          </div>
        </div>
        <div class="gallery-item">
          <div class="gallery-placeholder">
            <div class="icon">📷</div>
            <span>Add campus / event photos</span>
          </div>
        </div>
        <div class="gallery-item">
          <div class="gallery-placeholder">
            <div class="icon">🎓</div>
            <span>Student success stories</span>
          </div>
        </div>`;
      return;
    }

    galleryGrid.innerHTML = images.map((img, i) => `
      <div class="gallery-item" data-index="${i}">
        <img src="${img.src}" alt="${img.name}" loading="lazy">
        <div class="gallery-overlay">
          <button onclick="deleteGalleryItem(${i})" style="background:rgba(255,255,255,0.2);border:2px solid white;color:white;padding:0.4rem 1rem;border-radius:50px;cursor:pointer;font-family:var(--font);font-weight:700;">🗑 Remove</button>
        </div>
      </div>`).join('');
  }

  window.deleteGalleryItem = function(index) {
    uploadedImages.splice(index, 1);
    try { localStorage.setItem('aoe_gallery', JSON.stringify(uploadedImages)); } catch(e) {}
    renderGallery(uploadedImages);
    showToast('Image removed.');
  };

  document.getElementById('clear-gallery')?.addEventListener('click', () => {
    if (confirm('Clear all gallery images?')) {
      uploadedImages.length = 0;
      localStorage.removeItem('aoe_gallery');
      renderGallery([]);
      showToast('Gallery cleared.');
    }
  });

  /* ---- CONTACT FORM ---- */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('.form-submit');
      btn.textContent = 'Sending…';
      btn.disabled = true;
      setTimeout(() => {
        form.reset();
        btn.textContent = 'Send Message';
        btn.disabled = false;
        showToast('✔ Message sent! We will contact you soon.');
      }, 1400);
    });
  }

  /* ---- TOAST ---- */
  function showToast(msg) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }

  /* ---- SMOOTH SCROLL FOR ANCHORS ---- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

});
