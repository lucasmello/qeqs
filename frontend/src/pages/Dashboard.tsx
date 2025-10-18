import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from './Dashboard.module.css';

interface Bar {
  id: number;
  name: string;
  current_votes: number;
}

interface Visit {
  visit_date: string;
  bar_name: string;
}

function Dashboard() {
  const [topVoted, setTopVoted] = useState<Bar[]>([]);
  const [recentVisits, setRecentVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [barsRes, visitsRes] = await Promise.all([
        axios.get('/api/bars'),
        axios.get('/api/visits'),
      ]);

      // Sort bars by votes
      const sortedBars = barsRes.data.bars
        .sort((a: Bar, b: Bar) => b.current_votes - a.current_votes)
        .slice(0, 5);

      setTopVoted(sortedBars);
      setRecentVisits(visitsRes.data.visits.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Dashboard</h1>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>🔥 Top Voted Today</h2>
            <Link to="/voting" className={styles.link}>
              Vote →
            </Link>
          </div>
          <div className={styles.cardContent}>
            {topVoted.length === 0 ? (
              <p className={styles.empty}>No votes yet today!</p>
            ) : (
              <ul className={styles.list}>
                {topVoted.map((bar) => (
                  <li key={bar.id} className={styles.listItem}>
                    <span className={styles.barName}>{bar.name}</span>
                    <span className={styles.votes}>{bar.current_votes} votes</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>📅 Recent Visits</h2>
            <Link to="/calendar" className={styles.link}>
              View all →
            </Link>
          </div>
          <div className={styles.cardContent}>
            {recentVisits.length === 0 ? (
              <p className={styles.empty}>No visits recorded yet!</p>
            ) : (
              <ul className={styles.list}>
                {recentVisits.map((visit, idx) => (
                  <li key={idx} className={styles.listItem}>
                    <span className={styles.barName}>{visit.bar_name}</span>
                    <span className={styles.date}>
                      {new Date(visit.visit_date).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actions}>
          <Link to="/bars" className={styles.actionCard}>
            <span className={styles.actionIcon}>🏪</span>
            <span className={styles.actionText}>Manage Bars</span>
          </Link>
          <Link to="/voting" className={styles.actionCard}>
            <span className={styles.actionIcon}>🗳️</span>
            <span className={styles.actionText}>Vote</span>
          </Link>
          <Link to="/calendar" className={styles.actionCard}>
            <span className={styles.actionIcon}>📆</span>
            <span className={styles.actionText}>Calendar</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

