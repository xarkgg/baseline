/* Baseline — site behaviour.
 *
 * Deliberately small and dependency-free:
 *  1. scroll reveal for [.reveal] sections (progressive enhancement — the
 *     `.js` class is set inline in <head>, so nothing hides without JS);
 *  2. on the reference page, the section index marks the article being read,
 *     and the filter in that index narrows the service lists;
 *  3. "Copy as Markdown" on a case study, derived from the page itself so
 *     there is no second copy of the text to keep in step;
 *  4. the service shortlist on the reference page — stars kept in
 *     localStorage, copyable as Markdown;
 *  5. site-wide search (⌘K / Ctrl K), indexed from the pages at load.
 *
 * All five are enhancements: the markup is complete and readable without any
 * of them, so a failed script costs nothing.
 */
(function () {
  "use strict";

  function reveal() {
    var nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    nodes.forEach(function (n) { io.observe(n); });
  }

  function reference() {
    var nav = document.querySelector(".docs-nav");
    if (!nav) return;

    var sections = Array.prototype.slice.call(document.querySelectorAll(".wiki-sec[id]"));
    if (!sections.length) return;

    var byId = {};
    sections.forEach(function (section) { byId[section.id] = section; });

    var navLinks = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    var toc = document.querySelector(".docs-toc");
    var tocLinks = toc ? Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]')) : [];

    function targetOf(link) {
      return byId[link.getAttribute("href").slice(1)] || null;
    }

    function hide(el, yes) {
      if (yes) el.setAttribute("hidden", "");
      else el.removeAttribute("hidden");
    }

    /* the line a section counts as "reached" at is the same line an anchored
       jump lands on, so the index never lags behind a clicked link */
    function line() {
      return parseFloat(window.getComputedStyle(sections[0]).scrollMarginTop) || 120;
    }

    /* which article owns the top of the viewport — filtered-out articles
       (display:none) are excluded, since their boxes all measure as zero */
    function currentSection() {
      var shown = sections.filter(function (s) { return s.offsetParent !== null; });
      if (!shown.length) return null;

      var y = window.scrollY;
      var bottom = y + window.innerHeight >= document.documentElement.scrollHeight - 2;
      if (bottom) return shown[shown.length - 1];

      var offset = line() + 2; // 2px of slack for the fractional landing of smooth scrolls
      var found = shown[0];
      for (var i = 0; i < shown.length; i++) {
        if (shown[i].getBoundingClientRect().top <= offset) found = shown[i];
        else break;
      }
      return found;
    }

    var marked = null;
    function mark() {
      var section = currentSection();
      if (section === marked) return;
      marked = section;

      navLinks.forEach(function (link) {
        if (section && targetOf(link) === section) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });

      var at = section ? sections.indexOf(section) : -1;
      var picked = null;
      tocLinks.forEach(function (link) {
        var target = targetOf(link);
        if (target && sections.indexOf(target) <= at) picked = link;
        link.removeAttribute("aria-current");
      });
      if (picked) picked.setAttribute("aria-current", "location");
    }

    var queued = false;
    function onScroll() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(function () {
        queued = false;
        mark();
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    mark();

    /* the filter — narrows the service lists, never the prose */
    var input = document.getElementById("svc-filter");
    if (!input) return;

    var status = document.getElementById("svc-status");
    var empty = document.querySelector(".docs-empty");
    var start = document.querySelector(".docs-start");
    var groups = Array.prototype.slice.call(nav.querySelectorAll(".docs-nav-group"));
    var items = Array.prototype.slice.call(document.querySelectorAll(".refs li"));
    var total = items.length;
    var text = items.map(function (li) { return li.textContent.toLowerCase(); });

    function apply() {
      var query = input.value.trim().toLowerCase();
      var matches = 0;

      items.forEach(function (li, i) {
        var hit = !query || text[i].indexOf(query) !== -1;
        if (hit) matches++;
        hide(li, !hit);
      });

      sections.forEach(function (section) {
        var refs = section.querySelectorAll(".refs li");
        var keep = !query;
        if (query) {
          keep = false;
          refs.forEach(function (li) { if (!li.hasAttribute("hidden")) keep = true; });
        }
        hide(section, !keep);
      });

      navLinks.forEach(function (link) {
        var target = targetOf(link);
        hide(link, !target || target.hasAttribute("hidden"));
      });

      tocLinks.forEach(function (link) {
        var target = targetOf(link);
        hide(link, !target || target.hasAttribute("hidden"));
      });

      groups.forEach(function (group) {
        var next = group.nextElementSibling;
        var any = false;
        while (next && !next.classList.contains("docs-nav-group")) {
          if (!next.hasAttribute("hidden")) any = true;
          next = next.nextElementSibling;
        }
        hide(group, !any);
      });

      if (start) hide(start, !!query);
      if (empty) hide(empty, !(query && matches === 0));
      if (status) {
        status.textContent = query
          ? (matches ? matches + " of " + total + " services" : "No services match")
          : "";
      }
      onScroll();
    }

    input.addEventListener("input", apply);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && input.value) {
        event.preventDefault();
        input.value = "";
        apply();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      var el = event.target;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      event.preventDefault();
      input.focus();
    });
  }

  /* ---------- copy a case study as Markdown ---------- */

  function absolute(href) {
    try { return new URL(href, window.location.href).href; } catch (e) { return href; }
  }

  /* one paragraph or heading, read back as Markdown — links become links,
     <code> becomes `code`, emphasis survives, decorations do not */
  function inline(node) {
    var out = "";
    Array.prototype.forEach.call(node.childNodes, function (child) {
      if (child.nodeType === 3) { out += child.nodeValue; return; }
      if (child.nodeType !== 1) return;

      var tag = child.tagName;
      if (tag === "BR") { out += " "; return; }
      if (child.getAttribute("aria-hidden") === "true") return;
      if (tag === "svg" || tag === "SVG") return;
      if (tag === "CODE") {
        var code = child.textContent.replace(/\s+/g, " ").trim();
        out += code ? "`" + code + "`" : "";
        return;
      }
      if (tag === "A") {
        var label = child.textContent.replace(/\s+/g, " ").trim();
        var href = child.getAttribute("href");
        if (!label) return;
        if (!href || href.charAt(0) === "#") { out += label; return; }
        out += "[" + label + "](" + absolute(href) + ")";
        return;
      }
      if (tag === "EM" || tag === "I") {
        var em = inline(child).replace(/\s+/g, " ").trim();
        if (em) out += "*" + em + "*";
        return;
      }
      if (tag === "STRONG" || tag === "B") {
        var strong = inline(child).replace(/\s+/g, " ").trim();
        if (strong) out += "**" + strong + "**";
        return;
      }
      out += inline(child);
    });
    return out;
  }

  function blockText(el) {
    return inline(el).replace(/\s+/g, " ").trim();
  }

  function caseMarkdown() {
    var main = document.getElementById("main");
    if (!main) return "";

    var out = [];
    var title = main.querySelector(".page-head h1");
    if (title) out.push("# " + blockText(title));

    var kicker = main.querySelector(".page-head .kicker");
    if (kicker) out.push("*" + blockText(kicker) + "*");

    var lede = main.querySelector(".page-head .lede");
    if (lede) out.push(blockText(lede));

    var meta = main.querySelector(".case-meta");
    if (meta) {
      var facts = Array.prototype.map.call(meta.children, blockText).filter(Boolean);
      if (facts.length) out.push("*" + facts.join(" · ") + "*");
    }

    var links = main.querySelectorAll(".case-links a");
    if (links.length) {
      out.push(Array.prototype.map.call(links, function (a) {
        return "- [" + blockText(a) + "](" + absolute(a.getAttribute("href")) + ")";
      }).join("\n"));
    }

    Array.prototype.forEach.call(main.querySelectorAll(".case-body > *"), function (el) {
      var tag = el.tagName;
      if (tag === "H2") out.push("## " + blockText(el));
      else if (tag === "H3") out.push("### " + blockText(el));
      else if (tag === "P") out.push(blockText(el));
      else if (tag === "BLOCKQUOTE") out.push("> " + blockText(el));
      else if (tag === "FIGURE") {
        var img = el.querySelector("img");
        var caption = el.querySelector("figcaption");
        if (img) {
          var alt = (img.getAttribute("alt") || "").replace(/\s+/g, " ").trim();
          out.push("![" + alt + "](" + absolute(img.getAttribute("src")) + ")");
        }
        if (caption) {
          var cap = blockText(caption);
          if (cap) out.push("*" + cap + "*");
        }
      }
    });

    out.push("---");
    out.push("Source: " + window.location.href.split("#")[0] + " — Baseline");

    return out.filter(Boolean).join("\n\n").replace(/\n{3,}/g, "\n\n") + "\n";
  }

  function copyText(text, done) {
    function fallback() {
      var field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.top = "-1000px";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(field);
      done(ok);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
      return;
    }
    fallback();
  }

  function copyMarkdown() {
    var buttons = document.querySelectorAll("[data-copy-md]");
    if (!buttons.length) return;

    var status = document.querySelector("[data-copy-status]");

    Array.prototype.forEach.call(buttons, function (button) {
      var timer = null;
      button.removeAttribute("hidden");

      button.addEventListener("click", function () {
        var text = caseMarkdown();
        if (!text) return;

        copyText(text, function (ok) {
          button.setAttribute("data-copied", ok ? "true" : "false");
          if (status) {
            status.textContent = ok
              ? "Markdown copied — paste it wherever you like."
              : "Could not reach the clipboard. Copy the page text by hand.";
          }
          if (timer) window.clearTimeout(timer);
          timer = window.setTimeout(function () {
            button.removeAttribute("data-copied");
            if (status) status.textContent = "";
          }, 3200);
        });
      });
    });
  }

  /* ---------- the service shortlist (reference page) ---------- */

  function shortlist() {
    var rows = document.querySelectorAll(".refs li");
    if (!rows.length) return;

    var KEY = "baseline.shortlist.v1";
    var panel = document.querySelector("[data-keep-panel]");
    var count = document.querySelector("[data-keep-count]");
    var status = document.querySelector("[data-keep-status]");
    var copyBtn = document.querySelector("[data-keep-copy]");
    var clearBtn = document.querySelector("[data-keep-clear]");

    function load() {
      try {
        var raw = window.localStorage.getItem(KEY);
        var list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list.filter(function (v) { return typeof v === "string"; }) : [];
      } catch (e) { return []; }
    }
    function save(list) {
      try { window.localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* private mode: keep it in memory */ }
    }

    var kept = load();
    var rowsByHref = {};

    function isKept(href) { return kept.indexOf(href) !== -1; }

    function paint() {
      Object.keys(rowsByHref).forEach(function (href) {
        rowsByHref[href].buttons.forEach(function (button) {
          button.setAttribute("aria-pressed", isKept(href) ? "true" : "false");
        });
      });
      if (count) count.textContent = String(kept.length);
      if (panel) {
        if (kept.length) panel.removeAttribute("hidden");
        else panel.setAttribute("hidden", "");
      }
    }

    function markdown() {
      var lines = [
        "# Stack shortlist",
        "",
        "Kept from the Baseline free-tier catalogue — " + absolute("resources.html")
      ];
      var section = "";
      Object.keys(rowsByHref).forEach(function (href) {
        if (!isKept(href)) return;
        var row = rowsByHref[href];
        if (row.section && row.section !== section) {
          section = row.section;
          lines.push("", "## " + section);
        }
        lines.push("- [" + row.name + "](" + href + ")" + (row.note ? " — " + row.note : ""));
      });
      return lines.join("\n") + "\n";
    }

    Array.prototype.forEach.call(rows, function (li) {
      var link = li.querySelector("a");
      if (!link) return;
      var href = link.getAttribute("href");
      if (!href) return;

      var name = link.textContent.replace(/\s+/g, " ").trim();
      var note = li.querySelector("span");
      var section = li.closest ? li.closest(".wiki-sec") : null;
      var heading = section ? section.querySelector("h2") : null;

      var button = document.createElement("button");
      button.className = "keep";
      button.type = "button";
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", "Keep " + name + " for your stack");
      button.title = "Keep for your stack";
      button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4.1 Q 12.4 9.2 14.2 9.7 L20 10.3 Q 20.5 10.9 19.9 11.4 L16.4 14.5 Q 16.1 15 16.3 15.6 L17.5 20.3 Q 17.2 21 16.5 20.7 L12.4 18 Q 11.9 17.9 11.4 18.2 L6.9 20.7 Q 6.2 21 6.1 20.3 L7.6 15.6 Q 7.8 15 7.4 14.5 L3.9 11.4 Q 3.4 10.9 4 10.3 L9.6 9.7 Q 10.2 9.2 10.5 8.6 Z"/></svg>';

      button.addEventListener("click", function () {
        var at = kept.indexOf(href);
        if (at === -1) kept.push(href);
        else kept.splice(at, 1);
        save(kept);
        paint();
        if (status) status.textContent = "";
      });

      li.appendChild(button);

      var entry = rowsByHref[href];
      if (!entry) {
        entry = rowsByHref[href] = {
          buttons: [],
          name: name,
          note: note ? note.textContent.replace(/\s+/g, " ").trim() : "",
          section: heading ? heading.textContent.replace(/\s+/g, " ").trim() : ""
        };
      }
      entry.buttons.push(button);
    });

    paint();

    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        if (!kept.length) return;
        copyText(markdown(), function (ok) {
          if (!status) return;
          status.textContent = ok
            ? "Copied " + kept.length + (kept.length === 1 ? " service" : " services") + " as Markdown."
            : "Could not reach the clipboard. Copy the list by hand.";
        });
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        kept = [];
        save(kept);
        paint();
        if (status) status.textContent = "Shortlist cleared.";
      });
    }
  }

  /* ---------- site-wide search ---------- */

  function search() {
    var trigger = document.querySelector("[data-search]");
    if (!trigger) return;

    var CACHE_KEY = "baseline.search.v1";
    var CACHE_TTL = 6 * 60 * 60 * 1000;
    var MAX = 14;

    var dialog = document.createElement("dialog");
    if (typeof dialog.showModal !== "function") return; // no <dialog>: keep the trigger hidden

    dialog.className = "palette";
    dialog.setAttribute("aria-label", "Search Baseline");
    dialog.innerHTML =
      '<div class="palette-form">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.3" r="6"/><path d="M15 15.1 Q 17.4 17.5 20 20.1"/></svg>' +
        '<input type="search" placeholder="Search pages, notes, projects, services" autocomplete="off" spellcheck="false" aria-label="Search Baseline" aria-controls="palette-results" />' +
        '<kbd aria-hidden="true">Esc</kbd>' +
      '</div>' +
      '<ul class="palette-results" id="palette-results"></ul>' +
      '<p class="palette-status" role="status" aria-live="polite"></p>';

    document.body.appendChild(dialog);

    var input = dialog.querySelector("input");
    var results = dialog.querySelector(".palette-results");
    var note = dialog.querySelector(".palette-status");

    var FIXED = [
      { name: "Home", kind: "Page", href: "index.html", where: "Groundwork first — who we are and what we do" },
      { name: "Work", kind: "Page", href: "work.html", where: "The projects, each with a case study" },
      { name: "Notes", kind: "Page", href: "notes.html", where: "Short writing from the collective" },
      { name: "Resources", kind: "Page", href: "resources.html", where: "The free tier, catalogued — every limit quoted" },
      { name: "Contact", kind: "Page", href: "contact.html", where: "Work with us, or join us" },
      { name: "Why we catalogue the free tier", kind: "Note", href: "note-free-tier.html", where: "16 Nov 2026 — a free tier is only useful if you know where it stops" },
      { name: "The gate is rarely the talent", kind: "Note", href: "note-gate.html", where: "18 Nov 2026 — four walls that have nothing to do with ability" },
      { name: "What open means here", kind: "Note", href: "note-open.html", where: "18 Nov 2026 — what “open to contributors” actually buys you" },
      { name: "Sherwood", kind: "Case study", href: "sherwood.html", where: "Downside protection for tokenized stocks — Solidity on an Arbitrum L2" },
      { name: "PerpPilot", kind: "Case study", href: "perppilot.html", where: "Hyperliquid trader intelligence — Python, FastAPI, Nansen" },
      { name: "Zac", kind: "Case study", href: "zac.html", where: "Private Zcash payments by name — React, Hono, ZIP-316" }
    ];

    var extra = [];        // sections and services from the reference page
    var loaded = false;    // the reference page has been indexed
    var asking = false;    // a fetch is in flight

    function normalize(text) {
      return String(text || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function itemsFrom(root) {
      var out = [];
      Array.prototype.forEach.call(root.querySelectorAll(".wiki-sec[id]"), function (section) {
        var heading = section.querySelector("h2");
        var sectionName = heading ? heading.textContent.replace(/\s+/g, " ").trim() : section.id;
        out.push({
          name: sectionName,
          kind: "Section",
          href: "resources.html#" + section.id,
          where: "Resources — the free tier, catalogued"
        });
        Array.prototype.forEach.call(section.querySelectorAll(".refs li"), function (li) {
          var link = li.querySelector("a");
          if (!link) return;
          var copy = li.querySelector("span");
          out.push({
            name: link.textContent.replace(/\s+/g, " ").trim(),
            kind: "Service",
            href: "resources.html#" + section.id,
            where: sectionName,
            desc: copy ? copy.textContent.replace(/\s+/g, " ").trim() : ""
          });
        });
      });
      return out;
    }

    function cached() {
      try {
        var raw = window.sessionStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        var saved = JSON.parse(raw);
        if (!saved || !Array.isArray(saved.items) || !saved.at) return null;
        if (Date.now() - saved.at > CACHE_TTL) return null;
        return saved.items;
      } catch (e) { return null; }
    }

    function remember(items) {
      try {
        window.sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), items: items }));
      } catch (e) { /* quota or private mode — the index just is not cached */ }
    }

    function absorb(items) {
      if (!items || !items.length) return;
      extra = items;
      loaded = true;
      render();
    }

    /* the reference page is both the biggest part of the index and the page
       we are most likely to be on, so read it from the DOM before fetching it */
    function loadServices() {
      if (loaded || asking) return;

      if (document.querySelector(".wiki-sec[id]")) {
        absorb(itemsFrom(document));
        return;
      }

      var saved = cached();
      if (saved) { absorb(saved); return; }

      if (typeof window.fetch !== "function") return;
      asking = true;

      window.fetch("resources.html", { credentials: "same-origin" })
        .then(function (response) {
          if (!response.ok) throw new Error("no reference page");
          return response.text();
        })
        .then(function (html) {
          var doc = new window.DOMParser().parseFromString(html, "text/html");
          var items = itemsFrom(doc);
          if (!items.length) throw new Error("nothing indexed");
          remember(items);
          absorb(items);
        })
        .catch(function () {
          if (note && input.value) note.textContent = "Services need a connection — the rest of the site is searchable.";
        })
        .then(function () { asking = false; });
    }

    function score(item, query) {
      var name = normalize(item.name);
      if (name === query) return 0;
      if (name.indexOf(query) === 0) return 1;
      if (name.indexOf(query) !== -1) return 2;
      var body = normalize(item.name + " " + item.kind + " " + (item.where || "") + " " + (item.desc || ""));
      return body.indexOf(query) !== -1 ? 3 : -1;
    }

    function row(item) {
      var li = document.createElement("li");
      var link = document.createElement("a");
      link.href = item.href;

      var name = document.createElement("span");
      name.className = "palette-name";
      name.textContent = item.name;

      var kind = document.createElement("span");
      kind.className = "palette-kind";
      kind.textContent = item.kind;

      link.appendChild(name);
      link.appendChild(kind);

      if (item.where) {
        var where = document.createElement("span");
        where.className = "palette-where";
        where.textContent = item.where;
        link.appendChild(where);
      }

      li.appendChild(link);
      return li;
    }

    function render() {
      var query = normalize(input.value);
      results.textContent = "";

      if (!query) {
        FIXED.forEach(function (item) { results.appendChild(row(item)); });
        if (note) note.textContent = "Jump to a page, or type to search notes, projects and services.";
        return;
      }

      var pool = FIXED.concat(extra);
      var hits = [];

      pool.forEach(function (item) {
        var rank = score(item, query);
        if (rank !== -1) hits.push({ rank: rank, item: item });
      });

      hits.sort(function (a, b) {
        if (a.rank !== b.rank) return a.rank - b.rank;
        return a.item.name.localeCompare(b.item.name);
      });

      hits.slice(0, MAX).forEach(function (hit) { results.appendChild(row(hit.item)); });

      if (!note) return;
      if (!hits.length) {
        note.textContent = "Nothing matches “" + input.value.trim() + "”." +
          (loaded ? "" : " Still indexing the reference page.");
      } else if (hits.length > MAX) {
        note.textContent = "Showing the first " + MAX + " of " + hits.length + " matches.";
      } else {
        note.textContent = hits.length + (hits.length === 1 ? " match." : " matches.");
      }
    }

    function links() {
      return Array.prototype.slice.call(results.querySelectorAll("a"));
    }

    function open() {
      if (dialog.open) return;
      dialog.showModal();
      input.value = "";
      render();
      loadServices();
      input.focus();
    }

    input.addEventListener("input", render);

    input.addEventListener("keydown", function (event) {
      if (event.key === "ArrowDown") {
        var first = links()[0];
        if (first) { event.preventDefault(); first.focus(); }
      } else if (event.key === "Enter") {
        var pick = links()[0];
        if (pick) { event.preventDefault(); pick.click(); }
      }
    });

    results.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();

      var all = links();
      var at = all.indexOf(document.activeElement);

      if (event.key === "ArrowUp") {
        if (at <= 0) input.focus();
        else all[at - 1].focus();
        return;
      }
      if (at !== -1 && all[at + 1]) all[at + 1].focus();
    });

    results.addEventListener("click", function (event) {
      var link = event.target.closest ? event.target.closest("a") : null;
      if (link) dialog.close();
    });

    document.addEventListener("keydown", function (event) {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
      if (event.key !== "k" && event.key !== "K") return;
      event.preventDefault();
      if (dialog.open) dialog.close();
      else open();
    });

    var mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    Array.prototype.forEach.call(document.querySelectorAll("[data-search-key]"), function (el) {
      el.textContent = mac ? "⌘K" : "Ctrl K";
    });

    trigger.removeAttribute("hidden");
    trigger.addEventListener("click", open);
  }

  reveal();
  reference();
  copyMarkdown();
  shortlist();
  search();
})();
