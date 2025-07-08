# Trendwise

Trendwise is a full-stack web application built with the MERN stack (MongoDB, Express.js, React/Next.js, Node.js). It provides a platform for users to read, comment on, and generate trending articles, with authentication and dashboard features.

## Features

- User authentication (sign in, sign out)
- View trending articles
- Read and comment on articles
- Generate new articles
- User dashboard for managing content
- Responsive UI built with Next.js and Tailwind CSS

## Project Structure

```
trendwise/
  ├── backend/         # Backend (Node.js, Express, MongoDB)
  │   ├── models/         # Mongoose models (User, Article, Comment)
  │   ├── routes/         # API routes (auth, articles, comments, trends)
  │   ├── middleware/     # Custom middleware (e.g., authentication)
  │   ├── services/       # Business logic (content, trending)
  │   ├── scripts/        # Utility scripts (e.g., seed data)
  │   └── server.js       # Entry point for backend server
  ├── frontend/    # Frontend (Next.js, React, Tailwind CSS)
  │   ├── src/
  │   │   ├── app/        # Next.js app directory (pages, API routes)
  │   │   ├── components/ # React components (UI, layout, auth)
  │   │   ├── hooks/      # Custom React hooks
  │   │   ├── lib/        # Utility functions
  │   │   └── types/      # TypeScript types
  │   └── public/         # Static assets
  └── README.md    # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- MongoDB instance (local or cloud)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (e.g., `.env` file for MongoDB URI, JWT secret).
4. Start the backend server:
   ```bash
   npm start
   ```
   The backend will run on the configured port (default: 5000).

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables if needed (e.g., API base URL).
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend will run on [http://localhost:3000](http://localhost:3000).

## Scripts

- **Backend**
  - `npm start` — Start the Express server
  - `npm run seed` — Seed the database with sample data (if implemented)
- **Frontend**
  - `npm run dev` — Start Next.js in development mode
  - `npm run build` — Build the production app
  - `npm start` — Start the production server

## Folder Details

- **backend/models/**: Mongoose schemas for User, Article, Comment.
- **backend/routes/**: Express route handlers for authentication, articles, comments, and trends.
- **backend/services/**: Business logic for content and trending calculations.
- **frontend/src/app/**: Next.js app directory, including API routes and pages.
- **frontend/src/components/**: React components for UI, layout, and authentication.
- **frontend/src/hooks/**: Custom React hooks (e.g., authentication).
- **frontend/src/lib/**: Utility functions.
- **frontend/src/types/**: TypeScript type definitions.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

