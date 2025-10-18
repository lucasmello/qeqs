# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              React PWA (Frontend)                     │  │
│  │                                                       │  │
│  │  ├─ Pages (Login, Register, Dashboard, etc.)        │  │
│  │  ├─ Components (Layout, etc.)                        │  │
│  │  ├─ Context (AuthContext)                            │  │
│  │  ├─ Axios HTTP Client                                │  │
│  │  └─ Service Worker (PWA)                             │  │
│  │                                                       │  │
│  │  Port: 5173 (dev) / Static Files (prod)             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTP/REST API
                           │ (JSON)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Express.js API (Backend)                    │  │
│  │                                                       │  │
│  │  ├─ Routes                                           │  │
│  │  │  ├─ /api/auth (register, login, me)              │  │
│  │  │  ├─ /api/bars (CRUD operations)                  │  │
│  │  │  ├─ /api/votes (voting system)                   │  │
│  │  │  └─ /api/visits (calendar/visits)                │  │
│  │  │                                                   │  │
│  │  ├─ Middleware                                       │  │
│  │  │  ├─ CORS                                          │  │
│  │  │  ├─ JSON Parser                                   │  │
│  │  │  └─ JWT Authentication                            │  │
│  │  │                                                   │  │
│  │  └─ Validation (Zod schemas)                         │  │
│  │                                                       │  │
│  │  Port: 3000                                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ SQL Queries
                           │ (node-postgres)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                      │  │
│  │                                                       │  │
│  │  ├─ users                                            │  │
│  │  │  └─ id, username, email, password_hash           │  │
│  │  │                                                   │  │
│  │  ├─ bars                                             │  │
│  │  │  └─ id, name, address, description, created_by   │  │
│  │  │                                                   │  │
│  │  ├─ visits                                           │  │
│  │  │  └─ id, bar_id, visit_date, notes, created_by    │  │
│  │  │                                                   │  │
│  │  └─ votes                                            │  │
│  │     └─ id, user_id, bar_id, vote_date               │  │
│  │                                                       │  │
│  │  Port: 5432                                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
App (Root)
├── AuthContext (Global State)
├── Router
    ├── Public Routes
    │   ├── /login → Login Page
    │   └── /register → Register Page
    │
    └── Private Routes (Protected)
        └── Layout
            ├── Navigation Bar
            ├── Main Content
            │   ├── / → Dashboard
            │   ├── /bars → Bars Management
            │   ├── /voting → Voting Interface
            │   └── /calendar → Calendar View
            └── Footer
