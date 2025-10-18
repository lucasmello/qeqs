import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Voting.module.css';

interface Bar {
  id: number;
  name: string;
  address?: string;
  description?: string;
  current_votes: number;
}

interface MyVote {
  bar_id: number;
  bar_name: string;
}

function Voting() {
  const [bars, setBars] = useState<Bar[]>([]);
  const [myVotes, setMyVotes] = useState<MyVote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [barsRes, votesRes] = await Promise.all([
        axios.get('/api/bars'),
        axios.get('/api/votes/my-votes'),
      ]);

      // Sort bars by votes
      const sortedBars = barsRes.data.bars.sort(
        (a: Bar, b: Bar) => b.current_votes - a.current_votes
      );

      setBars(sortedBars);
      setMyVotes(votesRes.data.votes);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasVoted = (barId: number) => {
    return myVotes.some((vote) => vote.bar_id === barId);
  };

  const handleVote = async (barId: number) => {
    try {
      if (hasVoted(barId)) {
        await axios.delete(`/api/votes/${barId}`);
      } else {
        await axios.post('/api/votes', { barId });
      }
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error voting');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.voting}>
      <div className={styles.header}>
        <h1 className={styles.title}>Vote for Next Location</h1>
        <p className={styles.subtitle}>
          Choose where you'd like to go next! You can vote for multiple places.
        </p>
      </div>

      {bars.length === 0 ? (
        <div className={styles.empty}>
          <p>No bars available to vote for. Add some bars first!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {bars.map((bar) => {
            const voted = hasVoted(bar.id);
            return (
              <div key={bar.id} className={`${styles.card} ${voted ? styles.voted : ''}`}>
                <div className={styles.cardContent}>
                  <h3 className={styles.barName}>{bar.name}</h3>
                  {bar.address && (
                    <p className={styles.address}>📍 {bar.address}</p>
                  )}
                  {bar.description && (
                    <p className={styles.description}>{bar.description}</p>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.voteCount}>
                    🗳️ <strong>{bar.current_votes}</strong>{' '}
                    {bar.current_votes === 1 ? 'vote' : 'votes'}
                  </div>
                  <button
                    onClick={() => handleVote(bar.id)}
                    className={voted ? styles.unvoteBtn : styles.voteBtn}
                  >
                    {voted ? '✓ Voted' : 'Vote'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {myVotes.length > 0 && (
        <div className={styles.myVotes}>
          <h2 className={styles.sectionTitle}>Your Votes Today</h2>
          <div className={styles.votesList}>
            {myVotes.map((vote) => (
              <span key={vote.bar_id} className={styles.voteBadge}>
                ✓ {vote.bar_name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Voting;

