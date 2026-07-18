# ToolPool

ToolPool is a neighbourhood tool-sharing MERN project. The frontend is built with React and Vite, and the backend is built with Node.js, Express, MongoDB and Mongoose.

## Demo features

- Browse, search and filter nearby tools
- Send a borrowing request with dates and a message
- Track personal requests and their status
- Approve, decline and complete requests from the lender dashboard
- Customers only see tools owned by other customers; their own listings stay in My workshop
- Chat is locked until the tool owner approves a request, then updates live with Server-Sent Events
- Admin and customer roles with server-side authorization for tools, requests and moderation
- Add a new tool to the workshop
- Dynamic backend APIs for users, tools, requests, reviews, favorites, messages, notifications and admin
- Responsive desktop and mobile interface

## Run locally

If you have MongoDB running locally, the backend uses `mongodb://127.0.0.1:27017/toolpool` and Compass will show the `toolpool` database after you start adding data. You can also set an Atlas or another Compass-visible connection string with `MONGO_URI`.

```bash
npm install
npm run dev
```

For a persistent MongoDB Compass database, set the connection string before starting the server:

```powershell
$env:MONGO_URI="mongodb://127.0.0.1:27017/toolpool"
npm run dev
```

Open frontend: `http://localhost:5173`

Open backend API: `http://localhost:4000/api`

## Share the live site with ngrok

Start the full app first, then expose the Vite frontend:

```powershell
npm run dev
ngrok http 5173
```

Open the HTTPS forwarding URL printed by ngrok. Vite proxies `/api` to the local Express server, so the frontend and API work through the same public URL. If you run the production build with `npm start`, use `ngrok http 4000` instead.

To clear the database and start fresh, run:

```bash
npm run seed
```

In MongoDB Compass, connect with:

```txt
mongodb://127.0.0.1:27017/toolpool
```

## Production build

```bash
npm run build
```

## Free deployment

Use Render for a free auto-deploy setup:

1. Push this repo to GitHub.
2. Create a new Render Web Service and connect that GitHub repo.
3. Use the included `render.yaml` blueprint or set these values manually:
	- Build command: `npm install && npm run build`
	- Start command: `npm start`
	- Environment variable: `MONGO_URI=<your MongoDB Atlas connection string>`
4. Enable auto-deploy so every push from VS Code redeploys the app.

If you change code in VS Code, commit and push to the connected GitHub branch. Render will rebuild and deploy automatically.

The backend has 48 API routes, including the live chat stream. See `API_LIST.md` for the full list.
