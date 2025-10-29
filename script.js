/* ===========================
   script.js — Raki catálogo (mejorado)
   =========================== */

// Configuración EmailJS
const EMAILJS_SERVICE_ID = 'service_ggzbnsk';
const EMAILJS_TEMPLATE_ID = 'template_7xaxazk';

// util: espera a que emailjs esté disponible (timeout opcional)
function waitForEmailJS(timeout = 6000) {
  return new Promise((resolve, reject) => {
    if (window.emailjs && typeof window.emailjs.send === 'function') return resolve();
    const start = Date.now();
    const iv = setInterval(() => {
      if (window.emailjs && typeof window.emailjs.send === 'function') {
        clearInterval(iv);
        return resolve();
      }
      if (Date.now() - start > timeout) {
        clearInterval(iv);
        return reject(new Error('EmailJS no cargó en tiempo'));
      }
    }, 120);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Animación aparición cards
  const cards = document.querySelectorAll(".card");
  if (cards.length > 0) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    cards.forEach(card => observer.observe(card));
  }

  // Filtros (si existen botones)
  const filterButtons = document.querySelectorAll(".filter-buttons button[data-category]");
  if (filterButtons.length > 0) {
    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        filterCategory(btn.getAttribute("data-category"));
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  // Fondo según hora
  const hour = new Date().getHours();
  if (hour >= 18 || hour < 7) document.body.style.backgroundColor = "#f1e7dc";

  /* --- Modal producto --- */
  const modal = document.getElementById('product-modal');
  const whatsappFab = document.getElementById('whatsapp-fab');

  if (modal) {
    const modalImg = modal.querySelector('.modal-img');
    const modalTitle = modal.querySelector('.modal-title');
    const modalDesc = modal.querySelector('.modal-desc');
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');

    function openModal({ img, title, desc, alt }) {
      if (modalImg) { modalImg.src = img || ''; modalImg.alt = alt || title || 'Imagen del producto'; }
      if (modalTitle) modalTitle.textContent = title || '';
      if (modalDesc) modalDesc.textContent = desc || '';
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn?.focus();

      if (whatsappFab && title) {
        const base = 'https://wa.me/56984131147';
        const text = `Hola Raki 🌟, quiero información sobre: ${title}`;
        whatsappFab.href = `${base}?text=${encodeURIComponent(text)}`;
      }
    }

    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      if (modalImg) modalImg.src = '';
      document.body.style.overflow = '';
      if (whatsappFab) {
        whatsappFab.href = 'https://wa.me/56984131147?text=Hola%20Raki%20%F0%9F%8C%9F%2C%20quiero%20informaci%C3%B3n%20sobre%20sus%20productos';
      }
    }

    const cardEls = document.querySelectorAll('.card');
    if (cardEls.length > 0) {
      cardEls.forEach(card => {
        card.style.cursor = 'pointer';
        if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
        card.addEventListener('click', () => {
          const imgEl = card.querySelector('img');
          const titleEl = card.querySelector('.card-content h3');
          const descEl = card.querySelector('.card-content p:not(.price)');
          openModal({
            img: imgEl ? imgEl.src : '',
            alt: imgEl ? (imgEl.alt || '') : '',
            title: titleEl ? titleEl.textContent.trim() : '',
            desc: descEl ? descEl.textContent.trim() : ''
          });
        });
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
        });
      });
    }

    overlay?.addEventListener('click', closeModal);
    closeBtn?.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
  }

  /* --- Contacto: abrir/ocultar, enviar --- */
  const contactSection = document.getElementById('contact');
  const cta = document.getElementById('cta-contact');
  const closeContact = document.getElementById('close-contact');
  const contactForm = document.getElementById('contact-form');
  const feedback = document.getElementById('contact-feedback');

  // Usar inert cuando esté cerrado (mejor que aria-hidden si hay foco)
  function setInert(el, state) {
    try { el.inert = state; } catch (e) { /* inert no soportado: ignorar */ }
  }

  function setContactOpen(open, options = {}) {
    if (!contactSection) return;
    if (open) {
      setInert(contactSection, false);
      contactSection.classList.remove('collapsed');
      contactSection.setAttribute('aria-hidden', 'false');
      contactSection.setAttribute('aria-expanded', 'true');
      cta?.setAttribute('aria-expanded', 'true');
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => contactForm?.querySelector('input[name="name"]')?.focus(), 350);
    } else {
      const active = document.activeElement;
      if (active && contactSection.contains(active)) {
        cta?.focus();
      }
      contactSection.classList.add('collapsed');
      contactSection.setAttribute('aria-hidden', 'true');
      contactSection.setAttribute('aria-expanded', 'false');
      cta?.setAttribute('aria-expanded', 'false');
      setInert(contactSection, true);
      if (options.returnFocus) cta?.focus();
    }
  }

  if (cta) {
    cta.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = contactSection && !contactSection.classList.contains('collapsed');
      setContactOpen(!isOpen);
    });
  }
  if (closeContact) closeContact.addEventListener('click', () => setContactOpen(false, { returnFocus: true }));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contactSection && !contactSection.classList.contains('collapsed')) {
      setContactOpen(false, { returnFocus: true });
    }
  });

  document.getElementById('clear-contact')?.addEventListener('click', () => {
    contactForm?.reset();
    if (feedback) feedback.textContent = '';
  });

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const fd = new FormData(contactForm);
      const from_name = (fd.get('name') || '').toString().trim();
      const reply_to = (fd.get('email') || '').toString().trim();
      const phone = (fd.get('phone') || '').toString().trim();
      const category = (fd.get('category') || '').toString().trim();
      const message = (fd.get('message') || '').toString().trim();

      if (!from_name || !reply_to || !message) {
        if (feedback) { feedback.textContent = 'Por favor completa los campos requeridos (*).'; feedback.style.color = 'crimson'; }
        return;
      }

      submitBtn?.setAttribute('disabled', 'true');
      submitBtn?.classList.add('sending');
      if (feedback) { feedback.textContent = 'Enviando...'; feedback.style.color = '#444'; }

      const templateParams = { from_name, reply_to, phone, category, message };

      const hasService = EMAILJS_SERVICE_ID && EMAILJS_SERVICE_ID !== 'TU_SERVICE_ID';
      if (!hasService) {
        const subject = encodeURIComponent(`Contacto web: ${from_name} - ${category || 'Sin categoría'}`);
        const body = encodeURIComponent(`Nombre/Empresa: ${from_name}\nEmail: ${reply_to}\nTeléfono: ${phone}\nCategoría: ${category}\n\nMensaje:\n${message}`);
        window.location.href = `mailto:raki.distribuidora.sur@gmail.com?subject=${subject}&body=${body}`;
        if (feedback) { feedback.textContent = 'Se abrió su cliente de correo. Si no, envíe manualmente a raki.distribuidora.sur@gmail.com'; feedback.style.color = '#2c6f4b'; }
        contactForm.reset();
        submitBtn?.removeAttribute('disabled');
        submitBtn?.classList.remove('sending');
        setContactOpen(false, { returnFocus: true });
        return;
      }

      try {
        await waitForEmailJS(6000);
        await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
        if (feedback) { feedback.textContent = 'Mensaje enviado correctamente. Gracias.'; feedback.style.color = '#2c6f4b'; }
        contactForm.reset();
        setTimeout(() => setContactOpen(false, { returnFocus: true }), 800);
      } catch (err) {
        console.error('EmailJS error / fallback:', err);
        const subject = encodeURIComponent(`Contacto web: ${from_name} - ${category || 'Sin categoría'}`);
        const body = encodeURIComponent(`Nombre/Empresa: ${from_name}\nEmail: ${reply_to}\nTeléfono: ${phone}\nCategoría: ${category}\n\nMensaje:\n${message}`);
        window.location.href = `mailto:raki.distribuidora.sur@gmail.com?subject=${subject}&body=${body}`;
        if (feedback) { feedback.textContent = 'No fue posible enviar desde el sitio, se abrirá su cliente de correo.'; feedback.style.color = '#2c6f4b'; }
        contactForm.reset();
        setContactOpen(false, { returnFocus: true });
      } finally {
        submitBtn?.removeAttribute('disabled');
        submitBtn?.classList.remove('sending');
      }
    });
  }

  /* --- Carrusel simple (2 imágenes) --- */
  const carouselEl = document.querySelector('[data-carousel]');
  if (carouselEl) {
    const track = carouselEl.querySelector('[data-track]');
    if (!track) return; // nada que hacer sin track
    let slides = Array.from(track.children).filter(n => n.nodeType === 1);
    const prevBtn = carouselEl.querySelector('.carousel-btn.prev');
    const nextBtn = carouselEl.querySelector('.carousel-btn.next');
    let indicators = Array.from(carouselEl.querySelectorAll('.carousel-indicators button'));
    const total = slides.length;
    if (total === 0) return;

    // crear indicadores si no existen o si la cantidad no coincide
    const indicatorsWrap = carouselEl.querySelector('.carousel-indicators');
    if (!indicatorsWrap) {
      const wrap = document.createElement('div');
      wrap.className = 'carousel-indicators';
      wrap.setAttribute('role', 'tablist');
      slides.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.dataset.slide = String(i);
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-controls', `slide-${i}`);
        wrap.appendChild(btn);
      });
      carouselEl.appendChild(wrap);
      indicators = Array.from(wrap.querySelectorAll('button'));
    } else if (indicators.length !== total) {
      indicatorsWrap.innerHTML = '';
      slides.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.dataset.slide = String(i);
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-controls', `slide-${i}`);
        indicatorsWrap.appendChild(btn);
      });
      indicators = Array.from(indicatorsWrap.querySelectorAll('button'));
    }

    let current = 0;
    let autoplay = null;
    let startX = 0;
    let deltaX = 0;

    function goTo(index) {
      current = ((index % total) + total) % total;
      const offset = -current * 100;
      track.style.transform = `translateX(${offset}%)`;
      indicators.forEach((btn, i) => {
        btn.classList.toggle('active', i === current);
        btn.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });
    }

    prevBtn?.addEventListener('click', () => { goTo(current - 1); restartAuto(); });
    nextBtn?.addEventListener('click', () => { goTo(current + 1); restartAuto(); });
    indicators.forEach(btn => btn.addEventListener('click', () => { goTo(Number(btn.dataset.slide)); restartAuto(); }));

    function startAuto() { stopAuto(); autoplay = setInterval(() => goTo(current + 1), 5000); }
    function stopAuto() { if (autoplay) { clearInterval(autoplay); autoplay = null; } }
    function restartAuto() { stopAuto(); startAuto(); }

    // touch / swipe
    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      deltaX = 0;
      track.style.transition = 'none';
      stopAuto();
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      deltaX = e.touches[0].clientX - startX;
      const pct = (deltaX / carouselEl.clientWidth) * 100;
      track.style.transform = `translateX(${ -current * 100 + pct }%)`;
    }, { passive: true });

    track.addEventListener('touchend', () => {
      track.style.transition = '';
      if (Math.abs(deltaX) > (carouselEl.clientWidth * 0.15)) {
        if (deltaX > 0) goTo(current - 1);
        else goTo(current + 1);
      } else {
        goTo(current);
      }
      restartAuto();
    });

    // pausa al hover / focus
    carouselEl.addEventListener('mouseenter', stopAuto);
    carouselEl.addEventListener('mouseleave', startAuto);
    carouselEl.addEventListener('focusin', stopAuto);
    carouselEl.addEventListener('focusout', startAuto);

    // teclado (solo si existen botones)
    if (prevBtn || nextBtn) {
      const onKey = (e) => {
        if (e.key === 'ArrowLeft') prevBtn?.click();
        if (e.key === 'ArrowRight') nextBtn?.click();
      };
      document.addEventListener('keydown', onKey);
    }

    // init
    track.style.willChange = 'transform';
    goTo(0);
    startAuto();
  } // end carousel

  // Botón WhatsApp
  const wspBtn = document.getElementById('whatsapp-fab');
  if (wspBtn) {
    wspBtn.addEventListener('click', (e) => {
      // Analytics: track WhatsApp click
      if (typeof gtag !== 'undefined') {
        gtag('event', 'click', {
          event_category: 'engagement',
          event_label: 'WhatsApp FAB'
        });
      }
      // URL correcta
      const phoneNumber = '56984131147';
      const message = encodeURIComponent('Hola Raki 🌟, quiero información sobre sus productos');
      wspBtn.href = `https://wa.me/${phoneNumber}?text=${message}`;
    });
  }

}); // end DOMContentLoaded

// Filtrado por sección
function filterCategory(category) {
  const sections = document.querySelectorAll("section");
  sections.forEach(sec => {
    if (category === "all" || sec.classList.contains(category)) sec.classList.remove("hidden");
    else sec.classList.add("hidden");
  });
}

/* Ignorar archivos de sistema
.DS_Store
Thumbs.db

# Ignorar node_modules si usas npm
node_modules/

# Ignorar archivos de editor
.vscode/
.idea/
*.swp
*.swo
*~ */
