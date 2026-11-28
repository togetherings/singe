"""
Plays SINGE in Chromium on the EduGame Kit's test page, for each package:
the menu lists the package's maps, Options switches to French (map names too),
and a game starts. Then the website (edugame pages): the kit's menu lists the
sets of maps, a counted round ticks its set, and the menu is in French too.
Fails on any error in the browser's console.

    python -m tests.e2e_browser [--screenshots DIR]

Needs EduGame Kit (pip install git+https://github.com/togetherings/edugame-kit) and Playwright.
"""
import argparse
import functools
import http.server
import os
import shutil
import subprocess
import sys
import tempfile
import threading

from playwright.sync_api import sync_playwright
from edugame import testing

from edugame import cli

from tests.kolibri_play import PLAY_ROUND

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKAGES = {
    "countries": (["Sierra Leone", "United States", "British Isles", "France"], ["Sierra Leone", "États-Unis"]),
    "africa": (["North Africa", "West Africa", "Central Africa", "East Africa", "Southern Africa", "Africa: UN countries",
                "Africa: all countries and territories"], ["Afrique du Nord", "Afrique de l'Ouest"]),
    "world": (["World: UN countries", "World: all countries, territories and islands"], None),
}
# The Africa maps (windows on the World map): how many places each asks about.
AFRICA_TOTALS = [6, 15, 9, 14, 10, 54, 64]


def check(browser, package, shots):
    server = cli.make_preview_server(ROOT, 0, package=package)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = "http://127.0.0.1:%d/" % server.server_address[1]
    english, french = PACKAGES[package]
    try:
        page = browser.new_page()
        page.goto(base)
        page.select_option("#mode", "local")
        game = page.frame_locator("#game")
        game.locator(".mapCard").first.wait_for()
        assert [t.strip() for t in game.locator(".mapCard h3").all_inner_texts()] == english
        assert game.locator("#menu h2").inner_text() == "Choose a map"
        # The kit's Options panel: French, then the map names follow.
        game.locator(".eg-options-button").click()
        game.locator(".eg-card label[lang=fr]").click()
        game.locator(".eg-card .eg-primary").click()
        game.locator("#menu h2:has-text('Choisissez une carte')").wait_for()
        if french:
            game.locator(".mapCard h3", has_text=french[1]).first.wait_for()
        else:
            assert game.locator(".langNote").count() == len(english)   # not translated yet: it says so
        if shots:
            page.screenshot(path=os.path.join(shots, package + "-menu.png"))
        game.locator(".modeBtn").nth(1).click()                         # Regions
        game.locator("#prompt:not(:empty)").wait_for()
        game.locator("#backBtn:has-text('Retour')").wait_for()            # in French
        if shots:
            page.screenshot(path=os.path.join(shots, package + "-game.png"))
        game.locator("#backBtn").click()
        if package == "africa":
            check_africa(game)
        page.close()
    finally:
        server.shutdown()


def check_africa(game):
    """Each Africa map asks about the right number of places, and Somaliland is part of Somalia except on the last."""
    for i, total in enumerate(AFRICA_TOTALS):
        game.locator("#menu .mapCard").nth(i).locator(".modeBtn").nth(1).click()
        game.locator("#prompt:not(:empty)").wait_for()
        assert game.locator("#total").inner_text() == str(total), (i, game.locator("#total").inner_text())
        somaliland = game.locator('.region[data-name="Somaliland"]')
        if i == 6:
            assert somaliland.count() == 1 and "inactive" not in somaliland.get_attribute("class")
        else:
            assert somaliland.count() == 0                                # merged into Somalia
        north = i == 0 and game.locator('.region[data-name="Western Sahara"]').get_attribute("class")
        assert not north or "off" in north                               # grey on North Africa
        game.locator("#backBtn").click()
        game.locator("#menu .mapCard").first.wait_for()


