# ToolPool

ToolPool is a neighbourhood tool-sharing MERN project. The frontend is built with React and Vite, and the backend is built with Node.js, Express, MongoDB and Mongoose.

## Demo features

- Browse, search and filter nearby tools
- Send a borrowing request with dates and a message
- Track personal requests and their status
- Approve, decline and complete requests from the lender dashboard
- Add a new tool to the workshop
- Dynamic backend APIs for users, tools, requests, reviews, favorites, messages, notifications and admin
- Responsive desktop and mobile interface

## Run locally

```bash
npm install
npm run dev
```

Open frontend: `http://localhost:5173`

Open backend API: `http://localhost:4000/api`

Demo admin login:

```txt
email: agrim@example.com
password: 123456
```

## Production build

```bash
npm run build
```

The backend has exactly 45 self-made APIs. See `API_LIST.md` for the full list.
