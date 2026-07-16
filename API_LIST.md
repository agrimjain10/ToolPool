# ToolPool Backend API List

This backend has exactly 45 self-made Express APIs for the MERN project.

## Basic

1. `GET /api`
2. `GET /api/health`

## Auth

3. `POST /api/auth/register`
4. `POST /api/auth/login`
5. `POST /api/auth/logout`
6. `PATCH /api/auth/password/:id`

## Users

7. `GET /api/users`
8. `GET /api/users/admins`
9. `GET /api/users/customers`
10. `GET /api/users/:id`
11. `POST /api/users`
12. `PATCH /api/users/:id`
13. `DELETE /api/users/:id`

## Tools

14. `GET /api/tools`
15. `GET /api/tools/featured`
16. `GET /api/tools/categories`
17. `GET /api/tools/available`
18. `GET /api/tools/owner/:owner`
19. `GET /api/tools/:id`
20. `POST /api/tools`
21. `PATCH /api/tools/:id`
22. `DELETE /api/tools/:id`
23. `PATCH /api/tools/:id/availability`

## Borrow Requests

24. `GET /api/requests`
25. `GET /api/requests/pending`
26. `GET /api/requests/mine/:borrower`
27. `GET /api/requests/:id`
28. `POST /api/requests`
29. `PATCH /api/requests/:id/status`
30. `PATCH /api/requests/:id/approve`
31. `PATCH /api/requests/:id/reject`
32. `PATCH /api/requests/:id/return`
33. `DELETE /api/requests/:id`

## Favorites

34. `GET /api/favorites/:userName`
35. `POST /api/favorites`
36. `DELETE /api/favorites/:userName/:toolId`

## Reviews

37. `GET /api/reviews/tool/:toolId`
38. `POST /api/reviews`
39. `DELETE /api/reviews/:id`

## Messages

40. `GET /api/messages/inbox/:userName`
41. `POST /api/messages`

## Notifications

42. `GET /api/notifications/:userName`
43. `PATCH /api/notifications/:id/read`

## Admin

44. `GET /api/admin/stats`
45. `POST /api/admin/reset-sample`
