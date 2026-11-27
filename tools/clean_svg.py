"""Remove what doesn't draw anything from an SVG file: metadata blocks (Flagpedia's C2PA content credentials, RDF
licence blocks), Inkscape/Sodipodi editor settings and attributes, and namespace declarations nothing uses any more.

    python3 tools/clean_svg.py IN.svg OUT.svg

It refuses to write a file that is no longer valid XML. Compare the two by rendering them before using the result.
"""
import re
import sys
import xml.dom.minidom

s = open(sys.argv[1], encoding='utf-8').read()


def drop(tag, text):
    """remove every <tag .../> and <tag ...>...</tag> (tag may be a regex, e.g. 'inkscape:[\\w-]+')"""
    text = re.sub(r'<(%s)\b[^>]*?/>' % tag, '', text)                       # self-closing: no contents
    return re.sub(r'<(%s)\b[^>]*?>.*?</\1>' % tag, '', text, flags=re.S)     # with contents (to its own end tag)


s = drop('metadata', s)
s = drop('sodipodi:namedview', s)
s = drop(r'inkscape:[\w-]+', s)
s = drop('rdf:RDF', s)                                                      # licence blocks outside <metadata>
s = re.sub(r'\s(?:inkscape|sodipodi):[\w-]+="[^"]*"', '', s)
for prefix in ('inkscape', 'sodipodi', 'c2pa', 'rdf', 'cc', 'dc'):            # a namespace still in use stays declared
    if not re.search(r'[<\s/]%s:' % prefix, re.sub(r'\sxmlns:%s="[^"]*"' % prefix, '', s)):
        s = re.sub(r'\sxmlns:%s="[^"]*"' % prefix, '', s)
try:
    xml.dom.minidom.parseString(s.encode('utf-8'))
except Exception as e:
    sys.exit('clean_svg: %s would not be valid XML any more (%s); nothing written' % (sys.argv[1], e))
open(sys.argv[2], 'w', encoding='utf-8').write(s)
