# SmartToDo - Task Management Application

A clean, modern, and welcoming task management web application built with React, TypeScript, and Vite.

## Features

- ✅ Full CRUD operations on tasks
- 🔍 Filter tasks by status (All, Active, Completed)
- ✏️ Edit task titles inline
- 🗑️ Delete tasks with confirmation
- 🎨 Beautiful, welcoming UI with smooth animations
- 📱 Responsive design

## Technology Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: CSS Modules
- **State Management**: React useState and useEffect
- **Deployment**: Vercel (pending)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build

To build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── api/           # Mock API layer
├── components/    # React components
├── types/         # TypeScript type definitions
├── styles/        # Global styles
├── App.tsx        # Main application component
└── main.tsx       # Application entry point
```

## Features in Detail

- **Create Tasks**: Add new tasks with a welcoming input field
- **View Tasks**: See all your tasks in a clean, organized list
- **Edit Tasks**: Click the edit button to modify task titles
- **Toggle Completion**: Check/uncheck tasks to mark them as complete
- **Delete Tasks**: Remove tasks with a confirmation dialog
- **Filter Tasks**: Use the dropdown to filter by All, Active, or Completed status
- **Empty State**: Beautiful empty state with encouraging message when no tasks exist

## Development Phases

This project was developed following incremental commits:
1. Project initialization
2. Data model and mock API
3. UI components
4. CRUD functionality
5. UX polish

---

Built with ❤️ and attention to detail