def check_tries_and_label(browser, errors):
    """Wrong tries stay with their prompt through Skip and Back (and so does the hint), and a name label shown at
    the edge of a phone's screen stays on the screen."""
    server = cli.make_preview_server(ROOT, 0, package="countries")
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = "http://127.0.0.1:%d/" % server.server_address[1]
    try:
        phone = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        page = phone.new_page()
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("console", lambda m: m.type == "error" and errors.append(m.text))
        page.goto(base)
        page.select_option("#mode", "local")
        game = page.frame_locator("#game")
        game.locator(".mapCard").first.locator(".modeBtn").nth(1).evaluate("b => b.click()")   # Sierra Leone, Regions
        game.locator("#prompt:not(:empty)").wait_for()
        frame = page.frames[1]
        asked = lambda: frame.locator("#prompt").inner_text()
        def click(name, x=None):
            # (dispatched: on a phone held upright a "turn your phone" note covers the map)
            frame.evaluate("""([n, x]) => { const e = [...document.querySelectorAll('#mapBox .region')]
                .find(p => p.getAttribute('data-name') === n); const r = e.getBoundingClientRect();
                e.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: x === null ? r.x + r.width / 2 : x,
                clientY: r.y + r.height / 2 })); }""", [name, x])
        names = frame.evaluate("[...document.querySelectorAll('#mapBox .region')].map(p => p.getAttribute('data-name'))")
        target = asked()
        other = [n for n in names if n != target][0]
        click(other)
        first = frame.locator("#feedback").inner_text()
        assert first, "no retry message"
        frame.evaluate("document.getElementById('skipNext').click()")
        assert asked() != target
        frame.evaluate("document.getElementById('skipPrev').click()")
        assert asked() == target and frame.locator("#feedback").inner_text() == first, "Back wiped the wrong try"
        click(other); click(other)                                                  # out of tries: the hint shows
        hint = frame.locator("#feedback").inner_text()
        frame.evaluate("document.getElementById('skipNext').click()")
        frame.evaluate("document.getElementById('skipPrev').click()")
        assert frame.locator("#feedback").inner_text() == hint
        assert frame.locator("#mapBox .region.hint[data-name='%s']" % target).count() > 0, "the hint went away"
        click(target)                                                               # answered (with the hint)
        click(target, 350)                                                          # tap it at the right edge
        frame.locator("#tip:not(.hidden)").wait_for()
        left, right, width = frame.evaluate("""() => { const r = document.getElementById('tip').getBoundingClientRect();
            return [r.left, r.right, document.documentElement.clientWidth]; }""")
        assert left >= 0 and right <= width, (left, right, width)
        phone.close()
    finally:
        server.shutdown()


