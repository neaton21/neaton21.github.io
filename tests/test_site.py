"""Dependency-free structural checks: python3 -m unittest discover -s tests -v."""
from html.parser import HTMLParser
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.elements = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))


class SiteTests(unittest.TestCase):
    def test_introduction_and_navigation_work_without_javascript(self):
        path = ROOT / 'index.html'
        self.assertTrue(path.exists(), 'The portfolio entry page must exist')
        text = path.read_text()
        doc = Document(text)
        ids = [attrs['id'] for _, attrs in doc.elements if 'id' in attrs]
        self.assertEqual(len(ids), len(set(ids)), 'IDs must be unique')
        self.assertEqual(sum(tag == 'h1' for tag, _ in doc.elements), 1)
        for section in ['main', 'about', 'projects', 'contact']:
            self.assertIn(section, ids)
        for tag, attrs in doc.elements:
            if tag == 'a':
                href = attrs.get('href', '')
                self.assertTrue(href and href != '#', 'No dead placeholder links')
                if href.startswith('#'):
                    self.assertIn(href[1:], ids)
        for content in ['Nate Eaton', 'Niagara University', 'Cybersecurity', 'swim team', 'mailto:nateceaton@gmail.com', 'https://github.com/neaton21']:
            self.assertIn(content, text)

    def test_projects_features_feardetector_instead_of_placeholder(self):
        text = (ROOT / 'index.html').read_text()
        section = text.split('id="projects"', 1)[1].split('</section>', 1)[0]
        doc = Document(section)
        self.assertIn('Feardetector', section)
        self.assertNotIn('TBD', section)
        self.assertNotIn('project-placeholder', section)
        self.assertIn(('article', {'class': 'project', 'aria-labelledby': 'feardetector-title'}), doc.elements)
        links = [attrs.get('href') for tag, attrs in doc.elements if tag == 'a']
        self.assertIn('https://github.com/neaton21/feardetector', links)
        self.assertIn('https://feardetector.neaton2.workers.dev/', links)

    def test_local_assets_and_accessibility_styles(self):
        doc = Document((ROOT / 'index.html').read_text())
        for tag, attrs in doc.elements:
            if tag == 'link' and attrs.get('rel') in ['stylesheet', 'icon']:
                href = attrs['href']
                self.assertTrue(href.startswith('./'), 'Assets must support repository subpaths')
                self.assertTrue((ROOT / href).is_file(), f'Missing asset: {href}')
        css_path = ROOT / 'assets/styles.css'
        self.assertTrue(css_path.exists(), 'Responsive stylesheet must exist')
        css = css_path.read_text()
        for required in [':focus-visible', 'prefers-reduced-motion', '@media', '.skip-link']:
            self.assertIn(required, css)

    def test_social_preview_is_present(self):
        doc = Document((ROOT / 'index.html').read_text())
        meta = {a.get('property', a.get('name')): a.get('content') for t, a in doc.elements if t == 'meta'}
        self.assertEqual(meta['og:url'], 'https://neaton21.github.io/')
        self.assertEqual(meta['twitter:card'], 'summary_large_image')
        image = ROOT / 'assets/social-card.png'
        self.assertTrue(image.exists(), 'Social-sharing image must exist')
        import struct
        header = image.read_bytes()[:24]
        self.assertEqual(header[:8], b'\x89PNG\r\n\x1a\n')
        self.assertEqual(struct.unpack('>II', header[16:24]), (1200, 630))
        self.assertTrue((ROOT / '.nojekyll').exists())


if __name__ == '__main__':
    unittest.main()
