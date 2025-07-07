# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Snake game implementation with dual platforms:
- **Web version**: HTML5 Canvas with JavaScript (index.html)
- **Desktop version**: Python with Pygame (snake_game.py)

## Development Environment

### Python Setup
```bash
python3 -m venv venv
source venv/bin/activate
pip install pygame
```

### Running the Games
```bash
# Desktop version
source venv/bin/activate
python snake_game.py

# Web version
open index.html
```

## Architecture

### Web Version (index.html)
- Single-file HTML5 Canvas implementation
- CSS styling with modern glass-morphism design
- JavaScript game loop with collision detection
- Responsive design for mobile compatibility

### Desktop Version (snake_game.py)
- Object-oriented design with separate classes:
  - `Snake`: Movement, collision detection, growth
  - `Food`: Random positioning, collision with snake
  - `Game`: Main game loop, event handling, rendering
- Pygame-based graphics and input handling

## Deployment

The web version is deployed via GitHub Pages:
- Repository: https://github.com/koontimmmy/testpy.git
- Live site: https://koontimmmy.github.io/testpy/
- Auto-deployment on push to main branch