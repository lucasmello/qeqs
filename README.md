# 🍻 Qeqs - Bar & Restaurant Tracker

A Progressive Web App (PWA) for tracking bar and restaurant visits with friends, with voting capabilities and a visual calendar.

## Features

✨ **User Management**
- User registration and authentication
- JWT-based secure sessions

🏪 **Bar Management**
- Add, edit, and delete bars/restaurants
- Store address and descriptions
- Track who added each location

🗳️ **Voting System**
- Vote for where to go next
- Daily voting (resets each day)
- See real-time vote counts
- Vote for multiple places

📅 **Calendar View**
- Visual calendar showing past visits
- Add notes for each visit
- Track visit history
- See recent visits

🎨 **Modern UI**
- Beautiful dark theme
- Responsive design
- Smooth animations
- Mobile-friendly

📱 **PWA Features**
- Installable on mobile and desktop
- Offline support
- Fast and responsive

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite (build tool)
- React Router (navigation)
- Axios (HTTP client)
- React Calendar (calendar component)
- CSS Modules (styling)
- Vite PWA Plugin (service worker & manifest)

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL (database)
- JWT (authentication)
- Bcrypt (password hashing)
- Zod (validation)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd qeqs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   
   Create a PostgreSQL database:
   ```bash
   createdb qeqs
   ```

4. **Configure environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update with your settings:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/qeqs
   JWT_SECRET=your-super-secret-key-change-this
   PORT=3000
   NODE_ENV=development
   ```

5. **Run database migrations**
   ```bash
   npm run migrate --workspace=backend
   ```

6. **Start the development servers**
   ```bash
   npm run dev
   ```
   
   This will start:
   - Backend API on http://localhost:3000
   - Frontend on http://localhost:5173

### Building for Production

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## Project Structure

```
qeqs/
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   ├── db.ts          # Database connection
│   │   │   ├── migrate.ts     # Migration script
│   │   │   └── schema.sql     # Database schema
│   │   ├── middleware/
│   │   │   └── auth.ts        # Authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.ts        # Auth endpoints
│   │   │   ├── bars.ts        # Bar management
│   │   │   ├── visits.ts      # Visit tracking
│   │   │   └── votes.ts       # Voting system
│   │   └── index.ts           # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.tsx     # App layout with navigation
│   │   ├── context/
│   │   │   └── AuthContext.tsx # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.tsx      # Login page
│   │   │   ├── Register.tsx   # Registration page
│   │   │   ├── Dashboard.tsx  # Dashboard
│   │   │   ├── Bars.tsx       # Bar management
│   │   │   ├── Voting.tsx     # Voting page
│   │   │   └── Calendar.tsx   # Calendar view
│   │   ├── App.tsx            # Main app component
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── public/                # Static assets
│   ├── vite.config.ts         # Vite configuration
│   └── package.json
└── package.json               # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Bars
- `GET /api/bars` - Get all bars
- `GET /api/bars/:id` - Get bar by ID
- `POST /api/bars` - Create new bar
- `PUT /api/bars/:id` - Update bar
- `DELETE /api/bars/:id` - Delete bar

### Votes
- `GET /api/votes/current` - Get today's votes
- `GET /api/votes/my-votes` - Get current user's votes
- `POST /api/votes` - Vote for a bar
- `DELETE /api/votes/:barId` - Remove vote

### Visits
- `GET /api/visits` - Get all visits
- `GET /api/visits/range` - Get visits in date range
- `POST /api/visits` - Create visit
- `PUT /api/visits/:id` - Update visit
- `DELETE /api/visits/:id` - Delete visit

## Database Schema

### Users
- id, username, email, password_hash, created_at

### Bars
- id, name, address, description, created_by, created_at

### Visits
- id, bar_id, visit_date, notes, created_by, created_at

### Votes
- id, user_id, bar_id, vote_date, created_at

## PWA Installation

### Mobile (Android/iOS)
1. Open the app in your mobile browser
2. Tap the "Add to Home Screen" option
3. The app will install and appear as a native app

### Desktop
1. Open the app in Chrome/Edge
2. Click the install icon in the address bar
3. The app will install as a desktop application

## Development Tips

- Hot reload is enabled for both frontend and backend
- Database connection pooling is configured for optimal performance
- All API routes require authentication (except login/register)
- JWT tokens expire after 30 days
- Votes reset daily (tied to current date)

## TODO: PWA Icons

Replace the placeholder icon files in `frontend/public/` with actual icons:
- `pwa-192x192.png` - 192x192px PNG
- `pwa-512x512.png` - 512x512px PNG
- `apple-touch-icon.png` - 180x180px PNG

You can create these using a tool like:
- https://www.pwabuilder.com/imageGenerator
- https://realfavicongenerator.net/

## License

MIT

## Contributing

Feel free to submit issues and pull requests!
