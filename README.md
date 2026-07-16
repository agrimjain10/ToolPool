# ToolPool

ToolPool is a neighbourhood tool-sharing frontend built with React and Vite. It works as a standalone demo, so every main flow can be presented without starting the backend.

## Demo features

- Browse, search and filter nearby tools
- Send a borrowing request with dates and a message
- Track personal requests and their status
- Approve, decline and complete requests from the lender dashboard
- Add a new tool to the workshop
- LocalStorage persistence across refreshes
- Responsive desktop and mobile interface

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Production build

```bash
npm run build
```

The current demo uses local data so the frontend remains fully usable even when the API server is unavailable.
