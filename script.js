/* ===========================
   script.js — Raki catálogo
   =========================== */

const EMAILJS_SERVICE_ID = 'service_ggzbnsk';
const EMAILJS_TEMPLATE_ID = 'template_7xaxazk';

const productosRenderizados = new Set();
let productosCache = null;
let cardObserver = null;

document.addEventListener('DOMContentLoaded', () => {
  initCardObserver();
  initFilters();
  initBodyTheme();
  initProductModal();
  initContactForm();
  initCarousel();
  initCarouselModal();
  loadProductos();
});

/* -------- Animaciones de tarjetas -------- */
function initCardObserver() {
  cardObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.01, rootMargin: "350px 0px" });
}

function observeCard(card) {
  cardObserver?.observe(card);
}

/* -------- Filtros (si existieran) -------- */
function initFilters() {
  const filterButtons = document.querySelectorAll('.filter-buttons button[data-category]');
  if (!filterButtons.length) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-category');
      filterCategory(category);
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function filterCategory(category) {
  document.querySelectorAll('.grid[data-category]').forEach(grid => {
    const match = category === 'all' || grid.dataset.category === category;
    grid.parentElement.classList.toggle('hidden', !match);
  });
}

/* -------- Fondo según hora -------- */
function initBodyTheme() {
  const hour = new Date().getHours();
  if (hour >= 18 || hour < 7) {
    document.body.style.backgroundColor = '#f1e7dc';
  }
}

/* -------- Modal de producto -------- */
function initProductModal() {
  const modal = document.getElementById('product-modal');
  if (!modal) return;

  const modalImg = modal.querySelector('.modal-img');
  const modalTitle = modal.querySelector('.modal-title');
  const modalDesc = modal.querySelector('.modal-desc');
  const modalPrice = modal.querySelector('.modal-price');
  const closeBtn = modal.querySelector('.modal-close');
  const overlay = modal.querySelector('.modal-overlay');
  const whatsappFab = document.getElementById('whatsapp-fab');

  const getDefaultWhatsappHref = () => {
    const phoneNumber = '56984131147';
    const text = 'Hola Raki 🌟, quiero información sobre sus productos';
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
  };

  function openModal({ img, alt, title, desc, price }) {
    if (modalImg) {
      modalImg.src = img || '';
      modalImg.alt = alt || title || 'Imagen del producto';
    }
    if (modalTitle) modalTitle.textContent = title || '';
    if (modalDesc) modalDesc.textContent = desc || '';
    if (modalPrice) modalPrice.textContent = price || '';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();

    if (whatsappFab && title) {
      const phoneNumber = '56984131147';
      const text = `Hola Raki 🌟, quiero información sobre: ${title}`;
      whatsappFab.href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    }

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

    if (whatsappFab) {
      whatsappFab.href = getDefaultWhatsappHref();
    }
  }

  function handleCard(card) {
    card.style.cursor = 'pointer';
    if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');

    card.addEventListener('click', () => {
      const imgEl = card.querySelector('img');
      const titleEl = card.querySelector('.card-content h3');
      const descEl = card.querySelector('.card-content p:not(.price)');
      const priceEl = card.querySelector('.price');

      openModal({
        img: imgEl?.src ?? '',
        alt: imgEl?.alt ?? '',
        title: titleEl?.textContent.trim() ?? '',
        desc: descEl?.textContent.trim() ?? '',
        price: priceEl?.textContent.trim() ?? ''
      });
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  }

  modal.dataset.cardHandler = 'true';

  modal.addEventListener('raki:wire-cards', () => {
    const cards = document.querySelectorAll('.grid .card:not([data-wired="true"])');
    cards.forEach(card => {
      handleCard(card);
      card.dataset.wired = 'true';
    });
  });

  overlay?.addEventListener('click', closeModal);
  closeBtn?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

/* -------- Formulario de contacto -------- */
function initContactForm() {
  const contactSection = document.getElementById('contact');
  const cta = document.getElementById('cta-contact');
  const closeContact = document.getElementById('close-contact');
  const contactForm = document.getElementById('contact-form');
  const feedback = document.getElementById('contact-feedback');
  const clearBtn = document.getElementById('clear-contact');

  function setContactOpen(open) {
    if (!contactSection) return;

    if (open) {
      contactSection.classList.remove('collapsed');
      contactSection.setAttribute('aria-hidden', 'false');
      contactSection.removeAttribute('inert');
      cta?.setAttribute('aria-expanded', 'true');

      setTimeout(() => {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

      setTimeout(() => {
        contactForm?.querySelector('input[name="name"]')?.focus();
      }, 400);

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

  cta?.addEventListener('click', (e) => {
    e.preventDefault();
    const isOpen = contactSection && !contactSection.classList.contains('collapsed');
    setContactOpen(!isOpen);
  });

  closeContact?.addEventListener('click', () => setContactOpen(false));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contactSection && !contactSection.classList.contains('collapsed')) {
      setContactOpen(false);
    }
  });

  clearBtn?.addEventListener('click', () => {
    contactForm?.reset();
    if (feedback) feedback.textContent = '';
  });

  contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const fd = new FormData(contactForm);

    const from_name = fd.get('name')?.toString().trim() ?? '';
    const reply_to = fd.get('email')?.toString().trim() ?? '';
    const phone = fd.get('phone')?.toString().trim() ?? '';
    const category = fd.get('category')?.toString().trim() ?? '';
    const message = fd.get('message')?.toString().trim() ?? '';

    if (!from_name || !reply_to || !message) {
      if (feedback) {
        feedback.textContent = '⚠️ Por favor completa todos los campos requeridos (*)';
        feedback.style.color = '#c74242';
      }
      return;
    }

    submitBtn?.setAttribute('disabled', 'true');
    submitBtn?.classList.add('sending');
    if (feedback) {
      feedback.textContent = '⏳ Enviando mensaje...';
      feedback.style.color = '#666';
    }

    const templateParams = {
      from_name,
      reply_to,
      phone: phone || 'No proporcionado',
      category: category || 'Sin categoría',
      message
    };

    try {
      if (!window.emailjs || typeof window.emailjs.send !== 'function') {
        throw new Error('EmailJS no está disponible');
      }

      await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);

      if (feedback) {
        feedback.textContent = '✅ ¡Mensaje enviado correctamente! Te contactaremos pronto.';
        feedback.style.color = '#2c6f4b';
      }

      if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit', {
          event_category: 'conversion',
          event_label: 'Contact Form Success'
        });
      }

      contactForm.reset();

      setTimeout(() => {
        setContactOpen(false);
        if (feedback) feedback.textContent = '';
      }, 2000);
    } catch (error) {
      console.error('Error al enviar formulario:', error);

      const subject = encodeURIComponent(`Contacto web: ${from_name}`);
      const body = encodeURIComponent(
        `Nombre/Empresa: ${from_name}\nEmail: ${reply_to}\nTeléfono: ${phone}\nCategoría: ${category}\n\nMensaje:\n${message}`
      );

      if (feedback) {
        feedback.textContent = '⚠️ Error al enviar. Abriendo tu cliente de correo...';
        feedback.style.color = '#ff7a59';
      }

      setTimeout(() => {
        window.location.href = `mailto:raki.distribuidora.sur@gmail.com?subject=${subject}&body=${body}`;
      }, 1000);
    } finally {
      submitBtn?.removeAttribute('disabled');
      submitBtn?.classList.remove('sending');
    }
  });
}

