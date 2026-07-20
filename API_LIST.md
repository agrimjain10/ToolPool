# ToolPool API Reference

> This backend has **48 self-made Express API routes** organized into 9 route files for easy navigation.

## Quick Overview

| Module | Route File | Base Path | Routes |
|--------|-----------|-----------|--------|
| Basic | server.js | /api | 2 |
| Auth | authRoutes.js | /api/auth | 5 |
| Users | userRoutes.js | /api/users | 7 |
| Tools | toolRoutes.js | /api/tools | 10 |
| Requests | requestRoutes.js | /api/requests | 10 |
| Favorites | favoriteRoutes.js | /api/favorites | 3 |
| Reviews | reviewRoutes.js | /api/reviews | 3 |
| Messages | messageRoutes.js | /api/messages | 4 |
| Notifications | notificationRoutes.js | /api/notifications | 2 |
| Admin | adminRoutes.js | /api/admin | 2 |

## 1. Basic (2)
| # | Method | Endpoint | Description | Auth |
|---|--------|----------|-------------|------|
| 1 | GET | `/api` | API info and route list | 🔓 No |
| 2 | GET | `/api/health` | Health check | 🔓 No |

## 2. Auth (5)
| # | Method | Endpoint | Description | Auth |
|---|--------|----------|-------------|------|
| 3 | POST | `/api/auth/register` | Register new user | 🔓 No |
| 4 | POST | `/api/auth/login` | Login with email/password | 🔓 No |
| 5 | GET | `/api/auth/me` | Get current logged-in user | 🔒 Yes |
| 6 | POST | `/api/auth/logout` | Logout and destroy session | 🔒 Yes |
| 7 | PATCH | `/api/auth/password/:id` | Change password | 🔒 Yes |

## 3. Users (7)
| # | Method | Endpoint | Description | Auth |
|---|--------|----------|-------------|------|
| 8 | GET | `/api/users` | List all users | 🔒 Admin |
| 9 | GET | `/api/users/admins` | List admin users | 🔒 Admin |
| 10 | GET | `/api/users/customers` | List customer users | 🔒 Admin |
| 11 | GET | `/api/users/:id` | Get single user | 🔒 Admin |
| 12 | POST | `/api/users` | Create new user | 🔒 Admin |
| 13 | PATCH | `/api/users/:id` | Update user | 🔒 Admin |
| 14 | DELETE| `/api/users/:id` | Delete user | 🔒 Admin |

## 4. Tools (10)
| # | Method | Endpoint | Description | Auth |
|---|--------|----------|-------------|------|
| 15 | GET | `/api/tools` | Browse tools with filters | 🔒 Yes |
| 16 | GET | `/api/tools/featured` | Get 6 cheapest available tools | 🔓 No |
| 17 | GET | `/api/tools/categories` | Get distinct categories | 🔓 No |
| 18 | GET | `/api/tools/available` | Get all available tools | 🔓 No |
| 19 | GET | `/api/tools/owner/:owner`| Get tools by owner name | 🔓 No |
| 20 | GET | `/api/tools/:id` | Get single tool | 🔓 No |
| 21 | POST | `/api/tools` | Create a new tool listing | 🔒 Yes |
| 22 | PATCH | `/api/tools/:id` | Update tool details | 🔒 Owner |
| 23 | DELETE| `/api/tools/:id` | Delete tool and related data | 🔒 Owner |
| 24 | PATCH | `/api/tools/:id/availability` | Toggle tool availability | 🔒 Owner |

## 5. Borrow Requests (10)
| # | Method | Endpoint | Description | Auth |
|---|--------|----------|-------------|------|
| 25 | GET | `/api/requests` | List requests (filtered by role) | 🔒 Yes |
| 26 | GET | `/api/requests/pending` | List pending requests | 🔒 Yes |
| 27 | GET | `/api/requests/mine/:borrower`| Get borrower's requests | 🔒 Yes |
| 28 | GET | `/api/requests/:id` | Get single request | 🔒 Yes |
| 29 | POST | `/api/requests` | Create borrow request | 🔒 Yes |
| 30 | PATCH | `/api/requests/:id/status` | Update request status | 🔒 Yes |
| 31 | PATCH | `/api/requests/:id/approve`| Approve request (marks tool unavailable) | 🔒 Owner |
| 32 | PATCH | `/api/requests/:id/reject` | Reject request | 🔒 Owner |
| 33 | PATCH | `/api/requests/:id/return` | Mark tool returned (marks tool available) | 🔒 Owner |
| 34 | DELETE| `/api/requests/:id` | Delete request | 🔒 Yes |

## 6. Favorites (3)
| # | Method | Endpoint | Description | Auth |
|---|--------|----------|-------------|------|
| 35 | GET | `/api/favorites/:userName` | Get user's favorites | 🔓 No |
| 36 | POST | `/api/favorites` | Add to favorites | 🔓 No |
| 37 | DELETE| `/api/favorites/:userName/:toolId`| Remove from favorites | 🔓 No |

## 7. Reviews (3)
| # | Method | Endpoint | Description | Auth |
|---|--------|----------|-------------|------|
| 38 | GET | `/api/reviews/tool/:toolId`| Get reviews for a tool | 🔓 No |
| 39 | POST | `/api/reviews` | Create a review | 🔓 No |
| 40 | DELETE| `/api/reviews/:id` | Delete a review | 🔓 No |

## 8. Messages (4)
| # | Method | Endpoint | Description | Auth |
|---|--------|----------|-------------|------|
| 41 | GET | `/api/messages/request/:requestId/stream` | SSE live chat stream | 🔒 Yes |
| 42 | GET | `/api/messages/inbox/:userName`| Get user's inbox | 🔒 Yes |
| 43 | GET | `/api/messages/request/:requestId`| Get chat messages | 🔒 Yes |
| 44 | POST | `/api/messages` | Send a message | 🔒 Yes |

## 9. Notifications (2)
| # | Method | Endpoint | Description | Auth |
|---|--------|----------|-------------|------|
| 45 | GET | `/api/notifications/:userName`| Get user's notifications | 🔓 No |
| 46 | PATCH | `/api/notifications/:id/read` | Mark notification as read | 🔓 No |

## 10. Admin (2)
| # | Method | Endpoint | Description | Auth |
|---|--------|----------|-------------|------|
| 47 | GET | `/api/admin/stats` | Get platform statistics | 🔒 Admin |
| 48 | POST | `/api/admin/reset-sample` | Reset all sample data | 🔒 Admin |

## Testing APIs
You can test these APIs using:
- **Browser**: Visit `http://localhost:4000/api` to see all routes.
- **Postman**: Import the base URL `http://localhost:4000` and test endpoints.
- **VS Code**: Use the REST Client extension.
