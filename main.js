/* Baseline — site behaviour.
 *
 * Deliberately small and dependency-free:
 *  1. scroll reveal for [.reveal] sections (progressive enhancement — the
 *     `.js` class is set inline in <head>, so nothing hides without JS);
 *  2. nothing else. No carousel, because the site no longer has one.
 */
(function () {
  "use strict";

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
})();
