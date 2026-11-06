/* ==========================================================================
   SINGE: Studies In Geography - INTERFACE TEXT: French (Français)
   --------------------------------------------------------------------------
   A complete translation of languages/english.js. It also serves as an example of a
   language file; see the explanation at the top of english.js.
   ========================================================================== */
(window.SINGE_LANGUAGES = window.SINGE_LANGUAGES || []).push({
  id: 'french',
  name: 'Français',
  code: 'fr',
  dir: 'ltr',

  text: {
    'site.title': 'SINGE : Études de géographie',
    'common.close': 'Fermer',
    'fullscreen.enter': 'Plein écran',
    'fullscreen.exit': 'Quitter le plein écran',

    'menu.title': 'Choisissez une carte',
    'menu.intro': 'Cliquez sur chaque lieu dès que son nom apparaît.',
    'menu.options': 'Options',
    'menu.no_maps': 'Aucune carte trouvée. Vérifiez la liste « maps » dans config.js et que les fichiers de carte sont bien présents.',
    'menu.load_error': 'Impossible de charger {file}',
    'menu.practice_hint': 'Apprendre les noms',
    'menu.goal': 'Objectif : {pct} %',
    'menu.goal_met': 'Objectif atteint',
    'menu.best': 'Meilleur : {acc} % en {time}',
    'menu.not_played': 'Pas encore joué',
    'menu.completed': { one: 'Terminé {n} fois', other: 'Terminé {n} fois' },
    'menu.default_only': '{default} uniquement',
    'menu.default_only_hint': 'Cette carte n\'est pas encore disponible en {language}.',

    'mode.practice': 'Entraînement',
    'mode.regions': 'Régions',
    'mode.capitals': 'Capitales',
    'mode.flags': 'Drapeaux',

    'game.back': 'Retour au menu',
    'game.time': 'Temps',
    'game.found': 'Trouvés',
    'label.capital': 'Capitale : {name}',
    'label.shared': '{capital} et {region}',
    'zoom.in': 'Zoom avant',
    'zoom.out': 'Zoom arrière',
    'zoom.full': 'Tout',
    'zoom.full_hint': 'Ajuster à la carte entière',
    'skip.next': 'Passer pour l\'instant',
    'skip.prev': 'Revenir à la dernière question passée',
    'skip.next_icon': '→',
    'skip.prev_icon': '←',
    'prompt.find': 'Trouvez : {name}',
    'prompt.flag': 'Quelle région a ce drapeau ?',
    'prompt.practice': 'Entraînement : pointez ou touchez une région ou une ville pour voir son nom.',
    'feedback.retry': { one: 'Pas tout à fait. Encore {n} essai.', other: 'Pas tout à fait. Encore {n} essais.' },
    'feedback.hint': 'Celle-ci est en surbrillance : cliquez dessus.',
    'feedback.not_main': "C'est une partie de {name}, mais pas sa zone principale. Cliquez sur la zone principale de {name}.",
    'rotate.hint': "Cette carte est large. Veuillez tourner votre appareil à l'horizontale.",
    'rotate.continue': "Continuer quand même",

    'flag.alt': 'Le drapeau à identifier',
    'flag.hint': 'Cliquez pour l\'agrandir',
    'flag.full_alt': 'Le drapeau, en grand',
    'info.capital_of': 'Capitale : {region}',
    'info.flag_of': 'Drapeau : {name}',

    'results.title': 'Terminé !',
    'results.map': '{map} - {mode}',
    'results.accuracy': 'Précision :',
    'results.pct': '{pct} %',
    'results.time': 'Temps :',
    'results.best': { one: 'Meilleur : {acc} % de précision, le plus rapide {time} (joué {n} fois)',
                      other: 'Meilleur : {acc} % de précision, le plus rapide {time} (joué {n} fois)' },
    'results.not_counted': 'Sous le seuil de réussite de {pct} %, cette partie n’a pas été enregistrée comme résultat.',
    'results.new_best': 'Nouveau record !',
    'results.again': 'Rejouer',
    'results.menu': 'Retour au menu',

    'options.title': 'Options',
    'options.appearance': 'Apparence',
    'options.theme_light': 'Clair',
    'options.theme_dark': 'Sombre',
    'options.theme_auto': 'Auto',
    'options.theme_auto_hint': '(suit le réglage clair ou sombre de cet appareil)',
    'options.language': 'Langue',
    'options.back': 'Retour au menu'
  }
});
