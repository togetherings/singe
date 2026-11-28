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

  // The list of keys: the ⌨ button, ? or /. EduGame.dialog holds the keyboard while it's open (Escape, Close or a
  // click outside closes it, and the keyboard goes back).
  var keys = EduGame.dialog(el("egKeysBack"), { card: el("egKeysCard"), close: el("egKeysClose") });
  el("egMenuKeys").addEventListener("click", keys.open);
  document.addEventListener("keydown", function (e) {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || keys.isOpen()) { return; }
    var tg = e.target;
    if ((tg && tg.closest && tg.closest(".eg-overlay")) || (tg && /^(INPUT|SELECT|TEXTAREA)$/.test(tg.tagName))) { return; }
    if (e.key === "?" || e.key === "/") { e.preventDefault(); keys.open(); }
  });
  // The arrow keys go to the nearest set of maps that way (from nowhere: to "Next"), Home and End to the first and
  // last, and 1-9 open the one with that number.
  EduGame.arrowNav(el("egMenuList"), ".eg-menu-item", { numbers: true, start: ".next" });

  if (!site) { return; }                     // only on the website and in the offline copy
  EduGame.ready().then(render);
})();
