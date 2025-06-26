# MediMind Doctor Appointment & Payment Platform

A modern, full-stack web application for doctor appointment booking, payment, and management, featuring dedicated admin and doctor panels. Built with React (Vite), Node.js/Express, and Tailwind CSS.

---

## Features

### User/Patient
- Browse and search for doctors by specialty
- Book appointments with real-time availability
- Secure online payments (Stripe/Razorpay integration)
- View and manage upcoming and past appointments
- Minimal, modern, mobile-friendly UI

### Doctor Panel
- Dashboard with stats (appointments, patients, earnings)
- Manage and complete appointments
- View patient details
- Edit doctor profile and availability
- Responsive, professional interface

### Admin Panel
- Dashboard with platform stats and quick actions
- Manage doctors (add, approve, delete)
- Manage articles/blogs (add, view, delete)
- Platform announcements and admin tips
- Clean, black and white, sharp-cornered UI

### Articles/Blogs
- Admin can add, view, and delete articles
- Minimal, text-only articles (no images)
- Public blog page for users

---

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS
- **Admin Panel:** React (Vite), Tailwind CSS
- **Backend:** Node.js, Express, MongoDB
- **Authentication:** JWT
- **Payments:** Stripe, Razorpay
- **Deployment:** Vercel (recommended), Netlify, or any Node/Static host

---

## Folder Structure

```
doctor/
  admin/      # Admin panel (React + Vite)
  frontend/   # User/doctor-facing frontend (React + Vite)
  backend/    # Node.js/Express API server
```

---

## Setup & Development

### Prerequisites
- Node.js (v18+ recommended)
- npm
- MongoDB database (local or cloud)

### 1. Clone the repository
```bash
git clone <repo-url>
cd doctor
```

### 2. Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
cd ../admin && npm install
```

### 3. Environment Variables
- Create `.env` files in `backend`, `frontend`, and `admin` as needed.
- Example for backend:
  ```env
  MONGODB_URI=your_mongodb_uri
  CLOUDINARY_API_KEY=your_cloudinary_key
  CLOUDINARY_SECRET_KEY=your_cloudinary_secret
  GEMINI_API_KEY=your_gemini_key
  ```
- Example for frontend/admin:
  ```env
  VITE_BACKEND_URL=https://your-backend-url.com
  ```

### 4. Running Locally
- **Backend:**
  ```bash
  cd backend
  npm start
  ```
- **Frontend:**
  ```bash
  cd frontend
  npm run dev
  ```
- **Admin Panel:**
  ```bash
  cd admin
  npm run dev
  ```

### 5. Building for Production
- **Frontend/Admin:**
  ```bash
  npm run build
  ```
- **Backend:** Deploy to Node.js host (Vercel, Heroku, etc.)

---

## Deployment
- Recommended: Deploy frontend, admin, and backend as separate apps/services.
- Vercel/Netlify for frontend/admin (static build output in `dist/`)
- Vercel/Heroku/Render for backend (Node.js server)
- Set environment variables in your deployment platform.

---

## License
MIT

---

## Author
- Built by [Your Name] (replace with your name or org) 