def check_keyboard(browser, errors, shots):
    """The map has the keyboard: Tab and the arrows move a highlight, Enter answers, . and , skip and go back,
    + - Page Up Page Down Home zoom, ? lists the keys, Escape closes a panel and then goes back to the menu.
    The place pointed at gets an outline drawn on top of the map."""
    server = cli.make_preview_server(ROOT, 0, package="countries")
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = "http://127.0.0.1:%d/" % server.server_address[1]
    try:
        context = browser.new_context(viewport={"width": 1200, "height": 900})
        page = context.new_page()
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("console", lambda m: m.type == "error" and errors.append(m.text))
        page.goto(base)
        page.select_option("#mode", "local")
        game = page.frame_locator("#game")
        game.locator(".mapCard").first.locator(".modeBtn").nth(1).click()          # Sierra Leone, Regions
        game.locator("#prompt:not(:empty)").wait_for()
        frame = page.frames[1]
        assert frame.evaluate("document.activeElement.id") == "mapBox"
        lit = lambda: frame.evaluate("[...new Set([...document.querySelectorAll('#mapBox .kbd')].map(e => e.getAttribute('data-name')))]")
        said = lambda: frame.evaluate("(document.querySelector('.eg-say[aria-live=polite]') || {}).textContent || ''")   # the kit's EduGame.say
        page.keyboard.press("Tab")
        first = lit()
        assert len(first) == 1, first
        frame.wait_for_function("(document.querySelector('.eg-say[aria-live=polite]') || {}).textContent === \"A place you haven't found yet\"")   # never the answer
        assert frame.locator(".eg-key-hint:has-text('Tab or Arrows')").is_visible()  # the kit's first-key hint
        assert frame.locator("#mapBox .ptr-band").count() >= 1                       # the outline on top
        page.keyboard.press("Tab")
        assert lit() != first
        page.keyboard.press("Shift+Tab")
        assert lit() == first
        page.keyboard.press("ArrowDown")
        assert lit() != first and len(lit()) == 1
        asked = frame.locator("#prompt").inner_text()
        page.keyboard.press(".")                                                    # skip
        assert frame.locator("#prompt").inner_text() != asked
        page.keyboard.press(",")                                                    # back
        assert frame.locator("#prompt").inner_text() == asked
        page.keyboard.press(";")                                                    # ; skips too (French keyboards)
        assert frame.locator("#prompt").inner_text() != asked
        page.keyboard.press("<")
        assert frame.locator("#prompt").inner_text() == asked
        # Answer: walk to the place asked for with Tab, then Enter.
        target = asked
        for _ in range(40):
            if lit() == [target]:
                break
            page.keyboard.press("Tab")
        page.keyboard.press("Enter")
        frame.locator("#found:has-text('1')").wait_for()
        page.wait_for_timeout(100)
        assert target in said(), said()                                            # found: now its name may be said
        for _ in range(20):                                                         # Tab passes over answered places
            page.keyboard.press("Tab")
            assert lit() != [target], "Tab went to a place already answered"
        full = frame.evaluate("document.querySelector('#mapBox svg').getAttribute('viewBox')")
        page.keyboard.press("PageUp")
        assert frame.evaluate("document.querySelector('#mapBox svg').getAttribute('viewBox')") != full
        page.keyboard.press("Home")
        assert frame.evaluate("document.querySelector('#mapBox svg').getAttribute('viewBox')") == full
        # ? and / open the kit's list of keys (/ also keeps Firefox's Quick Find away); in a game only the map's keys
        rows = testing.check_keys_list(page, where=frame)
        assert rows[0] == ("Tab, Shift+Tab", "Move to the next or previous place") and ("F", "Show the flag bigger (F again or Escape: close it)") not in rows, rows
        assert ("? /", "This list") in rows and rows[-1] == ("Escape", "Close a panel, or go back to the menu"), rows
        if shots:
            frame.evaluate("EduGame.openKeys()")
            page.screenshot(path=os.path.join(shots, "keyboard-keys.png"))
            frame.evaluate("EduGame.closeKeys()")
        assert frame.locator(".eg-header .eg-keys-button + .eg-options-button").count() == 1   # ⌨ beside Options
        assert not frame.locator("#game").get_attribute("class")
        page.keyboard.press("Escape")                                               # ...then back to the menu
        frame.locator("#menu:not(.hidden)").wait_for()
        # the keyboard is back on the button of the game just left; arrows move round the buttons; ? lists the keys
        focused = lambda: frame.evaluate("(document.activeElement.getAttribute('data-map') || '') + ':' + (document.activeElement.getAttribute('data-mode') || '')")
        here = focused()
        assert here.endswith(":regions"), here
        page.keyboard.press("ArrowRight")
        assert focused() == here.split(":")[0] + ":capitals", focused()
        page.keyboard.press("ArrowDown")
        assert not focused().startswith(here.split(":")[0] + ":"), focused()
        page.keyboard.press("Home")
        assert focused().endswith(":practice"), focused()
        rows = testing.check_keys_list(page, where=frame, keys=("?",))             # on the menu: its keys, then the map's
        assert rows[0] == ("On the menu", None) and ("On a map", None) in rows, rows
        assert focused().endswith(":practice"), focused()
        context.close()
    finally:
        server.shutdown()


