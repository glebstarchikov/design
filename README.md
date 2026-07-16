# design

The unified design system behind everything I ship: personal tools, open source projects, CMS admin interfaces, and client websites.

One core token set and behavior spec, with swappable themes per project. It exists so every UI I build stays consistent without copying CSS between repos or re-deriving contrast ratios each time.

Read [design.md](design.md) for the full system: color tokens, type scale, spacing, motion, and component rules. Copy [tokens.css](tokens.css) into a project to adopt it. Run [contrast.py](contrast.py) to verify any theme against the contrast floor.

## Stack
Plain CSS custom properties and a Python contrast checker. No build step, no framework dependency.

## License
MIT

---
Part of what I build at [glebstarchikov.nl](https://glebstarchikov.nl).
