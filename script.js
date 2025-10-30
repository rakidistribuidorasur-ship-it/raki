/* ===========================
   script.js — Raki catálogo
   =========================== */

// Configuración EmailJS
const EMAILJS_SERVICE_ID = 'service_ggzbnsk';
const EMAILJS_TEMPLATE_ID = 'template_7xaxazk';

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
      if (modalImg) { 
        modalImg.src = img || ''; 
        modalImg.alt = alt || title || 'Imagen del producto'; 
      }
      if (modalTitle) modalTitle.textContent = title || '';
      if (modalDesc) modalDesc.textContent = desc || '';
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn?.focus();

      // Actualizar WhatsApp con el producto seleccionado
      if (whatsappFab && title) {
        const phoneNumber = '56984131147';
        const text = `Hola Raki 🌟, quiero información sobre: ${title}`;
        whatsappFab.href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
      }
      
      // Analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'view_item', {
          event_category: 'engagement',
          event_label: title
        });
      }
    }

    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      if (modalImg) modalImg.src = '';
      document.body.style.overflow = '';
      
      // Restaurar WhatsApp a mensaje por defecto
      if (whatsappFab) {
        const phoneNumber = '56984131147';
        const defaultText = 'Hola Raki 🌟, quiero información sobre sus productos';
        whatsappFab.href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultText)}`;
      }
    }

    // Agregar eventos a las cards existentes
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
          if (e.key === 'Enter' || e.key === ' ') { 
            e.preventDefault(); 
            card.click(); 
          }
        });
      });
    }

    overlay?.addEventListener('click', closeModal);
    closeBtn?.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { 
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); 
    });
  }

  /* ============================================
     FORMULARIO DE CONTACTO
     ============================================ */
  const contactSection = document.getElementById('contact');
  const cta = document.getElementById('cta-contact');
  const closeContact = document.getElementById('close-contact');
  const contactForm = document.getElementById('contact-form');
  const feedback = document.getElementById('contact-feedback');

  // Abrir/cerrar formulario
  function setContactOpen(open) {
    if (!contactSection) return;
    
    if (open) {
      contactSection.classList.remove('collapsed');
      contactSection.setAttribute('aria-hidden', 'false');
      contactSection.removeAttribute('inert');
      cta?.setAttribute('aria-expanded', 'true');
      
      // Scroll suave al formulario
      setTimeout(() => {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      
      // Focus en el primer campo
      setTimeout(() => {
        const firstInput = contactForm?.querySelector('input[name="name"]');
        firstInput?.focus();
      }, 400);
      
      // Analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'contact_form_open', {
          event_category: 'engagement',
          event_label: 'CTA Button'
        });
      }
    } else {
      contactSection.classList.add('collapsed');
      contactSection.setAttribute('aria-hidden', 'true');
      contactSection.setAttribute('inert', '');
      cta?.setAttribute('aria-expanded', 'false');
      cta?.focus();
    }
  }

  // Evento CTA flotante
  if (cta) {
    cta.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = contactSection && !contactSection.classList.contains('collapsed');
      setContactOpen(!isOpen);
    });
  }

  // Botón cerrar formulario
  if (closeContact) {
    closeContact.addEventListener('click', () => {
      setContactOpen(false);
    });
  }

  // Cerrar con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contactSection && !contactSection.classList.contains('collapsed')) {
      setContactOpen(false);
    }
  });

  // Botón limpiar
  const clearBtn = document.getElementById('clear-contact');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      contactForm?.reset();
      if (feedback) feedback.textContent = '';
    });
  }

  // ENVÍO DEL FORMULARIO - CORREGIDO
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const fd = new FormData(contactForm);
      
      // Obtener datos del formulario
      const from_name = fd.get('name')?.toString().trim() || '';
      const reply_to = fd.get('email')?.toString().trim() || '';
      const phone = fd.get('phone')?.toString().trim() || '';
      const category = fd.get('category')?.toString().trim() || '';
      const message = fd.get('message')?.toString().trim() || '';

      // Validación básica
      if (!from_name || !reply_to || !message) {
        if (feedback) {
          feedback.textContent = '⚠️ Por favor completa todos los campos requeridos (*)';
          feedback.style.color = '#c74242';
        }
        return;
      }

      // Deshabilitar botón y mostrar estado
      submitBtn?.setAttribute('disabled', 'true');
      submitBtn?.classList.add('sending');
      
      if (feedback) {
        feedback.textContent = '⏳ Enviando mensaje...';
        feedback.style.color = '#666';
      }

      // Preparar datos para EmailJS
      const templateParams = {
        from_name: from_name,
        reply_to: reply_to,
        phone: phone || 'No proporcionado',
        category: category || 'Sin categoría',
        message: message
      };

      try {
        // Verificar que EmailJS esté cargado
        if (!window.emailjs || typeof window.emailjs.send !== 'function') {
          throw new Error('EmailJS no está disponible');
        }

        // Enviar con EmailJS
        await window.emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams
        );

        // Éxito
        if (feedback) {
          feedback.textContent = '✅ ¡Mensaje enviado correctamente! Te contactaremos pronto.';
          feedback.style.color = '#2c6f4b';
        }

        // Analytics
        if (typeof gtag !== 'undefined') {
          gtag('event', 'form_submit', {
            event_category: 'conversion',
            event_label: 'Contact Form Success'
          });
        }

        // Limpiar formulario
        contactForm.reset();

        // Cerrar formulario después de 2 segundos
        setTimeout(() => {
          setContactOpen(false);
          if (feedback) feedback.textContent = '';
        }, 2000);

      } catch (error) {
        console.error('Error al enviar formulario:', error);

        // Fallback: abrir cliente de correo
        const subject = encodeURIComponent(`Contacto web: ${from_name}`);
        const body = encodeURIComponent(
          `Nombre/Empresa: ${from_name}\n` +
          `Email: ${reply_to}\n` +
          `Teléfono: ${phone}\n` +
          `Categoría: ${category}\n\n` +
          `Mensaje:\n${message}`
        );

        if (feedback) {
          feedback.textContent = '⚠️ Error al enviar. Abriendo tu cliente de correo...';
          feedback.style.color = '#ff7a59';
        }

        // Abrir mailto después de 1 segundo
        setTimeout(() => {
          window.location.href = `mailto:raki.distribuidora.sur@gmail.com?subject=${subject}&body=${body}`;
        }, 1000);

      } finally {
        // Rehabilitar botón
        submitBtn?.removeAttribute('disabled');
        submitBtn?.classList.remove('sending');
      }
    });
  }

  /* ============================================
     CARRUSEL
     ============================================ */
  const carouselEl = document.querySelector('[data-carousel]');
  if (carouselEl) {
    const track = carouselEl.querySelector('[data-track]');
    if (!track) return;
    
    let slides = Array.from(track.children).filter(n => n.nodeType === 1);
    const prevBtn = carouselEl.querySelector('.carousel-btn.prev');
    const nextBtn = carouselEl.querySelector('.carousel-btn.next');
    const indicatorsWrap = carouselEl.querySelector('.carousel-indicators');
    const total = slides.length;
    
    if (total === 0) return;

    // Crear indicadores si no existen
    let indicators = [];
    if (indicatorsWrap) {
      indicatorsWrap.innerHTML = '';
      slides.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.dataset.slide = String(i);
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-label', `Ir a imagen ${i + 1}`);
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
      
      // Analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'carousel_navigate', {
          event_category: 'engagement',
          event_label: `Slide ${current + 1}`
        });
      }
    }

    // Navegación
    prevBtn?.addEventListener('click', () => { goTo(current - 1); restartAuto(); });
    nextBtn?.addEventListener('click', () => { goTo(current + 1); restartAuto(); });
    indicators.forEach(btn => {
      btn.addEventListener('click', () => { 
        goTo(Number(btn.dataset.slide)); 
        restartAuto(); 
      });
    });

    // Autoplay
    function startAuto() { 
      stopAuto(); 
      autoplay = setInterval(() => goTo(current + 1), 5000); 
    }
    
    function stopAuto() { 
      if (autoplay) {
        clearInterval(autoplay);
        autoplay = null;
      }
    }

    // Gestos táctiles
    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      stopAuto();
    });

    track.addEventListener('touchmove', (e) => {
      deltaX = e.touches[0].clientX - startX;
      track.style.transform = `translateX(${-current * 100 + (deltaX / window.innerWidth) * 100}%)`;
    });

    track.addEventListener('touchend', (e) => {
      if (Math.abs(deltaX) > 50) {
        if (deltaX < 0) goTo(current + 1); // Izquierda
        else goTo(current - 1); // Derecha
      } else {
        goTo(current); // Retornar a la posición actual
      }
      startAuto();
    });

    // Inicializar
    goTo(0);
    startAuto();
  }
});
