/*!
  ASADIA STORE - MAIN JS
  Features:
   - Slider (Swiper if available, fallback)
   - Quick View modal wiring
   - Add-to-cart fly animation
   - Dark / Light mode (persist)
   - Mobile menu toggle
   - Search dropdown
   - Lazy load helpers
   - Footer year auto-update
*/

(function (window, document, $) {
  "use strict";

  // safe jQuery fallback
  $ = $ || window.jQuery || null;

  // small utility helpers
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function on(el, evt, fn) {
    if (!el) return;
    el.addEventListener(evt, fn);
  }
  function delegate(container, selector, event, handler) {
    if (!container) return;
    container.addEventListener(event, function (e) {
      var target = e.target;
      while (target && target !== container) {
        if (target.matches && target.matches(selector)) {
          handler.call(target, e);
          return;
        }
        target = target.parentNode;
      }
    });
  }
  function debounce(fn, wait) { var t; return function(){ clearTimeout(t); t = setTimeout(fn.bind(this, ...arguments), wait || 100); }; }

  /* ========== Slider init ========== */
  function initSlider() {
    if (window.Swiper) {
      try {
        // main slider (if markup uses .main-slider-nav)
        var mainSliders = document.querySelectorAll('.main-slider-nav');
        mainSliders.forEach(function (el) {
          // eslint-disable-next-line no-unused-vars
          var sw = new Swiper(el, {
            loop: true,
            autoplay: { delay: 4500, disableOnInteraction: false },
            speed: 800,
            pagination: { el: el.querySelector('.swiper-pagination'), clickable: true },
            navigation: {
              nextEl: el.querySelector('.swiper-button-next'),
              prevEl: el.querySelector('.swiper-button-prev')
            },
            effect: 'slide'
          });
        });
      } catch (e) { console.warn('Swiper init failed', e); }
    } else {
      // simple fallback: auto-rotate .ec-slide-item children
      var containers = qsa('.ec-slider');
      containers.forEach(function (wrap) {
        var slides = wrap.querySelectorAll('.ec-slide-item');
        if (!slides.length) return;
        var idx = 0;
        slides.forEach(function(s, i){ s.style.display = i === 0 ? '' : 'none'; });
        setInterval(function () {
          slides[idx].style.display = 'none';
          idx = (idx + 1) % slides.length;
          slides[idx].style.display = '';
        }, 4500);
      });
    }
  }

  /* ========== Quick View Modal (wires modal content from product card) ========== */
  function initQuickView() {
    var quickviewButtons = qsa('[data-link-action="quickview"], .quickview, a.quickview');
    quickviewButtons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        // find the closest product card
        var card = btn.closest('.ec-product-inner') || btn.closest('.ec-product-content') || btn.closest('.ec-fs-product');
        if (!card) {
          // fallback, open modal anyway
          var modalId = '#ec_quickview_modal';
          if (qs(modalId)) {
            var modal = new bootstrap.Modal(qs(modalId));
            modal.show();
          }
          return;
        }

        // gather product info from card
        var title = card.querySelector('.ec-pro-title') ? card.querySelector('.ec-pro-title').innerText.trim() : (card.querySelector('h5') ? card.querySelector('h5').innerText.trim() : 'Product');
        var images = [];
        var imgs = card.querySelectorAll('img');
        imgs.forEach(function (i) { if (i && i.src) images.push(i.src); });
        var priceNew = card.querySelector('.new-price') ? card.querySelector('.new-price').innerText : (card.querySelector('.ec-price .new-price') ? card.querySelector('.ec-price .new-price').innerText : '');
        var priceOld = card.querySelector('.old-price') ? card.querySelector('.old-price').innerText : '';
        var desc = card.querySelector('.ec-fs-pro-desc') ? card.querySelector('.ec-fs-pro-desc').innerText : (card.querySelector('.ec-pro-content p') ? card.querySelector('.ec-pro-content p').innerText : '');

        // fill modal elements
        var modal = qs('#ec_quickview_modal');
        if (!modal) return;
        var modalTitle = modal.querySelector('.ec-quick-title a');
        if (modalTitle) modalTitle.textContent = title;
        var modalDesc = modal.querySelector('.ec-quickview-desc');
        if (modalDesc) modalDesc.textContent = desc || 'No description available.';
        var modalOld = modal.querySelector('.ec-quickview-price .old-price');
        var modalNew = modal.querySelector('.ec-quickview-price .new-price');
        if (modalOld) modalOld.textContent = priceOld || '';
        if (modalNew) modalNew.textContent = priceNew || '';

        // images carousel inside modal
        var cover = modal.querySelector('.qty-product-cover');
        var nav = modal.querySelector('.qty-nav-thumb');
        if (cover && nav) {
          cover.innerHTML = '';
          nav.innerHTML = '';
          (images.length ? images : ['assets/images/product-image/3_1.jpg']).forEach(function (src) {
            var d = document.createElement('div'); d.className = 'qty-slide'; d.innerHTML = '<img class="img-responsive" src="' + src + '" alt="">';
            cover.appendChild(d);
            var t = document.createElement('div'); t.className = 'qty-slide'; t.innerHTML = '<img class="img-responsive" src="' + src + '" alt="">';
            nav.appendChild(t);
          });
        }

        // show bootstrap modal safely
        if (window.bootstrap && bootstrap.Modal) {
          var bs = new bootstrap.Modal(modal);
          bs.show();
        } else {
          modal.style.display = 'block';
          modal.classList.add('show');
        }
      });
    });
  }

  /* ========== Add to Cart - flying image animation ========== */
  function initAddToCart() {
    delegate(document.body, '.add-to-cart, button.add-to-cart, .ec-pro-actions .add-to-cart', 'click', function (e) {
      e.preventDefault();
      var btn = this;
      // find product image
      var card = btn.closest('.ec-product-inner') || btn.closest('.ec-product-content') || btn.closest('.ec-fs-product') || btn.closest('article');
      var img = card ? card.querySelector('img') : null;
      if (!img) {
        // small feedback
        btn.classList.add('added');
        setTimeout(function () { btn.classList.remove('added'); }, 800);
        return;
      }

      var cartCountEl = document.querySelector('.ec-cart-count') || document.querySelector('.ec-header-count') || qs('.ec-cart-noti');
      var cartTarget = document.querySelector('.ec-cart-float a') || document.querySelector('#ec-side-cart') || (cartCountEl ? cartCountEl : null);

      // create flying image
      var fly = img.cloneNode(true);
      var rect = img.getBoundingClientRect();
      fly.style.position = 'fixed';
      fly.style.left = rect.left + 'px';
      fly.style.top = rect.top + 'px';
      fly.style.width = (rect.width) + 'px';
      fly.style.height = 'auto';
      fly.style.zIndex = 9999;
      fly.style.transition = 'all 0.9s cubic-bezier(.4,.2,.2,1)';
      document.body.appendChild(fly);

      // calculate target
      var targetRect = cartTarget ? cartTarget.getBoundingClientRect() : { left: window.innerWidth - 60, top: 20, width: 40 };
      // force reflow then animate
      requestAnimationFrame(function () {
        fly.style.left = (targetRect.left + (targetRect.width / 2) - rect.width / 4) + 'px';
        fly.style.top = (targetRect.top + (targetRect.height / 2) - rect.height / 4) + 'px';
        fly.style.transform = 'scale(0.25) rotate(10deg)';
        fly.style.opacity = '0.6';
      });

      fly.addEventListener('transitionend', function () {
        try { fly.remove(); } catch (err) {}
        // increment cart count visually
        if (cartCountEl) {
          var n = parseInt(cartCountEl.innerText || cartCountEl.textContent || '0', 10);
          n = isNaN(n) ? 1 : n + 1;
          cartCountEl.innerText = n;
          // tiny pulse
          cartCountEl.classList.add('pulse');
          setTimeout(function () { cartCountEl.classList.remove('pulse'); }, 600);
        }
      });
    });
  }

  /* ========== Dark / Light Mode ========= */
  function initColorMode() {
    var toggle = qs('.ec-tools-sidebar .ec-mode-btn') || qs('.ec-mode-btn') || null;
    function applyMode(mode) {
      if (mode === 'dark') document.documentElement.classList.add('asadia-dark');
      else document.documentElement.classList.remove('asadia-dark');
      try { localStorage.setItem('asadia_mode', mode); } catch (e) {}
    }
    // load saved mode
    try {
      var saved = localStorage.getItem('asadia_mode') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      applyMode(saved);
    } catch (e) { applyMode('light'); }

    if (toggle) toggle.addEventListener('click', function () {
      var current = document.documentElement.classList.contains('asadia-dark') ? 'dark' : 'light';
      applyMode(current === 'dark' ? 'light' : 'dark');
    });
  }

  /* ========== Mobile Menu Toggle ========= */
  function initMobileMenu() {
    var burger = document.querySelector('.ec-header-btn.ec-side-toggle') || document.querySelector('.navbar-toggler-btn') || qs('.fi-rr-menu-burger');
    var mobile = qs('#ec-mobile-menu') || qs('#mobile-menu') || qs('.ec-mobile-menu');
    if (!burger || !mobile) return;
    burger.addEventListener('click', function (e) {
      e.preventDefault();
      mobile.classList.toggle('open');
      document.documentElement.classList.toggle('menu-open');
    });
    // close when clicking outside
    document.addEventListener('click', function (e) {
      if (!mobile) return;
      if (!mobile.contains(e.target) && !burger.contains(e.target)) {
        mobile.classList.remove('open');
        document.documentElement.classList.remove('menu-open');
      }
    });
  }

  /* ========== Search Dropdown ========= */
  function initSearchDropdown() {
    var searchTog = qs('.ec-search-btn, .search-toggle, .search-open');
    var searchBox = qs('.ec-search-form, .search-form-dropdown, #searchBox');
    if (!searchTog || !searchBox) {
      // maybe site uses different selectors — wire any .ec-search-form-show class
      searchTog = qs('.ec-search-btn') || searchTog;
      searchBox = qs('.ec-search-form') || searchBox;
    }
    if (!searchTog || !searchBox) return;
    searchTog.addEventListener('click', function (e) {
      e.preventDefault();
      searchBox.classList.toggle('visible');
      var input = searchBox.querySelector('input[type="search"], input[type="text"], .search-input');
      if (input) setTimeout(function(){ input.focus(); }, 80);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (searchBox.classList.contains('visible')) searchBox.classList.remove('visible');
      }
    });
  }

  /* ========== Lazy load small helper ========= */
  function initLazyLoad() {
    // add loading="lazy" if missing for product images
    qsa('img').forEach(function (img) {
      if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');
    });
    // reveal once loaded
    qsa('img[loading="lazy"]').forEach(function (img) {
      if (!img.classList.contains('reveal')) {
        img.addEventListener('load', function () { img.classList.add('reveal'); });
      }
    });
  }

  /* ========== Footer Year & Minor helpers ========= */
  function initFooterYear() {
    var el = qs('#copyright_year') || qs('.copyright_year');
    if (!el) return;
    el.textContent = new Date().getFullYear();
  }

  /* ========== Init all ========= */
  function initAll() {
    initSlider();
    initQuickView();
    initAddToCart();
    initColorMode();
    initMobileMenu();
    initSearchDropdown();
    initLazyLoad();
    initFooterYear();

    // small UX helpers
    // smooth scroll for anchor links
    qsa('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href');
        if (href === '#' || href === '#!') return;
        var target = qs(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // handle newsletter form simple UX
    var newsForm = qs('#ec-newsletter-form');
    if (newsForm) {
      newsForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = newsForm.querySelector('input[type="email"]');
        if (input && input.value) {
          input.value = '';
          // tiny thanks message (client-side only)
          var btn = newsForm.querySelector('button') || null;
          if (btn) {
            var old = btn.innerHTML;
            btn.innerHTML = 'Thanks!';
            setTimeout(function () { btn.innerHTML = old; }, 1600);
          }
        }
      });
    }
  }

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})(window, document, window.jQuery);
