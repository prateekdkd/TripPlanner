# PackVote AI — React Frontend

A responsive travel planning dashboard prototype. This is the frontend only; the price estimate is a temporary demo formula and is **not** an ML prediction.

## Features
- Trip origin, destination, duration, traveler count and stay preference form
- Demo cost breakdown (travel, accommodation, food and activities)
- Save, view, edit and delete trips in the current browser session
- Responsive sidebar and mobile layout
- Profile display-name editing

## Run locally

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Project structure

```text
packvote-frontend/
├── index.html
├── package.json
└── src/
    ├── App.jsx
    ├── main.jsx
    └── styles.css
```

## Next step: connect the model

When the Scikit-learn / PyTorch model and FastAPI backend are ready:
1. Replace `estimateDemo()` in `src/App.jsx` with a request to your prediction endpoint.
2. Use the backend response for total and category estimates.
3. Add a database-backed API for persistent trips.

Trips currently live only in React state and reset on page refresh. No login, database, booking, maps, or live travel prices are connected.