```

### Backend Routes

```
Express Server
├── Middleware
│   ├── cors()
│   ├── express.json()
│   └── authenticate() [JWT]
│
├── Public Routes
│   └── /api/auth/*
│       ├── POST /register
│       ├── POST /login
│       └── GET /me
│
└── Protected Routes (require auth)
    ├── /api/bars/*
    │   ├── GET / (list all)
    │   ├── GET /:id (get one)
    │   ├── POST / (create)
    │   ├── PUT /:id (update)
    │   └── DELETE /:id (delete)
    │
    ├── /api/votes/*
    │   ├── GET /current (today's votes)
    │   ├── GET /my-votes (user's votes)
    │   ├── POST / (vote)
    │   └── DELETE /:barId (remove vote)
    │
    └── /api/visits/*
        ├── GET / (all visits)
        ├── GET /range (date range)
        ├── POST / (add visit)
        ├── PUT /:id (update)
        └── DELETE /:id (delete)
```

## Data Flow Examples

### 1. User Login Flow

```
User enters credentials
    ↓
Login.tsx validates input
    ↓
AuthContext.login(email, password)
    ↓
POST /api/auth/login
    ↓
Backend validates credentials
    ↓
bcrypt.compare(password, hash)
    ↓
Generate JWT token
    ↓
Return { user, token }
    ↓
Store token in localStorage
    ↓
Set axios default header
    ↓
Navigate to Dashboard
```

### 2. Voting Flow

```
User clicks "Vote" button
    ↓
Voting.tsx calls handleVote()
    ↓
POST /api/votes { barId }
    ↓
authenticate middleware verifies JWT
    ↓
Check if already voted today
    ↓
INSERT INTO votes (user_id, bar_id)
    ↓
Return success
    ↓
Re-fetch votes and bars
    ↓
Update UI with new vote count
```

### 3. Calendar Visit Flow

```
User selects date on calendar
    ↓
Calendar.tsx updates selectedDate
    ↓
User clicks "Add Visit"
    ↓
Modal opens with form
    ↓
User selects bar and adds notes
    ↓
POST /api/visits { barId, visitDate, notes }
    ↓
Check if visit exists for date
    ↓
INSERT INTO visits
    ↓
Return created visit
    ↓
Refresh calendar data
    ↓
Show visit on calendar (dot indicator)
```

## Authentication Flow

```
┌──────────┐     1. Register/Login      ┌──────────┐
│          │ ──────────────────────────> │          │
│  Client  │                             │  Server  │
│          │ <────────────────────────── │          │
└──────────┘     2. JWT Token            └──────────┘
     │
     │ 3. Store token in localStorage
     │
     ▼
┌──────────┐
│ Local    │
│ Storage  │
└──────────┘
     │
     │ 4. Attach to all requests
     │
     ▼
┌──────────┐     Authorization: Bearer   ┌──────────┐
│          │ ──────────────────────────> │          │
│  Client  │        <JWT token>          │  Server  │
│          │                             │          │
└──────────┘                             └──────────┘
                                               │
                                               │ 5. Verify JWT
                                               │
                                               ▼
                                         ┌──────────┐
                                         │ jwt.     │
                                         │ verify() │
                                         └──────────┘
                                               │
                                               │ 6. Extract userId
                                               │
                                               ▼
                                         Process Request
```

## Database Relationships

```
users (1) ──────┐
                │
                ├──> bars (many)
                │    created_by → users.id
                │
                ├──> visits (many)
                │    created_by → users.id
                │
                └──> votes (many)
                     user_id → users.id


bars (1) ───────┐
                │
                ├──> visits (many)
                │    bar_id → bars.id
                │
                └──> votes (many)
                     bar_id → bars.id
```

## Technology Stack Details

### Frontend Tech
- **React 18**: Component-based UI
- **TypeScript**: Static typing
- **Vite**: Fast dev server and build tool
- **React Router v6**: Client-side routing
- **Axios**: HTTP client with interceptors
- **React Calendar**: Calendar UI component
- **CSS Modules**: Scoped styling
- **Vite PWA**: Service worker generation

### Backend Tech
- **Node.js 20**: Runtime environment
- **Express 4**: Web framework
- **TypeScript**: Type-safe backend
- **PostgreSQL 15**: Relational database
- **node-postgres**: Database driver
- **JWT**: Token-based auth
- **Bcrypt**: Password hashing
- **Zod**: Runtime validation
- **CORS**: Cross-origin support
- **dotenv**: Environment config

### Development Tools
- **npm workspaces**: Monorepo management
- **tsx**: TypeScript execution
- **concurrently**: Run multiple commands
- **Docker**: Containerization
- **Docker Compose**: Multi-container setup

## Security Features

1. **Password Security**
   - Bcrypt hashing with salt
   - Passwords never stored in plain text
   - Minimum password length validation

2. **Authentication**
   - JWT tokens with expiration
   - Token verification on every protected route
   - Automatic logout on token expiry

3. **Authorization**
   - Middleware checks on all protected routes
   - User context available in all handlers
   - No sensitive data in JWT payload

4. **Database**
   - Parameterized queries (SQL injection protection)
   - Foreign key constraints
   - Unique constraints on critical fields

5. **Input Validation**
   - Zod schema validation
   - Type checking with TypeScript
   - Client-side and server-side validation

## Deployment Architecture

```
┌─────────────────────────────────────┐
│         Load Balancer / CDN          │
│            (Optional)                │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│        Docker Container              │
│  ┌───────────────────────────────┐  │
│  │   Nginx (Static Files)        │  │
│  │   Serves React Build          │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │   Node.js (Express API)       │  │
│  │   Port 3000                    │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│      PostgreSQL Database             │
│      (Managed or Self-hosted)        │
└─────────────────────────────────────┘
```

## Performance Optimizations

1. **Frontend**
   - Code splitting with React Router
   - Lazy loading of routes
   - Service worker caching
   - Optimized bundle size with Vite

2. **Backend**
   - Database connection pooling
   - Efficient SQL queries with JOINs
   - Indexed columns for fast lookups

3. **Database**
   - Indexes on frequently queried fields
   - Date-based partitioning (future)
   - Query optimization

## Scalability Considerations

- Stateless API (scales horizontally)
- JWT tokens (no server-side sessions)
- Database connection pooling
- Ready for load balancing
- Cacheable static assets
- API can be separated from frontend

## Future Architecture Enhancements

1. **Caching Layer** - Redis for frequently accessed data
2. **Message Queue** - For async tasks (emails, notifications)
3. **Microservices** - Split into auth, bars, votes services
4. **File Storage** - S3 for bar images
5. **Real-time** - WebSockets for live vote updates
6. **Analytics** - Track usage patterns
7. **Monitoring** - Application performance monitoring
8. **CI/CD** - Automated testing and deployment

