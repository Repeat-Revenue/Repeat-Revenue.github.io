/* Repeat Revenue — interactions */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EMAIL = "rapheal.i.chukwuka@gmail.com";

  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Nav + progress */
  var nav = document.querySelector(".nav");
  var bar = document.querySelector(".progress");
  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle("is-scrolled", y > 20);
    if (bar) { var h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = "scaleX(" + (h > 0 ? y / h : 0) + ")"; }
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  var toggle = document.querySelector(".nav__toggle");
  if (toggle) {
    toggle.addEventListener("click", function () { var o = nav.classList.toggle("is-open"); toggle.setAttribute("aria-expanded", o); });
    nav.querySelectorAll(".nav__links a").forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }); });
  }

  /* Split headings */
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var f = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { f.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span"); w.className = "w";
            var s = document.createElement("span"); s.textContent = p; s.style.setProperty("--i", i++);
            w.appendChild(s); f.appendChild(w);
          });
          node.replaceChild(f, c);
        } else if (c.nodeType === 1) walk(c);
      });
    })(el);
    el.classList.add("split");
  });

  /* Reveal */
  var els = document.querySelectorAll("[data-reveal], [data-split], .mark");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
  } else els.forEach(function (el) { el.classList.add("is-in"); });

  /* Inbox animation */
  var list = document.querySelector(".mail-list");
  if (list) {
    var mails = list.querySelectorAll(".mail");
    var toast = document.querySelector(".toast");
    var timers = [];
    function later(fn, t) { timers.push(setTimeout(fn, t)); }
    function reset() {
      timers.forEach(clearTimeout); timers = [];
      mails.forEach(function (m) { m.classList.remove("is-on", "is-open"); m.querySelectorAll(".tag").forEach(function (t) { t.classList.remove("is-on"); }); });
      if (toast) toast.classList.remove("is-on");
    }
    function run() {
      reset();
      var t = 500;
      mails.forEach(function (m, i) {
        later(function () { m.classList.add("is-on"); }, t);
        later(function () { m.classList.add("is-open"); var o = m.querySelector(".tag--open"); if (o) o.classList.add("is-on"); }, t + 900);
        if (m.querySelector(".tag--click")) later(function () { m.querySelector(".tag--click").classList.add("is-on"); }, t + 1600);
        t += 1700;
      });
      later(function () { if (toast) toast.classList.add("is-on"); }, t + 200);
      later(run, t + 4200);
    }
    if (reduce) {
      mails.forEach(function (m) { m.classList.add("is-on", "is-open"); m.querySelectorAll(".tag").forEach(function (x) { x.classList.add("is-on"); }); });
      if (toast) toast.classList.add("is-on");
    } else {
      var started = false;
      var po = new IntersectionObserver(function (es) { if (es[0].isIntersecting && !started) { started = true; run(); } }, { threshold: .3 });
      po.observe(list);
    }
  }

  /* Sample email reader */
  var reader = document.querySelector("dialog.reader");
  if (reader) {
    document.querySelectorAll("[data-sample]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var tpl = document.getElementById(btn.getAttribute("data-sample"));
        reader.querySelector(".reader__content").innerHTML = tpl.innerHTML;
        if (reader.showModal) reader.showModal(); else reader.setAttribute("open", "");
        reader.scrollTop = 0;
      });
    });
    reader.querySelector(".reader__close").addEventListener("click", function () { reader.close ? reader.close() : reader.removeAttribute("open"); });
    reader.addEventListener("click", function (e) { if (e.target === reader) reader.close(); });
  }

  /* Status helper */
  function setStatus(el, kind, html) { el.className = "status is-" + kind; el.innerHTML = html; }
  function fallbackHTML() { return "Sorry, that didn't go through just now. Please email me directly at <a href=\"mailto:" + EMAIL + "\">" + EMAIL + "</a>."; }

  /* Brevo demo signup */
  var demo = document.querySelector("#demo-form");
  if (demo) {
    var dStatus = demo.querySelector(".status");
    var dBtn = demo.querySelector("button[type=submit]");
    var dHTML = dBtn.innerHTML;
    demo.addEventListener("submit", function (e) {
      e.preventDefault();
      if (demo.querySelector("[name=email_address_check]").value) return;
      if (!demo.checkValidity()) { demo.reportValidity(); return; }
      dBtn.disabled = true; dBtn.textContent = "Joining…";
      fetch(demo.action + "?isAjax=1", { method: "POST", body: new FormData(demo) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j && j.success === false) throw new Error(j.message || "failed");
          demo.reset();
          setStatus(dStatus, "ok", "<b>You're in.</b> Check your inbox for my first email. If you don't see it in a few minutes, look in Promotions or Spam and drag it to your main inbox.");
        })
        .catch(function () { setStatus(dStatus, "err", fallbackHTML()); })
        .then(function () { dBtn.disabled = false; dBtn.innerHTML = dHTML; });
    });
  }

  /* Audit form (Web3Forms) */
  var form = document.querySelector("#audit-form form");
  if (form) {
    var st = form.querySelector(".status");
    var btn = form.querySelector("button[type=submit]");
    var bHTML = btn.innerHTML;
    var okHTML = "<b>Thank you, your request is in.</b> I'll go through your emails and reply personally within one working day.";
    if (location.hash === "#sent") { setStatus(st, "ok", okHTML); }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.querySelector("[name=botcheck]").checked) return;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (!window.fetch) { form.submit(); return; }
      var data = {};
      new FormData(form).forEach(function (v, k) { if (k !== "redirect" && k !== "botcheck") data[k] = v; });
      btn.disabled = true; btn.textContent = "Sending…";
      fetch(form.action, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { return r.json(); })
        .then(function (j) { if (!j || !j.success) throw new Error("failed"); form.reset(); setStatus(st, "ok", okHTML); })
        .catch(function () { setStatus(st, "err", fallbackHTML()); })
        .then(function () { btn.disabled = false; btn.innerHTML = bHTML; });
    });
  }
})();
