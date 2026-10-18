# Smart Library - Client

Frontend for the **Smart Library System**: a university library platform where students book study seats, borrow books, and track attendance, librarians handle check-ins and returns, and admins manage everything from a dashboard.

Built with **Next.js 14, TypeScript, and Tailwind CSS**.

Backend repo: [smart-library-server](https://github.com/Nur-A-Arfin-Rakib/smart-library-server)

---

## Features

### Student
- Browse and search books, borrow, renew, and pay fines
- Wishlist and book reviews
- Book study seats by zone with live availability
- My Bookings with QR code for check-in
- OTP-based attendance
- Notice board

### Librarian
- Daily summary dashboard
- Manual check-in for bookings
- Process book returns and mark fines as paid

### Admin
- Overview dashboard
- Analytics with charts (occupancy trend, popular zones)
- Users and roles management
- Zones and seats management
- Books management
- Notices

### General
- Email/password login and registration
- Google login (optional)
- Profile page
- Dark / light mode
- Role-based sidebar and protected pages
- Responsive layout

---

## Tech Stack

| Area | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| HTTP | Axios |
| Charts | Recharts |
| Animation | Framer Motion |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Theming | next-themes |
| QR codes | qrcode.react |

---

## Project Structure

```
src/
  app/
    (auth)/        login, register
    admin/         overview, analytics, users, zones, books
    librarian/     summary, check-in, returns
    student/       books, booking, my-bookings, wishlist, attendance
    profile/
  components/      Sidebar, NoticeBoard, shared UI
  context/         Auth context
  lib/             API client (axios)
  types/           TypeScript types
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- The [backend server](https://github.com/Nur-A-Arfin-Rakib/smart-library-server) running locally

### 1. Clone and install

```bash
git clone https://github.com/Nur-A-Arfin-Rakib/smart-library-client.git
cd smart-library-client
npm install
```

### 2. Configure environment

Copy `.env.local.example` to `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Optional: leave blank to hide the "Continue with Google" button.
# Must match GOOGLE_CLIENT_ID in the server's .env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

### 3. Run

```bash
npm run dev      # development at http://localhost:3000
npm run build    # production build
npm start        # run production build
```

> Start the backend first, then the client. The backend's `CLIENT_URL` must match the client's address (default `http://localhost:3000`) or API calls will fail with CORS errors.

---

## User Roles

| Role | Landing area |
|---|---|
| Student | `/student` |
| Librarian | `/librarian` |
| Admin | `/admin` |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Port 3000 already in use | Stop the old process: `taskkill /IM node.exe /F` (Windows), then restart |
| Page stuck on "Loading..." with 404 on `_next/static` | Delete the `.next` folder and restart `npm run dev` |
| API calls fail / CORS error | Check the server is running and `CLIENT_URL` matches the client URL |
| Cannot log in | Confirm `NEXT_PUBLIC_API_URL` points to the running server |

---

## Author

**Nur-A-Arfin Rakib** - [@Nur-A-Arfin-Rakib](https://github.com/Nur-A-Arfin-Rakib)