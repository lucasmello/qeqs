-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bars/Restaurants table
CREATE TABLE IF NOT EXISTS bars (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  description TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visits table (calendar tracking)
CREATE TABLE IF NOT EXISTS visits (
  id SERIAL PRIMARY KEY,
  bar_id INTEGER REFERENCES bars(id) ON DELETE CASCADE NOT NULL,
  visit_date DATE NOT NULL,
  notes TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(bar_id, visit_date)
);

-- Votes table (for voting on next bar)
CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  bar_id INTEGER REFERENCES bars(id) ON DELETE CASCADE NOT NULL,
  vote_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, bar_id, vote_date)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_votes_date ON votes(vote_date);
CREATE INDEX IF NOT EXISTS idx_bars_name ON bars(name);

