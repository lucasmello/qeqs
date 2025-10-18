# Quick Start Guide

Get Qeqs up and running in 5 minutes!

## Prerequisites

- PostgreSQL installed and running
- Node.js v18+ installed
- npm or yarn

## Option 1: Using the Setup Script (Recommended)

```bash
# Make the script executable (if not already)
chmod +x setup.sh

# Run the setup
./setup.sh

# Start the app
npm run dev
```

## Option 2: Using Docker for Database

If you don't have PostgreSQL installed locally:

```bash
# Start PostgreSQL in Docker
docker-compose up -d

# Wait a few seconds for the database to start

# Install dependencies
npm install

# Run migrations
npm run migrate --workspace=backend

# Start the app
npm run dev
```

## Option 3: Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Create PostgreSQL database
createdb qeqs

# 3. Configure environment variables
# Edit .env with your database credentials
# (DATABASE_URL, JWT_SECRET, etc.)

# 4. Run database migrations
npm run migrate --workspace=backend

# 5. Start development servers
npm run dev
```

## Access the App

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/health

## First Steps

1. **Register an account** at http://localhost:5173/register
2. **Add some bars** in the Bars section
3. **Vote** for where to go next
4. **Track visits** using the calendar

## Default Database Credentials

If using the default `.env` file:
- Database: `qeqs`
- User: `postgres`
- Password: `postgres`
- Host: `localhost`
- Port: `5432`

## Troubleshooting

### Database Connection Issues

If you see "database connection failed":
1. Make sure PostgreSQL is running: `pg_isready`
2. Check your DATABASE_URL in `.env`
3. Verify the database exists: `psql -l | grep qeqs`

### Port Already in Use

If port 3000 or 5173 is already in use:
1. Stop the process using that port, or
2. Change the PORT in `.env` (backend) or `vite.config.ts` (frontend)

### Migration Errors

If migrations fail:
1. Drop the database: `dropdb qeqs`
2. Recreate it: `createdb qeqs`
3. Run migrations again: `npm run migrate --workspace=backend`

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check out [CONTRIBUTING.md](./CONTRIBUTING.md) to contribute
- Customize the PWA icons in `frontend/public/`

Happy tracking! 🍻

