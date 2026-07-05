# 🏠 StayMate — AI-Powered Rent & Flatmate Finder

> **Full-stack MERN application** with AI compatibility scoring, real-time chat, and smart notifications.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-4C5CE7?style=for-the-badge)
![AI](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-08B094?style=for-the-badge)
![Realtime](https://img.shields.io/badge/Realtime-Socket.io-F7F86F?style=flat-square&labelColor=0F172A)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Matching** | Gemini 1.5 Flash computes 0-100 compatibility score for every tenant-listing pair |
| 💬 **Real-time Chat** | Socket.io powered chat with typing indicators, seen receipts, and presence |
| 📧 **Email Notifications** | Nodemailer HTML emails for interest, acceptance, and verification |
| 🔐 **Auth** | JWT + Google OAuth with email verification |
| ☁️ **Image Upload** | Cloudinary with automatic optimization |
| 👤 **3 User Roles** | Owner · Tenant · Admin |
| 📱 **Responsive** | Mobile-first design |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- Google Cloud Console (OAuth)
- Gemini API key
- Gmail SMTP app password

### Setup

#### 1. Clone & Install

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install --legacy-peer-deps
```

#### 2. Environment Variables

**Server** — copy `server/.env.example` to `server/.env` and fill in:
- `MONGODB_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — any random 32+ char string
- `JWT_REFRESH_SECRET` — another random 32+ char string
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` — from Google Cloud Console
- `CLOUDINARY_*` — from Cloudinary dashboard
- `GEMINI_API_KEY` — from Google AI Studio
- `EMAIL_USER` + `EMAIL_PASS` — Gmail + App Password

**Client** — copy `client/.env.example` to `client/.env` (defaults work for local dev)

#### 3. Run Locally

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend  
cd client
npm run dev
```

App runs at: **https://stay-mate-five.vercel.app/**  
API runs at: **https://staymate-backend-vijh.onrender.com**

---

## 📁 Project Structure

```
StayMate/
├── client/          # React 18 + Vite frontend
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Route pages (public/auth/owner/tenant/admin)
│       ├── store/        # Zustand global state
│       ├── hooks/        # Custom React hooks
│       ├── services/     # Axios API client
│       └── index.css     # Design system (CSS variables + components)
└── server/          # Node.js + Express backend
    └── src/
        ├── models/       # Mongoose schemas
        ├── controllers/  # Business logic
        ├── routes/       # Express routes
        ├── middlewares/  # Auth, role, upload
        ├── services/     # AI, email, socket
        └── config/       # DB, Cloudinary, Passport, Socket.io
```

---

## 🎨 Color Palette

| Token | Color | Usage |
|---|---|---|
| Primary | `#4C5CE7` | Buttons, CTAs, active states |
| Secondary | `#08B094` | Match badges, success states |
| Accent | `#F7F86F` | Tags, highlights |
| Dark | `#0F172A` | Navbar, dark sections |

---

## 🔗 Tech Stack

**Frontend**: React 18 · Vite · React Router v6 · Zustand · Axios · Socket.io-client · Framer Motion · Lucide React  
**Backend**: Node.js · Express · Mongoose · Socket.io · JWT · Passport.js  
**Database**: MongoDB Atlas  
**AI**: Google Gemini 1.5 Flash  
**Storage**: Cloudinary  
**Email**: Nodemailer (Gmail SMTP)  
**Auth**: JWT + Google OAuth 2.0  

---

## 🌐 Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| Images | Cloudinary |

---

*Built with ❤️ as part of the Unthinkable full-stack portfolio.*
