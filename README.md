# BarakaFlow

A modern, AI-powered task management application built for teams. BarakaFlow combines intuitive task management with AI assistance to help teams stay organized and productive.

## 🚀 Live Application

- **Frontend:** [https://smart-to-do-rho.vercel.app](https://smart-to-do-rho.vercel.app)
- **Backend API:** [https://smarttodo-1-in05.onrender.com/api](https://smarttodo-1-in05.onrender.com/api)

## ✨ Features

### Core Functionality
- **User Authentication** - Secure signup and login with JWT tokens
- **Task Management** - Full CRUD operations with a modern table-based interface
- **Task Scheduling** - Set start and end times for tasks
- **Task Status Tracking** - Not started, Pending, Completed, Stuck
- **Task Ownership** - Assign tasks to team members
- **Recurring Tasks** - Daily, weekly, monthly, or yearly recurrence patterns
- **Task Updates** - Conversation-style updates with replies and likes
- **Search & Filter** - Filter by status (All, Completed, Pending, Not Started, Today)

### AI-Powered Features
- **AI Task Suggestions** - Get personalized tips, suggestions, and step-by-step approaches for each task
- **Day Optimization** - AI-powered daily schedule optimization with break recommendations
- **Interactive Chat** - Chat with AI about tasks and get real-time assistance
- **Context-Aware** - AI suggestions consider task title, description, status, timeline, and update history

### User Experience
- **Modern UI** - Clean, minimal design inspired by Monday.com
- **Inline Editing** - Edit tasks directly in the table
- **Real-time Updates** - Instant feedback on all actions
- **Responsive Design** - Works on desktop and mobile devices
- **Empty States** - Welcoming messages when no tasks exist

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS Modules** - Scoped styling
- **OpenAI API** - AI-powered features (GPT-4o-mini)

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database (via Mongoose)
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **MongoDB Atlas** - Cloud database

## 📁 Project Structure

```
SmartToDo/
├── src/                    # Frontend source code
│   ├── api/               # API clients (OpenAI, backend)
│   ├── components/        # React components
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── server/                # Backend source code
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── middleware/   # Express middleware
│   │   └── index.ts       # Server entry point
│   └── package.json
├── package.json           # Frontend dependencies
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kumneger49/SmartToDo.git
   cd SmartToDo
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Set up environment variables**

   **Frontend (.env):**
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_OPENAI_API_KEY=your-openai-api-key
   ```

   **Backend (server/.env):**
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret
   CORS_ORIGIN=http://localhost:5173
   ```

5. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```

6. **Start the frontend development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   - Navigate to `http://localhost:5173`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Tasks (Protected - requires authentication)
- `GET /api/tasks` - Get all user's tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 🔐 Authentication

All task endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Tokens are automatically stored in localStorage after login/signup.

## 🎨 Key Components

- **TaskTable** - Main table view for tasks with inline editing
- **TaskRow** - Individual task row with all editable fields
- **AISuggestionsPanel** - AI-powered task assistance
- **TodayOverview** - Daily optimization suggestions
- **UpdatesModal** - Task updates and conversations
- **TimelineCell** - Date and time picker for task scheduling
- **OwnerCell** - Task ownership assignment
- **StatusCell** - Task status management
- **RecurrencePicker** - Task recurrence selection

## 🚢 Deployment

The application is deployed and live:

- **Frontend:** Deployed on Vercel with automatic deployments from main branch
- **Backend:** Deployed on Render with MongoDB Atlas database
- **Environment Variables:** Configured in respective platforms

## 📄 License

This project was built as a demonstration of full-stack development skills.

## 👤 Author

Built by Kumneger Matewos

---

**Note:** This is a production-ready application with authentication, database persistence, and AI integration. All features are fully functional and deployed.
