/**
 * Agota Urbikaite — Oracle of Freedom
 * Video URLs and WhatsApp: edit assets/data/site.json or use Admin (local preview).
 */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;

  function qs(sel, ctx) {
    return (ctx || doc).querySelector(sel);
  }
  function qsa(sel, ctx) {
    return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel));
  }

  function getVideos() {
    var site = window.__ORACLE_SITE__;
    if (site && Array.isArray(site.videos) && site.videos.length)
      return site.videos;
    return [
      { id: "v1", title: "Videography — piece 1", url: "", poster: "" },
      { id: "v2", title: "Videography — piece 2", url: "", poster: "" },
      { id: "v3", title: "Videography — piece 3", url: "", poster: "" },
      { id: "v4", title: "Videography — piece 4", url: "", poster: "" },
      { id: "mv1", title: "Music video — featured", url: "", poster: "" },
    ];
  }

  function getWhatsapp() {
    var site = window.__ORACLE_SITE__;
    if (site && site.contact && site.contact.whatsappE164)
      return String(site.contact.whatsappE164);
    return "";
  }

  function youtubeEmbed(url) {
    var m = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
    );
    return m ? "https://www.youtube.com/embed/" + m[1] + "?autoplay=1&rel=0" : null;
  }

  function vimeoEmbed(url) {
    var m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return m ? "https://player.vimeo.com/video/" + m[1] + "?autoplay=1" : null;
  }

  function toEmbedSrc(url) {
    if (!url || url === "#") return null;
    return youtubeEmbed(url) || vimeoEmbed(url) || null;
  }

  function openVideoModal(url, title) {
    var modal = qs("[data-video-modal]");
    var frameHost = qs("[data-video-modal-iframe]");
    var titleEl = qs("[data-video-modal-title]");
    if (!modal || !frameHost) return;

    var embed = toEmbedSrc(url);
    titleEl.textContent = title || "Video";

    if (embed) {
      frameHost.innerHTML =
        '<iframe src="' +
        embed +
        '" title="' +
        (title || "Video").replace(/"/g, "&quot;") +
        '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';
      modal.hidden = false;
      root.style.overflow = "hidden";
      qs("[data-video-modal-close]", modal).focus();
    } else {
      frameHost.innerHTML =
        '<p class="modal__pending">Paste a YouTube or Vimeo link in <strong>Admin</strong> → Videos (or <code>assets/data/site.json</code>).</p>';
      modal.hidden = false;
      root.style.overflow = "hidden";
    }
  }

  function closeVideoModal() {
    var modal = qs("[data-video-modal]");
    var frameHost = qs("[data-video-modal-iframe]");
    if (!modal || !frameHost) return;
    frameHost.innerHTML = "";
    modal.hidden = true;
    root.style.overflow = "";
  }

  function bindVideoCards() {
    var VIDEOS = getVideos();
    qsa("[data-video-open]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-video-open");
        var item = VIDEOS.filter(function (v) {
          return v.id === id;
        })[0];
        var url = item && item.url ? item.url : btn.getAttribute("data-video-url") || "";
        var title = (item && item.title) || btn.getAttribute("aria-label") || "Video";
        openVideoModal(url, title);
      });
    });

    var modal = qs("[data-video-modal]");
    if (modal) {
      modal.addEventListener("click", function (e) {
        if (e.target.hasAttribute("data-video-modal-dismiss")) closeVideoModal();
      });
      doc.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && modal && !modal.hidden) closeVideoModal();
      });
    }
  }

  function smoothScroll() {
    qsa('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (!id || id === "#") return;
        var target = qs(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          closeMobileNav();
        }
      });
    });
  }

  var navToggle = qs("[data-nav-toggle]");
  var navPanel = qs("[data-nav-panel]");

  function closeMobileNav() {
    if (!navPanel || !navToggle) return;
    navPanel.hidden = true;
    navToggle.setAttribute("aria-expanded", "false");
  }

  function bindNav() {
    if (navToggle && navPanel) {
      navToggle.addEventListener("click", function () {
        var open = navPanel.hidden;
        navPanel.hidden = !open;
        navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      qsa("a[href^='#']", navPanel).forEach(function (a) {
        a.addEventListener("click", closeMobileNav);
      });
    }
  }

  function bindFloatingCta() {
    var fab = qs("[data-fab]");
    if (!fab) return;
    fab.addEventListener("click", function () {
      var section = qs("#contact");
      if (section) section.scrollIntoView({ behavior: "smooth" });
    });
  }

  function bindContactForm() {
    var form = qs("[data-contact-form]");
    if (!form) return;
    var status = qs("[data-form-status]");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = qs("#contact-name", form);
      var email = qs("#contact-email", form);
      var msg = qs("#contact-message", form);
      var consent = qs("#contact-consent", form);

      var errors = [];
      if (!name.value.trim()) errors.push("Name is required.");
      var em = email.value.trim();
      if (!em) errors.push("Email is required.");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em))
        errors.push("Please enter a valid email.");
      if (!msg.value.trim())
        errors.push("Tell us a little about your gathering or event.");
      if (consent && !consent.checked)
        errors.push("Please accept the privacy notice to continue.");

      if (errors.length) {
        status.textContent = errors.join(" ");
        status.className = "form__status form__status--error";
        status.hidden = false;
        return;
      }

      status.textContent =
        "Thank you. We’ve received your message (front-end demo only). Connect this form to your backend, Formspree or transactional email for production.";
      status.className = "form__status form__status--ok";
      status.hidden = false;
      form.reset();
    });
  }

  function waLink() {
    var num = getWhatsapp();
    if (!num) return "";
    var text = encodeURIComponent(
      "Hi Agota, I’d like a quote for photo/video for my festival, event or retreat."
    );
    return "https://wa.me/" + num.replace(/\D/g, "") + "?text=" + text;
  }

  function bindWhatsapp() {
    var a = qs("[data-whatsapp]");
    if (!a) return;
    var href = waLink();
    if (href) {
      a.setAttribute("href", href);
      a.hidden = false;
    } else {
      a.hidden = true;
    }
  }

  function respectMotion() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("reduce-motion");
    }
  }

  function bindOfferBanner() {
    var dismiss = qs("[data-offer-banner-dismiss]");
    var bar = qs("[data-offer-banner]");
    try {
      if (sessionStorage.getItem("oracle-offer-dismissed") === "1" && bar) {
        bar.hidden = true;
        return;
      }
    } catch (e) {}
    if (dismiss && bar) {
      dismiss.addEventListener("click", function () {
        bar.hidden = true;
        try {
          sessionStorage.setItem("oracle-offer-dismissed", "1");
        } catch (e2) {}
      });
    }
  }

  function init() {
    bindNav();
    smoothScroll();
    bindVideoCards();
    bindFloatingCta();
    bindContactForm();
    bindWhatsapp();
    bindOfferBanner();
    respectMotion();
  }

  window.__oracleBootMain = init;
})();
