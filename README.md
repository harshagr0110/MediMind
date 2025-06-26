# MediMind: Doctor Appointment & Payment Platform

A modern, full-stack web application for seamless doctor appointment booking, management, and payments. Features dedicated Admin and Doctor panels, real-time scheduling, and secure online payments. Built with React (Vite), Node.js/Express, MongoDB, and Tailwind CSS.

---

## 🚀 Features

### 👤 User/Patient
- Browse/search doctors by specialty, location, or name
- Book appointments with real-time availability and instant confirmation
- Secure online payments (Stripe)
- View, reschedule, or cancel upcoming appointments
- Access appointment history and download invoices
- Minimal, modern, mobile-friendly UI

### 🩺 Doctor Panel
- Dashboard with stats (appointments, patients, earnings)
- Manage & complete appointments (accept, reject, mark as done)
- View patient details and appointment history
- Edit profile, set availability, and manage time slots
- Receive notifications for new bookings and cancellations
- Responsive, professional interface

### 🛡️ Admin Panel
- Dashboard with platform stats, charts, and quick actions
- Manage doctors (add, approve, suspend, delete)
- Manage users (view, block, delete)
- Manage articles/blogs (add, view, edit, delete)
- Platform announcements & admin tips
- View and manage all appointments
- Clean, blue-themed, modern UI

### 📝 Articles/Blogs
- Admin can add, view, edit, and delete articles
- Minimal, text-only articles (no images)
- Public blog page for users
- SEO-friendly URLs for articles

### 💳 Payments
- Secure payment integration with Stripe
- Doctors can view earnings and withdrawal history
- Admin can manage payouts and view platform revenue

### 🔒 Security
- JWT-based authentication for all users
- Role-based access control (Admin, Doctor, User)
- Input validation and error handling
- Secure password storage (bcrypt)

### 📱 Responsive Design
- Fully responsive UI for mobile, tablet, and desktop
- Modern, accessible, and user-friendly layouts

---

## 🛠️ Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Axios
- **Admin Panel:** React (Vite), Tailwind CSS
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Authentication:** JWT, bcrypt
- **Payments:** Stripe
- **File Uploads:** Cloudinary



## 📁 Folder Structure

```
doctor/
  admin/      # Admin panel (React + Vite)
  frontend/   # User/doctor-facing frontend (React + Vite)
  backend/    # Node.js/Express API server
```

---

## ⚡ Quickstart

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm
- MongoDB database (local or cloud)

### 2. Clone the Repository
```bash
git clone <repo-url>
cd doctor
```

### 3. Install Dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
cd ../admin && npm install
```

### 4. Environment Variables
- Create `.env` files in `backend`, `frontend`, and `admin` as needed.
- **Backend example:**
  ```env
  MONGODB_URI=your_mongodb_uri
  CLOUDINARY_API_KEY=your_cloudinary_key
  CLOUDINARY_SECRET_KEY=your_cloudinary_secret
  GEMINI_API_KEY=your_gemini_key
  ```
- **Frontend/Admin example:**
  ```env
  VITE_BACKEND_URL=https://your-backend-url.com
  ```

### 5. Running Locally
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

### 6. Building for Production
- **Frontend/Admin:**
  ```bash
  npm run build
  ```
- **Backend:** Deploy to Node.js host (Netlify, Heroku, Render, etc.)


## 🧩 API Overview

### Main Endpoints
- `/api/user` — User registration, login, appointments
- `/api/doctor` — Doctor profile, appointments, availability
- `/api/admin` — Admin actions, doctor/user/article management
- `/api/article` — Public and admin article/blog endpoints

> See backend `routes/` and `controllers/` for full API details.

---

## 🧑‍💻 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## 🙏 Acknowledgements
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Stripe](https://stripe.com/)
- [Cloudinary](https://cloudinary.com/)
