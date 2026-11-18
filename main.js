/* Baseline — site behaviour.
 *
 * Deliberately small and dependency-free:
 *  1. scroll reveal for [.reveal] sections (progressive enhancement — the
 *     `.js` class is set inline in <head>, so nothing hides without JS);
 *  2. on the reference page, the section index marks the article being read,
 *     and the filter in that index narrows the service lists.
 *
 * Both are enhancements: the markup is complete and readable with neither, so
 * a failed script costs nothing.
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

  reveal();
  reference();
})();
