"""
Plays SINGE in Chromium on the EduGame Kit's test page, for each package:
the menu lists the package's maps, Options switches to French (map names too),
and a game starts. Fails on any error in the browser's console.

    python -m tests.e2e_browser [--screenshots DIR]

Needs EduGame Kit (pip install git+https://github.com/togetherings/edugame-kit) and Playwright.
"""
import argparse
import os
import sys
import threading

from playwright.sync_api import sync_playwright

from edugame import cli

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKAGES = {
    "countries": (["Sierra Leone", "United States"], ["Sierra Leone", "États-Unis"]),
    "world": (["World: UN countries", "World: all countries, territories and islands"], None),
}


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
            game.locator(".mapCard h3:has-text('%s')" % french[1]).wait_for()
        else:
            assert game.locator(".langNote").count() == len(english)   # not translated yet: it says so
        if shots:
            page.screenshot(path=os.path.join(shots, package + "-menu.png"))
        game.locator(".modeBtn").nth(1).click()                         # Regions
        game.locator("#prompt:has-text('Trouvez')").wait_for()
        if shots:
            page.screenshot(path=os.path.join(shots, package + "-game.png"))
        game.locator("#backBtn").click()
        page.close()
    finally:
        server.shutdown()


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
        browser.close()
    if errors:
        print("\n".join(errors))
        sys.exit("Browser errors (see above).")
    print("SINGE browser test passed.")


if __name__ == "__main__":
    main()
