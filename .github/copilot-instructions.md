# X-TTT Copilot Instructions

## Project Overview
Multiplayer Tic-Tac-Toe web app with **two separate npm projects**:
- `react_ws_src/` — React frontend (development + build)
- `WS/` — Node.js/Express/Socket.io game server (production runtime)

**Important**: Maintain existing patterns. Do not install modern packages or upgrade existing packages — this project uses React 15, React Router v2, and legacy Jest patterns intentionally.

## Architecture

### Frontend (`react_ws_src/`)
- **Entry**: [src/app.js](react_ws_src/src/app.js) — initializes ampersand-app, React Router, Google Analytics
- **Global state**: Uses `ampersand-app` as global `app` object (accessed via `window.app` or `app.settings`)
- **Configuration**: Loaded at runtime from XML ([static/ws_conf.xml](react_ws_src/static/ws_conf.xml)) using X2JS parser in [src/models/prep_env.js](react_ws_src/src/models/prep_env.js)
- **Routing**: React Router v2 with `browserHistory`, routes defined in `app.js`

### Backend (`WS/`)
- **Entry**: [Xttt.js](WS/Xttt.js) — Express server with Socket.io
- **Game logic**: [XtttGame.js](WS/XtttGame.js) — player pairing and turn handling
- **Player model**: [Player.js](WS/Player.js) — simple factory function (not a class)

### Real-time Communication
Socket.io events between frontend (`GameMain.js`) and backend (`XtttGame.js`):
- `new player` → Server pairs available players
- `pair_players` ← Server notifies matched players
- `ply_turn` → Player sends move
- `opp_turn` ← Server relays opponent's move

## Developer Workflows

### Frontend Development
```bash
cd react_ws_src
npm install
npm start          # Dev server at http://localhost:3000 (hot reload)
npm run lint       # ESLint
npm run test       # Jest with coverage
npm run build      # Production build to dist/
npm run bc         # Build + copy all to WS/public (Windows)
npm run bu         # Build + copy bundle/style only (Windows)
```

### Backend Development
```bash
cd WS
npm install
npm start          # Server at port 3001 (or PORT env var)
```

### Build Pipeline
Production builds from `react_ws_src/dist/` must be copied to `WS/public/` — use `npm run bc` or `npm run bu` scripts.

### Socket.io URL Configuration
In `ws_conf.xml`, toggle between environments using attribute prefix:
- **Production**: `<SOCKET__io u='https://x-ttt.herokuapp.com' />` (use `u` attribute)
- **Local dev**: `<SOCKET__io _u='http://localhost:3001' />` (use `_u` to disable)

The frontend reads `app.settings.ws_conf.loc.SOCKET__io.u` — only non-prefixed attributes are active.

## Deployment (Heroku)
The `WS/` folder deploys as a standalone Node.js app:
1. Build frontend: `cd react_ws_src && npm run bc`
2. Push `WS/` to Heroku (uses `Procfile` with `web: node Xttt.js`)
3. Ensure `SOCKET__io` URL in `WS/public/ws_conf.xml` points to production

## Key Conventions

### Configuration Pattern
All site configuration lives in `ws_conf.xml`, not hardcoded:
- Socket.io server URL: `<SOCKET__io u='...' />`
- Menu structure: `<main_menu><pages>...</pages></main_menu>`
- Page content: `<pgs><pagename>...</pagename></pgs>`

Access in code: `app.settings.ws_conf.loc.SOCKET__io.u`

### Component Structure
- Views in `src/views/` with subdirectories: `layouts/`, `pages/`, `ttt/`
- Game components follow step-based flow: `SetName` → `SetGameType` → `GameMain`
- Parent components manage state and pass callbacks as props

### Helper Functions
Reusable utilities in `src/helpers/` with Jest tests in `__tests__/`:
- `rand_arr_elem.js`, `rand_to_fro.js` — randomization
- `find_obj_by_val.js` — array object lookup
- `serialize_params.js` — URL parameter handling

### Styling
SCSS with partials in `src/sass/`:
- Main entry: `main.scss` imports all partials
- Game-specific: `ttt.scss`
- Variables/mixins: `_variables.scss`, `_mixins.scss`

## Testing
Jest tests use `jest.unmock()` pattern for ES6 modules:
```javascript
jest.unmock('../find_obj_by_val');
import find_obj_by_val from '../find_obj_by_val'
```

## Important Notes
- Frontend expects global `base_dir` and `conf_file` variables (set in HTML)
- Player model uses revealing module pattern, not ES6 classes
- Server uses global variables (`io`, `players`, `players_avail`) — be cautious with scope
- GSAP (TweenMax) used for animations in game components