def check_site(browser, shots):
    """The website, as GitHub Pages gets it: the kit's menu page and a page for each set of maps."""
    out = tempfile.mkdtemp()
    site = os.path.join(out, "site")
    subprocess.run([sys.executable, "-m", "edugame", "pages", ROOT, "-o", site, "--repo", "togetherings/singe"],
                   check=True)
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass
    handler = functools.partial(Quiet, directory=site)
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = "http://127.0.0.1:%d/" % server.server_address[1]
    try:
        page = browser.new_page()
        page.goto(base + "en/")
        page.locator(".eg-menu-item").first.wait_for()
        names = [t.strip() for t in page.locator(".eg-menu-name").all_inner_texts()]
        assert names[0].startswith("Studies In Geography: Countries") and "Next" in names[0], names
        assert names[1:] == ["Studies In Geography: Africa", "Studies In Geography: World"], names
        assert page.locator(".eg-menu-top h2").inner_text() == "Sets of maps"
        assert page.locator("#egMenuDone").inner_text() == "0 of 3 done"
        assert page.locator(".eg-menu-get").is_visible()                 # "Use it in your school"
        assert "singe-all-maps-" in page.locator(".eg-menu-get").inner_text()
        assert page.locator(".eg-menu-link").count() == 0                # no link to the menu on the menu
        if shots:
            page.screenshot(path=os.path.join(shots, "site-menu.png"), full_page=True)
        page.keyboard.press("ArrowDown")                                  # from nowhere: "Next"
        assert "next" in page.evaluate("document.activeElement.className")
        rows = testing.check_keys_list(page)                              # the kit's list of keys: ? and /
        assert ("1–9", "Open the set of maps with that number") in rows, rows
        assert "next" in page.evaluate("document.activeElement.className")   # the keyboard went back

        page.locator(".eg-menu-item").first.click()                       # Countries: SINGE's own map menu
        page.locator("#menu .mapCard").first.wait_for()
        assert page.locator(".eg-menu-link").inner_text().endswith("Sets of maps")
        page.locator("#menu .mapCard").first.locator(".modeBtn").nth(2).click()   # Capitals: every round counts
        page.wait_for_function("document.querySelectorAll('#game [data-c]').length > 0")
        assert page.evaluate(PLAY_ROUND) > 0, "the round didn't finish"
        page.locator("#results:not(.hidden)").wait_for()
        page.wait_for_timeout(500)                                        # the save is written

        page.locator(".eg-menu-link").click()                             # back to the sets of maps
        page.locator("#egMenuDone:has-text('1 of 3 done')").wait_for()
        assert "done" in page.locator(".eg-menu-item").first.get_attribute("class")
        assert "next" in page.locator(".eg-menu-item").nth(1).get_attribute("class")
        if shots:
            page.screenshot(path=os.path.join(shots, "site-menu-done.png"), full_page=True)

        page.goto(base + "fr/")                                           # the same save, in French
        page.locator("#egMenuDone:has-text('1 sur 3 terminées')").wait_for()
        assert page.locator(".eg-menu-top h2").inner_text() == "Séries de cartes"
        page.close()
    finally:
        server.shutdown()
        shutil.rmtree(out, ignore_errors=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--screenshots")
    args = parser.parse_args()
    if args.screenshots:
        os.makedirs(args.screenshots, exist_ok=True)
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport={"width": 1200, "height": 900})
        context.on("page", lambda pg: (pg.on("pageerror", lambda e: errors.append(str(e))),
                                       pg.on("console", lambda m: m.type == "error" and errors.append(m.text))))
        for package in PACKAGES:
            check(context, package, args.screenshots)
        check_tries_and_label(browser, errors)
        check_keyboard(browser, errors, args.screenshots)
        check_site(context, args.screenshots)
        browser.close()
    if errors:
        print("\n".join(errors))
        sys.exit("Browser errors (see above).")
    print("SINGE browser test passed.")


if __name__ == "__main__":
    main()
