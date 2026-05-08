/**
 * Admin panel — forms ↔ site.json (no programming required)
 */
(function () {
  "use strict";

  var state = null;
  var VIDEO_IDS = ["v1", "v2", "v3", "v4", "mv1"];
  var tabsBound = false;
  var dynamicBound = false;

  function $(id) {
    return document.getElementById(id);
  }

  function deepMerge(target, src) {
    if (!src || typeof src !== "object") return target;
    Object.keys(src).forEach(function (k) {
      var sv = src[k];
      if (
        sv &&
        typeof sv === "object" &&
        !Array.isArray(sv) &&
        target[k] &&
        typeof target[k] === "object" &&
        !Array.isArray(target[k])
      ) {
        deepMerge(target[k], sv);
      } else {
        target[k] = sv;
      }
    });
    return target;
  }

  function ensureShape(d) {
    d.meta = d.meta || {};
    d.brand = d.brand || {};
    d.hero = d.hero || {};
    if (typeof d.hero.useShortHeadline !== "boolean") d.hero.useShortHeadline = false;
    d.proofLabels = d.proofLabels || ["", "", "", ""];
    d.valueStrip = d.valueStrip || { items: [{}, {}, {}] };
    while (d.valueStrip.items.length < 3) d.valueStrip.items.push({ title: "", text: "" });
    d.services = d.services || { title: "", lead: "", items: [] };
    while (d.services.items.length < 2) d.services.items.push({ title: "", body: "" });
    d.approach = d.approach || {};
    d.approach.bullets = d.approach.bullets || [];
    d.process = d.process || { title: "", lead: "", steps: [] };
    while (d.process.steps.length < 4) d.process.steps.push({ title: "", body: "" });
    d.testimonials = d.testimonials || { title: "", lead: "", items: [] };
    d.about = d.about || {};
    d.about.chips = d.about.chips || [];
    d.portfolio = d.portfolio || { title: "", lead: "", images: [] };
    d.videography = d.videography || {};
    d.musicVideos = d.musicVideos || {};
    d.videos = d.videos || [];
    VIDEO_IDS.forEach(function (id) {
      if (!d.videos.some(function (v) { return v.id === id; }))
        d.videos.push({ id: id, title: "", url: "", poster: "" });
    });
    d.faq = d.faq || { title: "", lead: "", items: [] };
    d.events = d.events || { title: "", lead: "", items: [] };
    d.contact = d.contact || {};
    d.contact.form = d.contact.form || {};
    d.offerBanner = d.offerBanner || { enabled: false, text: "", href: "#contact", label: "" };
    d.footer = d.footer || {};
    return d;
  }

  function loadMerged() {
    return OracleDataStore.fetchDefault()
      .then(function (base) {
        var stored = OracleDataStore.getFromStorage();
        var merged = stored
          ? deepMerge(JSON.parse(JSON.stringify(base)), stored)
          : JSON.parse(JSON.stringify(base));
        state = ensureShape(merged);
        return state;
      })
      .catch(function () {
        state = ensureShape({});
        return state;
      });
  }

  function val(id) {
    var el = $(id);
    return el ? el.value.trim() : "";
  }

  function setVal(id, v) {
    var el = $(id);
    if (el) el.value = v == null ? "" : String(v);
  }

  function setChk(id, v) {
    var el = $(id);
    if (el) el.checked = !!v;
  }

  function applyToForm() {
    var d = state;
    setVal("meta-title", d.meta.title);
    setVal("meta-description", d.meta.description);
    setVal("meta-canonical", d.meta.canonical);
    setVal("meta-og-title", d.meta.ogTitle);
    setVal("meta-og-desc", d.meta.ogDescription);
    setVal("meta-og-image", d.meta.ogImage);
    setVal("meta-twitter", d.meta.twitterDescription);
    setVal("meta-schema", d.meta.schemaDescription);

    setVal("brand-name", d.brand.name);
    setVal("brand-tag", d.brand.tagline);

    setVal("hero-headline", d.hero.headline);
    setVal("hero-headline-short", d.hero.headlineShort);
    setChk("hero-use-short", d.hero.useShortHeadline);
    setVal("hero-quote", d.hero.quote);
    setVal("hero-role", d.hero.role);
    setVal("hero-year", d.hero.year);
    setVal("hero-insta-url", d.hero.instagramUrl);
    setVal("hero-insta-label", d.hero.instagramHandle);
    setVal("hero-cta1", d.hero.ctaPrimary);
    setVal("hero-cta2", d.hero.ctaSecondary);
    setVal("hero-image", d.hero.heroImage);

    for (var i = 0; i < 4; i++) {
      setVal("proof-" + i, d.proofLabels[i] || "");
    }

    for (var j = 0; j < 3; j++) {
      var it = d.valueStrip.items[j] || {};
      setVal("vs-" + j + "-title", it.title);
      setVal("vs-" + j + "-text", it.text);
    }

    setVal("svc-title", d.services.title);
    setVal("svc-lead", d.services.lead);
    for (var s = 0; s < 2; s++) {
      var si = d.services.items[s] || {};
      setVal("svc-" + s + "-title", si.title);
      setVal("svc-" + s + "-body", si.body);
    }

    setVal("app-title", d.approach.title);
    setVal("app-lead", d.approach.lead);
    setVal("app-body", d.approach.body);
    setVal("app-list-title", d.approach.listTitle);
    setVal("app-bullets", (d.approach.bullets || []).join("\n"));
    setVal("app-note", d.approach.note);
    setVal("app-cta1", d.approach.ctaPrimary);
    setVal("app-cta2", d.approach.ctaSecondary);

    setVal("proc-title", d.process.title);
    setVal("proc-lead", d.process.lead);
    for (var p = 0; p < 4; p++) {
      var st = d.process.steps[p] || {};
      setVal("proc-" + p + "-title", st.title);
      setVal("proc-" + p + "-body", st.body);
    }

    setVal("testi-title", d.testimonials.title);
    setVal("testi-lead", d.testimonials.lead);
    renderList("testimonials-list", d.testimonials.items, "review", function (row, item) {
      row.querySelector("[data-q]").value = item.quote || "";
      row.querySelector("[data-c]").value = item.cite || "";
    });

    setVal("about-title", d.about.title);
    setVal("about-body", d.about.body);
    setVal("about-chips", (d.about.chips || []).join(", "));
    setVal("about-image", d.about.image);
    setVal("about-caption", d.about.imageCaption);

    setVal("port-title", d.portfolio.title);
    setVal("port-lead", d.portfolio.lead);
    setVal("port-images", (d.portfolio.images || []).join("\n"));

    setVal("vid-title", d.videography.title);
    setVal("vid-lead", d.videography.lead);
    setVal("mv-title", d.musicVideos.title);
    setVal("mv-lead", d.musicVideos.lead);

    VIDEO_IDS.forEach(function (vid) {
      var v = d.videos.filter(function (x) { return x.id === vid; })[0] || {};
      setVal("video-" + vid + "-title", v.title);
      setVal("video-" + vid + "-url", v.url);
      setVal("video-" + vid + "-poster", v.poster);
    });

    setVal("faq-title", d.faq.title);
    setVal("faq-lead", d.faq.lead);
    renderList("faq-list", d.faq.items, "faq", function (row, item) {
      row.querySelector("[data-q]").value = item.q || "";
      row.querySelector("[data-a]").value = item.a || "";
    });

    setVal("evt-title", d.events.title);
    setVal("evt-lead", d.events.lead);
    renderList("events-list", d.events.items, "event", function (row, item) {
      row.querySelector("[data-t]").value = item.title || "";
      row.querySelector("[data-d]").value = item.date || "";
      row.querySelector("[data-l]").value = item.location || "";
      row.querySelector("[data-r]").value = item.role || "";
      row.querySelector("[data-u]").value = item.url || "";
      row.querySelector("[data-ll]").value = item.linkLabel || "";
    });

    setVal("co-title", d.contact.title);
    setVal("co-sub", d.contact.subhead);
    setVal("co-lead", d.contact.lead);
    setVal("co-reassurance", d.contact.reassurance);
    setVal("co-email", d.contact.email);
    setVal("co-insta-url", d.contact.instagramUrl);
    setVal("co-insta-label", d.contact.instagramLabel);
    setVal("co-wa", d.contact.whatsappE164);
    setVal("co-f-name", d.contact.form.nameLabel);
    setVal("co-f-msg", d.contact.form.messageLabel);
    setVal("co-f-consent", d.contact.form.consentLabel);
    setVal("co-f-submit", d.contact.form.submitLabel);

    setVal("foot-tag", d.footer.tagline);
    setVal("fab-label", d.fabLabel);

    setChk("ban-on", d.offerBanner.enabled);
    setVal("ban-text", d.offerBanner.text);
    setVal("ban-href", d.offerBanner.href);
    setVal("ban-label", d.offerBanner.label);
  }

  function renderList(containerId, items, type, filler) {
    var c = $(containerId);
    if (!c) return;
    c.innerHTML = "";
    (items || []).forEach(function (item) {
      var row = makeRow(type, c);
      filler(row, item);
    });
    if (!items || !items.length) {
      if (type === "review") addEmptyRow(containerId, "review");
      if (type === "faq") addEmptyRow(containerId, "faq");
      if (type === "event") addEmptyRow(containerId, "event");
    }
  }

  function makeRow(type, container) {
    var row = document.createElement("div");
    row.className = "dynamic-row";
    if (type === "review") {
      row.innerHTML =
        '<label class="f-label">What they said</label><textarea class="f-input" rows="2" data-q></textarea>' +
        '<label class="f-label">Name or role (e.g. Festival organiser)</label><input class="f-input" type="text" data-c />' +
        '<button type="button" class="btn btn--small btn--remove">Remove</button>';
    } else if (type === "faq") {
      row.innerHTML =
        '<label class="f-label">Question</label><input class="f-input" type="text" data-q />' +
        '<label class="f-label">Answer</label><textarea class="f-input" rows="2" data-a></textarea>' +
        '<button type="button" class="btn btn--small btn--remove">Remove</button>';
    } else if (type === "event") {
      row.innerHTML =
        '<label class="f-label">Event name</label><input class="f-input" type="text" data-t />' +
        '<div class="f-row2"><div><label class="f-label">Dates</label><input class="f-input" type="text" data-d /></div>' +
        '<div><label class="f-label">Place</label><input class="f-input" type="text" data-l /></div></div>' +
        '<label class="f-label">Your role (e.g. Photo &amp; video)</label><input class="f-input" type="text" data-r />' +
        '<div class="f-row2"><div><label class="f-label">Link (optional)</label><input class="f-input" type="url" data-u placeholder="https://…" /></div>' +
        '<div><label class="f-label">Link button text</label><input class="f-input" type="text" data-ll placeholder="Details" /></div></div>' +
        '<button type="button" class="btn btn--small btn--remove">Remove</button>';
    }
    row.querySelector(".btn--remove").addEventListener("click", function () {
      row.remove();
    });
    container.appendChild(row);
    return row;
  }

  function addEmptyRow(containerId, type) {
    var c = $(containerId);
    makeRow(type, c);
  }

  function collectFromForm() {
    var d = JSON.parse(JSON.stringify(state));
    ensureShape(d);

    d.meta.title = val("meta-title");
    d.meta.description = val("meta-description");
    d.meta.canonical = val("meta-canonical");
    d.meta.ogTitle = val("meta-og-title");
    d.meta.ogDescription = val("meta-og-desc");
    d.meta.ogImage = val("meta-og-image");
    d.meta.twitterDescription = val("meta-twitter");
    d.meta.schemaDescription = val("meta-schema");

    d.brand.name = val("brand-name");
    d.brand.tagline = val("brand-tag");

    d.hero.headline = val("hero-headline");
    d.hero.headlineShort = val("hero-headline-short");
    d.hero.useShortHeadline = $("hero-use-short") ? $("hero-use-short").checked : false;
    d.hero.quote = val("hero-quote");
    d.hero.role = val("hero-role");
    d.hero.year = val("hero-year");
    d.hero.instagramUrl = val("hero-insta-url");
    d.hero.instagramHandle = val("hero-insta-label");
    d.hero.ctaPrimary = val("hero-cta1");
    d.hero.ctaSecondary = val("hero-cta2");
    d.hero.heroImage = val("hero-image");

    d.proofLabels = [0, 1, 2, 3].map(function (i) {
      return val("proof-" + i);
    });

    d.valueStrip.items = [0, 1, 2].map(function (j) {
      return { title: val("vs-" + j + "-title"), text: val("vs-" + j + "-text") };
    });

    d.services.title = val("svc-title");
    d.services.lead = val("svc-lead");
    d.services.items = [0, 1].map(function (s) {
      return { title: val("svc-" + s + "-title"), body: val("svc-" + s + "-body") };
    });

    d.approach.title = val("app-title");
    d.approach.lead = val("app-lead");
    d.approach.body = val("app-body");
    d.approach.listTitle = val("app-list-title");
    d.approach.bullets = val("app-bullets")
      .split("\n")
      .map(function (x) { return x.trim(); })
      .filter(Boolean);
    d.approach.note = val("app-note");
    d.approach.ctaPrimary = val("app-cta1");
    d.approach.ctaSecondary = val("app-cta2");

    d.process.title = val("proc-title");
    d.process.lead = val("proc-lead");
    d.process.steps = [0, 1, 2, 3].map(function (p) {
      return { title: val("proc-" + p + "-title"), body: val("proc-" + p + "-body") };
    });

    d.testimonials.title = val("testi-title");
    d.testimonials.lead = val("testi-lead");
    d.testimonials.items = [];
    qsa("#testimonials-list .dynamic-row").forEach(function (row) {
      var quote = row.querySelector("[data-q]").value.trim();
      var cite = row.querySelector("[data-c]").value.trim();
      if (quote || cite) d.testimonials.items.push({ quote: quote, cite: cite });
    });

    d.about.title = val("about-title");
    d.about.body = val("about-body");
    d.about.chips = val("about-chips")
      .split(/[,\n]/)
      .map(function (x) { return x.trim(); })
      .filter(Boolean);
    d.about.image = val("about-image");
    d.about.imageCaption = val("about-caption");

    d.portfolio.title = val("port-title");
    d.portfolio.lead = val("port-lead");
    d.portfolio.images = val("port-images")
      .split("\n")
      .map(function (x) { return x.trim(); })
      .filter(Boolean);

    d.videography.title = val("vid-title");
    d.videography.lead = val("vid-lead");
    d.musicVideos.title = val("mv-title");
    d.musicVideos.lead = val("mv-lead");

    VIDEO_IDS.forEach(function (vid) {
      var found = d.videos.filter(function (x) { return x.id === vid; })[0];
      if (!found) {
        found = { id: vid, title: "", url: "", poster: "" };
        d.videos.push(found);
      }
      found.title = val("video-" + vid + "-title");
      found.url = val("video-" + vid + "-url");
      found.poster = val("video-" + vid + "-poster");
    });

    d.faq.title = val("faq-title");
    d.faq.lead = val("faq-lead");
    d.faq.items = [];
    qsa("#faq-list .dynamic-row").forEach(function (row) {
      var q = row.querySelector("[data-q]").value.trim();
      var a = row.querySelector("[data-a]").value.trim();
      if (q || a) d.faq.items.push({ q: q, a: a });
    });

    d.events.title = val("evt-title");
    d.events.lead = val("evt-lead");
    d.events.items = [];
    qsa("#events-list .dynamic-row").forEach(function (row) {
      var t = row.querySelector("[data-t]").value.trim();
      if (!t) return;
      d.events.items.push({
        title: t,
        date: row.querySelector("[data-d]").value.trim(),
        location: row.querySelector("[data-l]").value.trim(),
        role: row.querySelector("[data-r]").value.trim(),
        url: row.querySelector("[data-u]").value.trim(),
        linkLabel: row.querySelector("[data-ll]").value.trim() || "Details",
      });
    });

    d.contact.title = val("co-title");
    d.contact.subhead = val("co-sub");
    d.contact.lead = val("co-lead");
    d.contact.reassurance = val("co-reassurance");
    d.contact.email = val("co-email");
    d.contact.instagramUrl = val("co-insta-url");
    d.contact.instagramLabel = val("co-insta-label");
    d.contact.whatsappE164 = val("co-wa").replace(/\D/g, "");
    d.contact.form.nameLabel = val("co-f-name");
    d.contact.form.messageLabel = val("co-f-msg");
    d.contact.form.consentLabel = val("co-f-consent");
    d.contact.form.submitLabel = val("co-f-submit");

    d.footer.tagline = val("foot-tag");
    d.fabLabel = val("fab-label");

    d.offerBanner.enabled = $("ban-on").checked;
    d.offerBanner.text = val("ban-text");
    d.offerBanner.href = val("ban-href") || "#contact";
    d.offerBanner.label = val("ban-label");

    return d;
  }

  function qsa(sel) {
    return Array.prototype.slice.call(document.querySelectorAll(sel));
  }

  function bindTabs() {
    if (tabsBound) return;
    tabsBound = true;
    qsa(".admin-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        var id = tab.getAttribute("data-tab");
        qsa(".admin-tab").forEach(function (t) {
          t.setAttribute("aria-selected", t === tab ? "true" : "false");
        });
        qsa(".admin-panel").forEach(function (p) {
          p.hidden = p.getAttribute("id") !== "panel-" + id;
        });
      });
    });
  }

  function bindDynamicButtons() {
    if (dynamicBound) return;
    dynamicBound = true;
    $("add-review") &&
      $("add-review").addEventListener("click", function () {
        makeRow("review", $("testimonials-list"));
      });
    $("add-faq") &&
      $("add-faq").addEventListener("click", function () {
        makeRow("faq", $("faq-list"));
      });
    $("add-event") &&
      $("add-event").addEventListener("click", function () {
        makeRow("event", $("events-list"));
      });
  }

  function showStatus(msg, ok) {
    var statusEl = $("status");
    statusEl.textContent = msg;
    statusEl.className = "status " + (ok ? "status--ok" : "status--err");
    statusEl.hidden = false;
  }

  window.OracleAdmin = {
    loadMerged: loadMerged,
    applyToForm: applyToForm,
    collectFromForm: collectFromForm,
    bindTabs: bindTabs,
    bindDynamicButtons: bindDynamicButtons,
    showStatus: showStatus,
    getState: function () { return state; },
    setState: function (s) { state = ensureShape(s); },
  };
})();