/* -------- Carrusel -------- */
function initCarousel() {
  const carousel = document.querySelector('[data-carousel]');
  const track = carousel?.querySelector('[data-track]');
  if (!track) return;

  const slides = [...track.querySelectorAll('.carousel-slide')];
  const indicatorsWrap = carousel.querySelector('.carousel-indicators');
  if (slides.length < 2) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let timer = null;
  let touchStart = null;

  if (indicatorsWrap) {
    indicatorsWrap.replaceChildren();
    slides.forEach((_, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.slide = String(index);
      button.setAttribute('aria-label', `Mostrar imagen ${index + 1} de ${slides.length}`);
      indicatorsWrap.appendChild(button);
    });
  }

  const indicators = [...(indicatorsWrap?.querySelectorAll('button') ?? [])];
  function show(index, manual = false) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translate3d(-${current * 100}%, 0, 0)`;
    indicators.forEach((button, i) => {
      button.classList.toggle('active', i === current);
      button.setAttribute('aria-current', i === current ? 'true' : 'false');
    });
    if (manual && typeof gtag === 'function') {
      gtag('event', 'carousel_navigate', {event_category:'engagement', event_label:`Slide ${current + 1}`});
    }
  }
  function stop() {
    if (timer !== null) clearInterval(timer);
    timer = null;
  }
  function play() {
    stop();
    if (!document.hidden && !reducedMotion.matches) {
      timer = setInterval(() => show(current + 1), 5000);
    }
  }
  function navigate(step) {
    show(current + step, true);
    play();
  }

  indicators.forEach((button, index) => {
    button.addEventListener('click', () => {show(index, true); play();});
  });

  const controls = document.createElement('div');
  controls.className = 'carousel-navigation';
  for (const [direction, symbol, label] of [[-1, '‹', 'Imagen anterior'], [1, '›', 'Imagen siguiente']]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = symbol;
    button.setAttribute('aria-label', label);
    button.addEventListener('click', () => navigate(direction));
    controls.appendChild(button);
  }
  carousel.appendChild(controls);

  track.addEventListener('touchstart', event => {
    touchStart = event.changedTouches[0]?.clientX ?? null;
    stop();
  }, {passive:true});
  track.addEventListener('touchend', event => {
    if (touchStart === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchStart) - touchStart;
    touchStart = null;
    if (Math.abs(delta) > 45) show(current + (delta < 0 ? 1 : -1), true);
    play();
  }, {passive:true});

  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', play);
  carousel.addEventListener('focusin', stop);
  carousel.addEventListener('focusout', event => {
    if (!carousel.contains(event.relatedTarget)) play();
  });
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : play());
  reducedMotion.addEventListener?.('change', play);

  show(0);
  play();
}

/* -------- Modal del carrusel -------- */
function initCarouselModal() {
  const carouselSlides = document.querySelectorAll('.carousel-slide img');
  const carouselModal = document.getElementById('carousel-modal');
  if (!carouselSlides.length || !carouselModal) return;

  const carouselClose = carouselModal.querySelector('.modal-close');
  const carouselOverlay = carouselModal.querySelector('.modal-overlay');
  let lastFocusedElement = null;

  function openCarouselModal() {
    lastFocusedElement = document.activeElement;
    carouselModal.classList.add('open');
    carouselModal.removeAttribute('aria-hidden');
    carouselModal.removeAttribute('inert');
    document.body.style.overflow = 'hidden';
    carouselClose?.focus();

    if (typeof trackEvent === 'function') {
      trackEvent('modal_open', 'carousel', 'sab_humo');
    }
  }

  function closeCarouselModal() {
    carouselModal.classList.remove('open');
    carouselModal.setAttribute('aria-hidden', 'true');
    carouselModal.setAttribute('inert', '');
    document.body.style.overflow = '';
    lastFocusedElement?.focus();
  }

  carouselSlides.forEach((img) => {
    img.addEventListener('click', openCarouselModal);
  });

  carouselClose?.addEventListener('click', closeCarouselModal);
  carouselOverlay?.addEventListener('click', closeCarouselModal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && carouselModal.classList.contains('open')) {
      closeCarouselModal();
    }
  });
}

/* -------- Productos -------- */
async function loadProductos() {
  if (productosCache) {
    renderAllProducts(productosCache);
    return;
  }

  try {
    const response = await fetch('./productos.json', { cache: 'default' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    productosCache = data;
    renderAllProducts(data);
  } catch (error) {
    console.error('Error cargando productos:', error);
  }
}

function renderAllProducts(data) {
  Object.entries(data).forEach(([categoria, items]) => {
    renderProductos(categoria, items);
  });

  document.getElementById('product-modal')?.dispatchEvent(new Event('raki:wire-cards'));
}

function dedupeById(items = []) {
  const vistos = new Set();
  return items.filter(item => {
    if (!item || !item.id || vistos.has(item.id)) return false;
    vistos.add(item.id);
    return true;
  });
}

function renderProductos(categoria, productos = []) {
  const grid = document.querySelector(`.grid[data-category="${categoria}"]`);
  if (!grid || productosRenderizados.has(categoria)) return;

  grid.innerHTML = '';
  dedupeById(productos).forEach(producto => {
    const card = document.createElement('article');
    card.className = 'card visible';
    card.dataset.productId = producto.id;
    card.dataset.category = categoria;

    const eager = categoria === "gourmet";
    card.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.titulo}" loading="${eager ? "eager" : "lazy"}" decoding="async" fetchpriority="${eager ? "high" : "auto"}" width="480" height="320" />
      <div class="card-content">
        <h3>${producto.titulo}</h3>
        <p>${producto.descripcion}</p>
        <p class="price">${producto.precio}</p>
      </div>
    `;

    card.addEventListener('click', () => {
      trackEvent?.('product_click', categoria, producto.id, producto.valor || 0);
    });

    grid.appendChild(card);
    observeCard(card);
  });

  productosRenderizados.add(categoria);
  grid.closest('section')?.classList.remove('hidden');
}
