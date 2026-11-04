/* Baseline — team card-stack flow.
 * One card at a time is expanded; the rest stay collapsed as chips.
 * Auto-advances, pauses on interaction, loops. Reduced motion = manual only. */

(function () {
  "use strict";

  var stack = document.getElementById("stack");
  var dotsBox = document.getElementById("dots");
  var prevBtn = document.getElementById("prev");
  var nextBtn = document.getElementById("next");

  var INTERVAL = 3800;      // ms per open card
  var RESUME_AFTER = 6000;  // ms idle before autoplay resumes
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var active = 0;
  var paused = reduced;     // reduced motion: never autoplay
  var resumeTimer = null;

  function initials(name) {
    return name.split(/\s+/).map(function (p) { return p[0]; })
      .slice(0, 2).join("").toUpperCase();
  }

  function linksHtml(m) {
    return (m.links || []).filter(function (l) { return l.href; }).map(function (l) {
      return '<a href="' + l.href + '" target="_blank" rel="noopener">' + l.label + "</a>";
    }).join("");
  }

  function build() {
    var frag = document.createDocumentFragment();
    TEAM.forEach(function (m, i) {
      var card = document.createElement("article");
      card.className = "card";
      card.style.setProperty("--i", i);
      card.style.setProperty("--h", m.hue);

      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chipbar";
      chip.setAttribute("aria-expanded", "false");
      chip.innerHTML =
        '<span class="avatar">' + (m.photo ? "<img src=\"" + m.photo + "\" alt=\"\">" : initials(m.name)) + "</span>" +
        '<span class="chipmeta"><span class="chipname"></span><span class="chiprole"></span></span>' +
        '<span class="twisty" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 15.7 5.7 9.4l1.4-1.4L12 12.9l4.9-4.9 1.4 1.4z" fill="currentColor"/></svg></span>';
      chip.querySelector(".chipname").textContent = m.name;
      chip.querySelector(".chiprole").textContent = m.role;
      chip.addEventListener("click", function () { if (i !== active) { activate(i, true); unpauseSoon(); } else { paused = true; resumeSoon(); } });

      var body = document.createElement("div");
      body.className = "openbody";
      var links = linksHtml(m);
      body.innerHTML =
        '<div class="openinner">' +
          '<div class="banner">' +
            (m.photo ? '<img src="' + m.photo + '" alt="">' : "") +
            '<span class="banner-initials">' + initials(m.name) + "</span>" +
            '<span class="banner-caption"><span class="banner-name"></span><span class="banner-role"></span></span>' +
            '<button class="advance" type="button" aria-label="Next member"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.3 5.7 15 11.5l-5.7 5.8-1.4-1.4 4.3-4.4-4.3-4.4z" fill="currentColor"/></svg></button>' +
          "</div>" +
          '<div class="info">' +
            "<p class=\"bio\"></p>" +
            '<ul class="tags">' + m.tags.map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ul>" +
            '<div class="links">' + links + "</div>" +
          "</div>" +
        "</div>";
      body.querySelector(".banner-name").textContent = m.name;
      body.querySelector(".banner-role").textContent = m.role;
      body.querySelector(".bio").textContent = m.bio;
      body.querySelector(".advance").addEventListener("click", function () { activate((active + 1) % TEAM.length, true); unpauseSoon(); });

      if (m.photo) card.classList.add("has-photo");
      card.appendChild(chip);
      card.appendChild(body);
      frag.appendChild(card);
    });
    stack.appendChild(frag);

    TEAM.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "dot";
      dot.setAttribute("aria-label", "Show member " + (i + 1));
      dot.addEventListener("click", function () { activate(i, true); unpauseSoon(); });
      dotsBox.appendChild(dot);
    });
  }

  function activate(i, user) {
    active = (i + TEAM.length) % TEAM.length;
    Array.prototype.forEach.call(stack.children, function (card, j) {
      var open = j === active;
      card.classList.toggle("is-open", open);
      card.querySelector(".chipbar").setAttribute("aria-expanded", String(open));
    });
    Array.prototype.forEach.call(dotsBox.children, function (dot, j) {
      dot.setAttribute("aria-current", j === active ? "true" : "false");
    });
    if (user) {
      var el = stack.children[active];
      if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
    }
  }

  function unpauseSoon() {
    paused = true;
    resumeSoon();
  }
  function resumeSoon() {
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(function () { paused = false; }, RESUME_AFTER);
  }
  function cancelResume() {
    if (resumeTimer) { clearTimeout(resumeTimer); resumeTimer = null; }
  }

  prevBtn.addEventListener("click", function () { activate(active - 1, true); unpauseSoon(); });
  nextBtn.addEventListener("click", function () { activate(active + 1, true); unpauseSoon(); });

  /* pause while the pointer or keyboard focus is on the stack (mouse hover,
   * touch press), resume a few seconds after it leaves */
  ["pointerenter", "focusin"].forEach(function (ev) {
    stack.addEventListener(ev, function () { paused = true; cancelResume(); });
  });
  stack.addEventListener("pointerdown", unpauseSoon);
  stack.addEventListener("pointerleave", resumeSoon);
  stack.addEventListener("focusout", function () {
    if (!stack.contains(document.activeElement)) resumeSoon();
  });

  build();
  activate(0, false);

  function tick() { if (!paused) activate(active + 1, false); }
  setInterval(tick, INTERVAL);
})();
