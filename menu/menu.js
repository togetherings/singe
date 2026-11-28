/*
  menu.js - the menu's list of packages (menu.html). EduGame.site() lists the packages in this page's language, in
  edugame.json's order, each with its title, description, address, config and done (its page called
  EduGame.complete()). Each is one button; done ones get a tick, and the first one not done is "Next". Every one stays
  open.

  A package's config can change how it shows here:  "menu": { "wide": true, "count": false, "mark": "★" }
    wide   take a whole row (like a review after the lessons it covers)
    count  false: not counted in "3 of 8 done"
    mark   what shows in its circle instead of its place in the list
*/
(function () {
  var t = EduGame.t, site = EduGame.site();
  function el(id) { return document.getElementById(id); }
  function make(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (text != null) { e.textContent = text; }
    return e;
  }

  function render() {
    site = EduGame.site();                     // again, now the save is read: each package's "done"
    var list = el("egMenuList"), n = 0, done = 0, counted = 0, nextShown = false;
    while (list.firstChild) { list.removeChild(list.firstChild); }
    site.packages.forEach(function (pkg) {
      var opts = (pkg.config && pkg.config.menu) || {};
      if (!opts.mark) { n++; }
      if (opts.count !== false) { counted++; if (pkg.done) { done++; } }
      var b = make("button", "eg-menu-item" + (pkg.done ? " done" : "") + (opts.wide ? " wide" : ""));
      b.type = "button";
      if (!opts.mark) { b.setAttribute("data-number", String(n)); }   // (its number key: 1-9)
      var mark = make("span", "eg-menu-mark", pkg.done ? "✓" : (opts.mark || String(n)));
      mark.setAttribute("aria-hidden", "true");
      var text = make("span", "eg-menu-text");
      var name = make("span", "eg-menu-name", pkg.title);
      text.appendChild(name);
      if (pkg.description) { text.appendChild(make("span", "eg-menu-about", pkg.description)); }
      if (!pkg.done && !nextShown) {
        nextShown = true;
        b.className += " next";
        name.appendChild(document.createTextNode(" "));
        name.appendChild(make("span", "eg-menu-tag", t("kit.menu_next")));
      }
      b.appendChild(mark);
      b.appendChild(text);
      b.addEventListener("click", function () { EduGame.goTo(pkg.url); });
      var li = make("li", opts.wide ? "wide" : null);
      li.appendChild(b);
      list.appendChild(li);
    });
    el("egMenuDone").textContent = t("kit.menu_done", { n: done, total: counted });
    var more = site.languages.filter(function (l) { return l.packages > site.packages.length; });
    el("egMenuMore").hidden = !more.length;
    el("egMenuMore").textContent = t("kit.menu_more", { names: more.map(function (l) { return l.name; }).join(", ") });
  }

  // The list of keys: the Keyboard button or ?; Escape, Close or a click outside closes it.
  var keysOpener = null;
  function keysOpen() { return !el("egKeysBack").hidden; }
  function openKeys() {
    keysOpener = document.activeElement;
    el("egKeysBack").hidden = false;
    el("egKeysClose").focus();
  }
  function closeKeys() {
    el("egKeysBack").hidden = true;
    if (keysOpener && keysOpener.focus) { keysOpener.focus(); }
  }
  el("egMenuKeys").addEventListener("click", openKeys);
  el("egKeysClose").addEventListener("click", closeKeys);
  el("egKeysBack").addEventListener("click", function (e) { if (e.target === el("egKeysBack")) { closeKeys(); } });
  document.addEventListener("keydown", function (e) {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) { return; }   // (the kit's Options panel took it)
    var tg = e.target;
    if (tg && tg.closest && tg.closest(".eg-overlay")) { return; }
    if (keysOpen()) {
      if (e.key === "Escape") { e.preventDefault(); closeKeys(); }
      else if (e.key === "Tab") { e.preventDefault(); }                     // its one button: Close
      return;
    }
    if (tg && /^(INPUT|SELECT|TEXTAREA)$/.test(tg.tagName)) { return; }
    if (e.key === "?" || e.key === "/") { e.preventDefault(); openKeys(); return; }
    var items = el("egMenuList").querySelectorAll(".eg-menu-item");
    if (!items.length) { return; }
    // 1-9: the package with that number in its circle (by the key's place, so it works without Shift on a French keyboard)
    var digit = /^(Digit|Numpad)([1-9])$/.exec(e.code || "") || (/^[1-9]$/.test(e.key) ? [0, 0, e.key] : null);
    if (digit) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].getAttribute("data-number") === digit[2]) { e.preventDefault(); items[i].click(); return; }
      }
      return;
    }
    // Arrow keys: the nearest package in that direction; Home and End: the first and last. With nothing chosen yet,
    // an arrow goes to "Next".
    var dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!dir && e.key !== "Home" && e.key !== "End") { return; }
    e.preventDefault();
    var cur = document.activeElement, inList = cur && cur.classList && cur.classList.contains("eg-menu-item");
    if (e.key === "Home") { items[0].focus(); }
    else if (e.key === "End") { items[items.length - 1].focus(); }
    else if (!inList) { (el("egMenuList").querySelector(".eg-menu-item.next") || items[0]).focus(); }
    else { var to = nearest(cur, items, dir[0], dir[1]); if (to) { to.focus(); } }
  });
  // The nearest button in a direction: its middle mostly along the arrow, a little across.
  function nearest(from, list, dx, dy) {
    var a = from.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2, best = null, bestScore = 1e9;
    for (var i = 0; i < list.length; i++) {
      if (list[i] === from) { continue; }
      var c = list[i].getBoundingClientRect(), x = c.left + c.width / 2 - ax, y = c.top + c.height / 2 - ay;
      var along = x * dx + y * dy, across = Math.abs(x * dy) + Math.abs(y * dx);
      if (along < 4) { continue; }
      if (along + 2 * across < bestScore) { bestScore = along + 2 * across; best = list[i]; }
    }
    return best;
  }

  if (!site) { return; }                     // only on the website and in the offline copy
  EduGame.ready().then(render);
})();
