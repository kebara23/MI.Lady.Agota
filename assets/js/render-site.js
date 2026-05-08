/**
 * Applies site.json (merged with localStorage) to index.html
 */
(function (global) {
  "use strict";

  function esc(s) {
    if (s == null) return "";
    var d = document.createElement("div");
    d.textContent = String(s);
    return d.innerHTML;
  }

  function setText(sel, text, root) {
    var el = (root || document).querySelector(sel);
    if (el) el.textContent = text == null ? "" : String(text);
  }

  function setHtml(sel, html, root) {
    var el = (root || document).querySelector(sel);
    if (el) el.innerHTML = html;
  }

  function setMeta(name, content, prop) {
    if (content === undefined || content === null) return;
    var sel = prop
      ? 'meta[property="' + prop + '"]'
      : 'meta[name="' + name + '"]';
    var m = document.head.querySelector(sel);
    if (m) m.setAttribute("content", content);
  }

  function OracleSiteRender() {}

  OracleSiteRender.render = function (data) {
    if (!data || typeof data !== "object") return;

    var m = data.meta || {};
    if (m.title) document.title = m.title;
    setMeta("description", m.description);
    setMeta("twitter:description", m.twitterDescription);
    if (m.ogTitle) setMeta(null, m.ogTitle, "og:title");
    if (m.ogDescription) setMeta(null, m.ogDescription, "og:description");
    if (m.ogLocale) setMeta(null, m.ogLocale, "og:locale");
    if (m.ogImage) setMeta(null, m.ogImage, "og:image");
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical && m.canonical) canonical.setAttribute("href", m.canonical);
    if (m.canonical) setMeta(null, m.canonical, "og:url");

    var ld = document.querySelector('script[type="application/ld+json"]');
    if (ld && m.schemaDescription) {
      try {
        var j = JSON.parse(ld.textContent);
        j.description = m.schemaDescription;
        if (m.canonical) j.url = m.canonical;
        ld.textContent = JSON.stringify(j, null, 2);
      } catch (e) {}
    }

    var b = data.brand || {};
    setText("[data-brand-name]", b.name);
    setText("[data-brand-tag]", b.tagline);

    var h = data.hero || {};
    var heroEl = document.querySelector(".hero");
    if (heroEl) {
      var headline =
        h.useShortHeadline && h.headlineShort ? h.headlineShort : h.headline;
      setText("#hero-title", headline);
      setText(".hero__role", h.role);
      setText(".hero__meta [data-hero-year]", h.year);
      var ig = document.querySelector(".hero__meta [data-hero-instagram]");
      if (ig && h.instagramUrl) {
        ig.href = h.instagramUrl;
        ig.textContent = h.instagramHandle || ig.textContent;
      }
      setText(".hero__quote", h.quote);
      var ctaP = document.querySelector(".hero__cta .btn--primary");
      var ctaG = document.querySelector(".hero__cta .btn--ghost");
      if (ctaP && h.ctaPrimary) ctaP.textContent = h.ctaPrimary;
      if (ctaG && h.ctaSecondary) ctaG.textContent = h.ctaSecondary;
      if (h.heroImage && String(h.heroImage).trim()) {
        heroEl.style.setProperty(
          "--hero-image",
          "url('" + String(h.heroImage).replace(/'/g, "\\'") + "')"
        );
      }
    }

    var proof = document.querySelector(".proof__grid");
    if (proof && Array.isArray(data.proofLabels)) {
      var cells = proof.querySelectorAll(".proof__cell");
      data.proofLabels.forEach(function (label, i) {
        if (cells[i]) cells[i].setAttribute("data-label", label);
      });
    }

    var vs = document.querySelector("[data-value-strip]");
    if (vs && data.valueStrip && Array.isArray(data.valueStrip.items)) {
      var items = data.valueStrip.items.filter(function (x) {
        return x && (x.title || x.text);
      });
      if (!items.length) {
        vs.hidden = true;
      } else {
        vs.hidden = false;
        var wrap = vs.querySelector("[data-value-strip-grid]");
        if (wrap) {
          wrap.innerHTML = items
            .map(function (it) {
              return (
                '<div class="value-strip__item"><h3 class="value-strip__title">' +
                esc(it.title) +
                '</h3><p class="value-strip__text">' +
                esc(it.text) +
                "</p></div>"
              );
            })
            .join("");
        }
      }
    }

    var sv = data.services || {};
    var servicesSection = document.getElementById("services");
    setText("#services-heading", sv.title);
    if (servicesSection) {
      var lead = servicesSection.querySelector(".section__lead");
      if (lead) lead.textContent = sv.lead || "";
      var grid = servicesSection.querySelector(".grid-2");
      if (grid && Array.isArray(sv.items)) {
        grid.innerHTML = sv.items
          .map(function (item) {
            return (
              '<article class="card"><h3>' +
              esc(item.title) +
              "</h3><p>" +
              esc(item.body).replace(/\n/g, "<br>") +
              "</p></article>"
            );
          })
          .join("");
      }
    }

    var ap = data.approach || {};
    var apSection = document.getElementById("approach");
    if (apSection) {
      setText("#approach-heading", ap.title);
      var leads = apSection.querySelectorAll(".section__lead");
      if (leads[0]) leads[0].textContent = ap.lead || "";
      var panel = apSection.querySelector(".approach-panel");
      if (panel) {
        var ps = panel.querySelectorAll("p");
        if (ps[0]) ps[0].textContent = ap.body || "";
        setText(".approach-panel__h", ap.listTitle);
        var ul = panel.querySelector(".approach-panel__list");
        if (ul && Array.isArray(ap.bullets)) {
          ul.innerHTML = ap.bullets
            .map(function (b) {
              return "<li>" + esc(b) + "</li>";
            })
            .join("");
        }
        var note = panel.querySelector(".approach-panel__note");
        if (note) note.textContent = ap.note || "";
        var btns = panel.querySelectorAll(".approach-panel__cta .btn");
        if (btns[0] && ap.ctaPrimary) btns[0].textContent = ap.ctaPrimary;
        if (btns[1] && ap.ctaSecondary) btns[1].textContent = ap.ctaSecondary;
      }
    }

    var pr = data.process || {};
    var prSection = document.getElementById("process");
    if (prSection) {
      setText("#process-heading", pr.title);
      var pl = prSection.querySelector(".section__lead");
      if (pl) pl.textContent = pr.lead || "";
      var steps = prSection.querySelector(".steps");
      if (steps && Array.isArray(pr.steps)) {
        steps.innerHTML = pr.steps
          .map(function (s) {
            return (
              '<div class="step"><h3>' +
              esc(s.title) +
              "</h3><p>" +
              esc(s.body) +
              "</p></div>"
            );
          })
          .join("");
      }
    }

    var te = data.testimonials || {};
    var teSection = document.getElementById("testimonials");
    if (teSection) {
      setText("#testimonials-heading", te.title);
      var tl = teSection.querySelector(".section__lead");
      if (tl) tl.textContent = te.lead || "";
      var qg = teSection.querySelector(".quote-grid");
      if (qg && Array.isArray(te.items)) {
        qg.innerHTML = te.items
          .map(function (t) {
            return (
              "<blockquote><p>“" +
              esc(t.quote) +
              "”</p><cite>— " +
              esc(t.cite) +
              "</cite></blockquote>"
            );
          })
          .join("");
      }
    }

    var ab = data.about || {};
    var abSection = document.getElementById("about");
    if (abSection) {
      setText("#about-heading", ab.title);
      var abLead = abSection.querySelector(".about-split > div > .section__lead");
      if (abLead) abLead.textContent = ab.body || "";
      var chips = abSection.querySelector(".chips");
      if (chips && Array.isArray(ab.chips)) {
        chips.innerHTML = ab.chips
          .map(function (c) {
            return '<span class="chip">' + esc(c) + "</span>";
          })
          .join("");
      }
      var fig = abSection.querySelector(".about-split__visual");
      if (fig) {
        var cap = fig.querySelector("figcaption");
        if (ab.image && String(ab.image).trim()) {
          fig.style.backgroundImage =
            "url('" + String(ab.image).replace(/'/g, "\\'") + "')";
          fig.style.backgroundSize = "cover";
          fig.style.backgroundPosition = "center";
          if (cap) cap.textContent = ab.imageCaption || "";
        } else if (cap) {
          cap.innerHTML = esc(ab.imageCaption || "");
        }
      }
    }

    var po = data.portfolio || {};
    var poSection = document.getElementById("portfolio");
    if (poSection) {
      setText("#portfolio-heading", po.title);
      var pol = poSection.querySelector(".section__lead");
      if (pol) pol.textContent = po.lead || "";
      var mason = poSection.querySelector(".masonry");
      if (mason && Array.isArray(po.images) && po.images.length > 0) {
        mason.className = "portfolio-dynamic";
        mason.innerHTML = po.images
          .map(function (src, i) {
            return (
              '<div class="portfolio-dynamic__item"><img src="' +
              String(src).replace(/"/g, "&quot;") +
              '" alt="Portfolio ' +
              (i + 1) +
              '" loading="lazy" width="800" height="1000" /></div>'
            );
          })
          .join("");
      }
    }

    var vi = data.videography || {};
    var viSection = document.getElementById("videography");
    if (viSection) {
      setText("#videography-heading", vi.title);
      var vil = viSection.querySelector(".section__lead");
      if (vil) vil.textContent = vi.lead || "";
      var vg = viSection.querySelector(".video-grid");
      var vids = (data.videos || []).filter(function (v) {
        return /^v\d+$/.test(v.id);
      });
      if (vg && vids.length) {
        vg.innerHTML = vids
          .map(function (v, idx) {
            var posterStyle = v.poster
              ? ' style="background-image:url(\'' +
                String(v.poster).replace(/'/g, "\\'") +
                '\');background-size:cover;background-position:center"'
              : "";
            return (
              '<article class="video-card"><div class="video-card__poster"' +
              posterStyle +
              ' aria-hidden="true"></div><button type="button" data-video-open="' +
              esc(v.id) +
              '" aria-label="Play ' +
              esc(v.title || "video") +
              '"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></button></article>'
            );
          })
          .join("");
      }
    }

    var mv = data.musicVideos || {};
    var mvSection = document.getElementById("music-videos");
    if (mvSection) {
      setText("#music-videos-heading", mv.title);
      var mvl = mvSection.querySelector(".section__lead");
      if (mvl) mvl.textContent = mv.lead || "";
      var feat = mvSection.querySelector(".video-feature");
      var mvItem = (data.videos || []).filter(function (v) {
        return v.id === "mv1";
      })[0];
      if (feat && mvItem) {
        var poster = feat.querySelector(".video-feature__poster");
        if (poster && mvItem.poster) {
          poster.style.backgroundImage =
            "url('" + String(mvItem.poster).replace(/'/g, "\\'") + "')";
          poster.style.backgroundSize = "cover";
          poster.style.backgroundPosition = "center";
        }
        var btn = feat.querySelector("button[data-video-open]");
        if (btn) {
          btn.setAttribute("data-video-open", mvItem.id);
          btn.setAttribute(
            "aria-label",
            "Play " + (mvItem.title || "music video")
          );
        }
      }
    }

    var fq = data.faq || {};
    var fqSection = document.getElementById("faq");
    if (fqSection) {
      setText("#faq-heading", fq.title);
      var fql = fqSection.querySelector(".section__lead");
      if (fql) fql.textContent = fq.lead || "";
      var fqList = fqSection.querySelector("[data-faq-list]");
      if (fqList && Array.isArray(fq.items)) {
        fqList.innerHTML = fq.items
          .map(function (item) {
            return (
              "<details><summary>" +
              esc(item.q) +
              "</summary><p>" +
              esc(item.a) +
              "</p></details>"
            );
          })
          .join("");
      }
    }

    var ev = data.events || {};
    var evSection = document.getElementById("events");
    if (evSection) {
      setText("#events-heading", ev.title);
      var evl = evSection.querySelector(".section__lead");
      if (evl) evl.textContent = ev.lead || "";
      var list = evSection.querySelector("[data-events-list]");
      if (list && Array.isArray(ev.items)) {
        var show = ev.items.filter(function (x) {
          return x && x.title;
        });
        if (!show.length) {
          evSection.hidden = true;
        } else {
          evSection.hidden = false;
          list.innerHTML = show
            .map(function (e) {
              var link =
                e.url && String(e.url).trim()
                  ? '<a class="events__link" href="' +
                    String(e.url).replace(/"/g, "&quot;") +
                    '" rel="noopener noreferrer">' +
                    (e.linkLabel || "Details") +
                    "</a>"
                  : "";
              return (
                '<li class="events__item"><div class="events__top"><h3 class="events__name">' +
                esc(e.title) +
                '</h3>' +
                link +
                '</div><p class="events__meta">' +
                esc(e.date) +
                " · " +
                esc(e.location) +
                '</p><p class="events__role">' +
                esc(e.role) +
                "</p></li>"
              );
            })
            .join("");
        }
      }
    }

    var co = data.contact || {};
    var coSection = document.getElementById("contact");
    if (coSection) {
      setText("#contact-heading", co.title);
      setText(".contact__subhead", co.subhead, coSection);
      var leadsContact = coSection.querySelector(".contact-grid .section__lead");
      if (leadsContact) leadsContact.textContent = co.lead || "";
      var reass = coSection.querySelector("[data-contact-reassurance]");
      if (reass) {
        reass.textContent = co.reassurance || "";
        reass.hidden = !co.reassurance;
      }
      var mail = coSection.querySelector('a[href^="mailto:"]');
      if (mail && co.email) {
        mail.href = "mailto:" + co.email;
        mail.textContent = co.email;
      }
      var ig2 = coSection.querySelector("a[data-contact-instagram]");
      if (ig2 && co.instagramUrl) {
        ig2.href = co.instagramUrl;
        ig2.textContent = co.instagramLabel || ig2.textContent;
      }
      var fl = co.form || {};
      var l1 = coSection.querySelector('label[for="contact-name"]');
      var l2 = coSection.querySelector('label[for="contact-message"]');
      var l3 = coSection.querySelector('label[for="contact-consent"]');
      var sub = coSection.querySelector('[data-contact-form] [type="submit"]');
      if (l1 && fl.nameLabel) l1.textContent = fl.nameLabel;
      if (l2 && fl.messageLabel) l2.textContent = fl.messageLabel;
      if (l3 && fl.consentLabel) l3.textContent = fl.consentLabel;
      if (sub && fl.submitLabel) sub.textContent = fl.submitLabel;
    }

    var fo = data.footer || {};
    setText("[data-footer-tagline]", fo.tagline);

    var fab = document.querySelector("[data-fab]");
    if (fab && data.fabLabel) fab.textContent = data.fabLabel;

    var ob = data.offerBanner || {};
    var bar = document.querySelector("[data-offer-banner]");
    if (bar) {
      if (!ob.enabled) {
        bar.hidden = true;
      } else {
        bar.hidden = false;
        setText("[data-offer-banner-text]", ob.text);
        var oa = bar.querySelector("[data-offer-banner-cta]");
        if (oa) {
          oa.href = ob.href || "#contact";
          oa.textContent = ob.label || "Learn more";
        }
      }
    }

    if (co.email) {
      var fm = document.querySelector(".site-footer a[href^='mailto:']");
      if (fm) {
        fm.href = "mailto:" + co.email;
        fm.textContent = co.email;
      }
    }
  };

  global.OracleSiteRender = OracleSiteRender;
})(window);
