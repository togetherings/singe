"""
Play steps for EduGame Kit's real-Kolibri test (the "Real Kolibri" job in
.github/workflows/build.yml; on your own computer: edugame kolibri-test .).

The kit sets up a throwaway Kolibri, adds each package's zip (countries, africa, asia, world) to a channel of
its own and opens it in Learn as a learner. It checks the save reaches Kolibri, fits SCORM 1.2
and comes back next time; these steps play so there's something to save, in each package:

  1. first visit: the package's first map in Capitals mode (its pass mark is 0, so every finished
     round counts), played to the end like a learner who doesn't know the answers: click a
     circle, and after the wrong tries the game allows, the one it highlights. Then the results
     page, and Kolibri must count the lesson as done (with no score);
  2. second visit: the menu shows that round's best result again.

Not part of the game (edugame.json's exclude has tests/*).
"""

# Plays a whole round in the page, without looking at the game's answers: clicks a capital that
# isn't found yet (going round them in turn) and, once the game highlights the answer, clicks
# that. Returns how many clicks it took.
PLAY_ROUND = """async () => {
  var game = document.getElementById('game'), next = 0;
  function click(el) { el.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window})); }
  for (var n = 0; n < 50000; n++) {
    await new Promise(function (r) { setTimeout(r, 0); });          // let the game answer, as between real clicks
    if (game.classList.contains('hidden')) return n;                // the results page: the round is over
    var hint = game.querySelector('[data-c].hint');
    if (hint) { click(hint); continue; }
    var open = game.querySelectorAll('[data-c]:not(.found)');
    if (!open.length) return n;
    click(open[next++ % open.length]);
  }
  return -1;
}"""

CARD = "document.querySelector('#menu .mapCard')"


def first_visit(game):
    game.check(game.wait_for("!!%s" % CARD, timeout=60), "the menu lists the maps")
    game.data["map"] = game.text("#menu .mapCard h3")
    game.frame.locator("#menu .mapCard").first.locator(".modeBtn").nth(2).click()      # Practice, Regions, Capitals
    game.check(game.wait_for("!document.getElementById('game').classList.contains('hidden') && "
                             "document.querySelectorAll('#game [data-c]').length > 0"),
               "a Capitals round of %s started" % game.data["map"])
    game.shot("round")
    clicks = game.js(PLAY_ROUND)
    game.check(clicks > 0 and game.wait_for("!document.getElementById('results').classList.contains('hidden')"),
               "played the round to the end (%s clicks)" % clicks)
    game.data["result"] = game.text("#resMap")
    game.shot("results")
    game.expect_complete = True        # a round that counts: Kolibri gets "passed"
    game.page.wait_for_timeout(1000)


def came_back(game):
    game.check(game.wait_for("!!%s" % CARD, timeout=60), "the menu came back")
    capitals = game.frame.locator("#menu .mapCard").first.locator(".modeBtn").nth(2)
    text = capitals.inner_text()
    game.check(any(ch.isdigit() for ch in text) and "%" in text,
               "the menu shows the Capitals round's best result: %s" % " / ".join(text.split("\n")))
