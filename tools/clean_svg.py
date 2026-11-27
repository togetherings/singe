"""Remove what doesn't draw anything from SVG files: metadata blocks (Flagpedia's C2PA content credentials, RDF),
Inkscape/Sodipodi editor settings and attributes, and their namespace declarations. Usage: clean_svg.py IN OUT"""
import re, sys
s = open(sys.argv[1], encoding='utf-8').read()
s = re.sub(r'<metadata\b.*?</metadata>|<metadata\b[^>]*/>', '', s, flags=re.S)
s = re.sub(r'<sodipodi:namedview\b.*?(?:/>|</sodipodi:namedview>)', '', s, flags=re.S)
s = re.sub(r'<inkscape:[\w-]+\b.*?(?:/>|</inkscape:[\w-]+>)', '', s, flags=re.S)
s = re.sub(r'\s(?:inkscape|sodipodi):[\w-]+="[^"]*"', '', s)
s = re.sub(r'\sxmlns:(?:inkscape|sodipodi|c2pa|rdf|cc|dc)="[^"]*"', '', s)
open(sys.argv[2], 'w', encoding='utf-8').write(s)
