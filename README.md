# ToolPool

Access here :  https://toolpool.onrender.com/


ToolPool is a neighbourhood tool-sharing MERN project. The frontend is built with React and Vite, and the backend is built with Node.js, Express, MongoDB and Mongoose.

## Tech Stack
- **Database:** MongoDB & Mongoose
- **Backend:** Node.js & Express.js
- **Frontend:** React & Vite
- **Authentication:** Custom sessions & bcryptjs
- **Real-time:** Server-Sent Events (SSE) for live chat

## Project Structure
The project is structured in a beginner-friendly way, separating the React frontend from the Express backend, with the backend further divided into modular routes and controllers.

```
ToolPool/
├── client/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/        # React UI components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── AuthPage.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── BrowsePage.jsx
│   │   │   ├── ToolCard.jsx
│   │   │   ├── AddToolModal.jsx
│   │   │   ├── BorrowModal.jsx
│   │   │   ├── LenderPage.jsx
│   │   │   ├── MyRequestsPage.jsx
│   │   │   ├── ChatModal.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── AdminPage.jsx
│   │   │   ├── PageTitle.jsx
│   │   │   └── Status.jsx
│   │   ├── App.jsx            # Main app with routing & state
│   │   ├── api.js             # API client functions
│   │   ├── data.js            # Categories list
│   │   ├── helpers.js         # Utility functions
│   │   ├── styles.css         # All CSS styles
│   │   └── main.jsx           # React entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                    # Backend (Express + MongoDB)
│   ├── routes/                # API route handlers (split by feature)
│   │   ├── authRoutes.js      # Login, register, logout (5 APIs)
│   │   ├── userRoutes.js      # User CRUD (7 APIs)
│   │   ├── toolRoutes.js      # Tool management (10 APIs)
│   │   ├── requestRoutes.js   # Borrow request lifecycle (10 APIs)
│   │   ├── favoriteRoutes.js  # Bookmarks/wishlist (3 APIs)
│   │   ├── reviewRoutes.js    # Tool reviews (3 APIs)
│   │   ├── messageRoutes.js   # Chat & SSE stream (4 APIs)
│   │   ├── notificationRoutes.js # Notifications (2 APIs)
│   │   └── adminRoutes.js     # Admin stats & reset (2 APIs)
│   ├── middleware/
│   │   └── auth.js            # Authentication & authorization helpers
│   ├── models/                # Mongoose schemas
│   │   ├── userModel.js
│   │   ├── toolModel.js
│   │   ├── requestModel.js
│   │   ├── favoriteModel.js
│   │   ├── reviewModel.js
│   │   ├── messageModel.js
│   │   ├── notificationModel.js
│   │   └── sessionModel.js
│   ├── server.js              # Express app entry point
│   ├── db.js                  # Database connection
│   ├── authHelpers.js         # Password hashing
│   ├── seedData.js            # Data reset helper
│   └── seed.js                # Seed script
├── API_LIST.md                # Full API documentation (48 routes)
├── render.yaml                # Render.com deployment config
├── package.json               # Root dependencies & scripts
└── README.md                  # This file
```

## Features
- **Browse and Search:** Browse, search, and filter nearby tools.
- **Borrow Requests:** Send a borrowing request with dates and a message.
- **Dashboard:** Track personal requests and their status.
- **Lender Controls:** Approve, decline, and complete requests from the lender dashboard.
- **Smart Logic:** Customers only see tools owned by other customers; their own listings stay in "My workshop".
- **Live Chat:** Chat is locked until the tool owner approves a request, then updates live with Server-Sent Events.
- **Roles:** Admin and customer roles with server-side authorization for tools, requests, and moderation.
- **Add Tools:** Add a new tool to the workshop.
- **Dynamic APIs:** 48 dynamic backend APIs for users, tools, requests, reviews, favorites, messages, notifications, and admin.
- **Responsive:** Fully responsive desktop and mobile interface with a modern, polished aesthetic.

## API Documentation
The backend has 48 self-made API routes across 9 modules. For full details on endpoints, methods, and authentication requirements, see [API_LIST.md](./API_LIST.md).

## Run Locally

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

## Deployment

Use Render for a free auto-deploy setup:

1. Push this repo to GitHub.
2. Create a new Render Web Service and connect that GitHub repo.
3. Use the included `render.yaml` blueprint or set these values manually:
   - Build command: `npm install && npm install --prefix client && npm run build`
   - Start command: `npm start`
   - Environment variable: `MONGO_URI=<your MongoDB Atlas connection string>`
4. Enable auto-deploy so every push from VS Code redeploys the app.

## Team
This project is an MCA college project.
