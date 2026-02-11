# Rebound: Academic Recovery Platform

A full-stack application to help students manage academic recovery through AI-powered task prioritization, stress tracking, and intelligent analytics.

## Features

### Student Dashboard
- Personalized recovery plans based on deadlines and stress levels
- Interactive calendar heatmap showing workload intensity
- Real-time grade impact simulator
- Smart task prioritizer with AI categorization
- Achievement system with badges and XP
- Stress timeline with trend analysis
- Task breakdown for overwhelming assignments

### Teacher Dashboard
- Risk overview of assigned students
- Student intervention tools
- Messaging system for check-ins
- Progress monitoring

### Admin Dashboard
- User management
- System health metrics
- Platform analytics

## Tech Stack

**Frontend**: React, Vite, Tailwind CSS, Recharts  
**Backend**: Node.js, Express, MongoDB (Mongoose)  
**Auth**: JWT with role-based access control

## Setup & Run

### Backend
```bash
cd backend
npm install
npm start
```
Backend runs on http://localhost:5000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173

## Demo Credentials

- **Student**: `student@rebound.edu` / `password123`
- **Teacher**: `teacher@rebound.edu` / `password123`
- **Admin**: `admin@rebound.edu` / `password123`

## Project Structure

```
rebound/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, validation
│   ├── utils/           # Recovery engine, AI utilities
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Dashboard pages
│   │   ├── context/     # Auth context
│   │   └── utils/       # API client
│   └── index.html
└── README.md
```

## Key Features

- **Calendar Heatmap**: Visual workload distribution
- **Grade Simulator**: Interactive "what-if" calculator
- **Smart Prioritizer**: AI-powered task categorization
- **Stress Analytics**: 14-day trend tracking
- **Gamification**: Achievements, streaks, and XP system
- **Mobile Responsive**: Works on all devices

## License

MIT